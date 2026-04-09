import { NextRequest, NextResponse } from 'next/server';
import { plansService } from '@/server/services/PlansService';
import { authService } from '@/server/services/AuthService';
import { updateTrainingPlanSchema } from '@/lib/validations/plans';

interface RouteParams {
  params: { id: string };
}

// Helper function to ensure plan has proper module arrays
function ensurePlanModules(plan: any): any {
  console.log('📋 ensurePlanModules - Input:', {
    id: plan.id,
    previewModules: Array.isArray(plan.previewModules) ? plan.previewModules.length : typeof plan.previewModules,
    fullModules: Array.isArray(plan.fullModules) ? plan.fullModules.length : typeof plan.fullModules,
  });
  
  // Ensure arrays exist even if empty
  if (!Array.isArray(plan.previewModules)) {
    plan.previewModules = [];
  }
  if (!Array.isArray(plan.fullModules)) {
    plan.fullModules = [];
  }
  
  // Normalize module fields (convert 'name' to 'title' if needed)
  plan.previewModules = plan.previewModules.map((mod: any) => ({
    ...mod,
    title: mod.title || mod.name || 'Sin título',
  }));
  
  plan.fullModules = plan.fullModules.map((mod: any) => ({
    ...mod,
    title: mod.title || mod.name || 'Sin título',
  }));
  
  console.log('📦 ensurePlanModules - Output:', {
    planId: plan.id,
    planTitle: plan.title,
    previewModules: plan.previewModules.length,
    fullModules: plan.fullModules.length,
  });
  
  if (plan.fullModules.length > 0) {
    console.log('First fullModule detail:', {
      id: plan.fullModules[0].id,
      title: plan.fullModules[0].title,
      description: plan.fullModules[0].description,
      exercises: plan.fullModules[0].exercises?.length || 0,
      estimatedDuration: plan.fullModules[0].estimatedDuration || 0,
    });
  }
  
  return plan;
}

// GET /api/plans/[id] - Get plan by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('includeContent') === 'true';
    
    let userId: string | undefined;
    let userRole: string | undefined;
    
    // Check if user is authenticated (optional for public access)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // Verifica el token de Firebase y extrae UID
      const admin = (await import('firebase-admin')).default;
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      try {
        const decoded = await admin.auth().verifyIdToken(authHeader.replace('Bearer ', ''));
        const { uid } = decoded;
        const userProfile = await authService.getUserProfile(uid);
        if (userProfile) {
          userId = userProfile.id;
          userRole = userProfile.role as any;
          
          // Debug: Log user info
          console.log('GET plan - User authenticated:', { userId, userRole });
        }
      } catch (err) {
        // Invalid token - continue as unauthenticated user
        console.log('GET plan - Authentication failed:', err);
      }
    }

    // Helper: lookup by ID first, then fall back to slug
    const resolvedPlan = async (planIdOrSlug: string) => {
      const byId = await plansService.getPlanById(planIdOrSlug);
      if (byId) return byId;
      return await plansService.getPlanBySlug(planIdOrSlug);
    };

    let plan;
    
    console.log('🛣️ Routing decision:', { userId, userRole, includeContent });
    
    // For coaches and owners editing, always include full content
    if (userId && (userRole === 'coach' || userRole === 'owner')) {
      console.log('🛣️ Taking COACH/OWNER route');
      const resolved = await resolvedPlan(id);
      if (resolved) {
        plan = resolved; // Give full access to coaches/owners
        console.log('GET plan - Returning full plan to coach/owner:', {
          previewModules: resolved.previewModules?.length || 0,
          fullModules: resolved.fullModules?.length || 0,
        });
      }
    } else if (includeContent && userId && userRole) {
      console.log('🛣️ Taking AUTHENTICATED USER route');
      // Resolve document first so we have the real Firestore ID
      const resolved = await resolvedPlan(id);
      if (resolved) {
        // For plan detail view, always show modules (user can see what's in the plan)
        // Just check access to mark if user owns it
        const hasAccess = await plansService.canUserAccessPlan(userId, resolved.id, userRole as any);
        plan = resolved;
        
        console.log('📊 User viewing plan detail:', {
          hasAccess,
          fullModules: plan.fullModules?.length || 0,
        });
      }
    } else {
      console.log('🛣️ Taking PUBLIC ACCESS route');
      // Public access - show module list but users can't access training content
      plan = await resolvedPlan(id);
      if (plan) {
        console.log('📦 Public view - showing modules but marking as locked:', {
          fullModules: plan.fullModules?.length || 0,
        });
        // Keep modules visible so users can see what's included in the plan
        // The frontend will handle showing them as locked
      }
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Ensure plan has proper module arrays
    const processedPlan = ensurePlanModules(plan);
    
    console.log('✅ Final response to frontend:', {
      id: processedPlan.id,
      previewModules: processedPlan.previewModules?.length || 0,
      fullModules: processedPlan.fullModules?.length || 0,
    });

    return NextResponse.json({
      success: true,
      data: processedPlan
    });
    
  } catch (error: any) {
    console.error('Get plan error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id] - Update plan
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verifica el token de Firebase y extrae UID
    const admin = (await import('firebase-admin')).default;
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(authHeader.replace('Bearer ', ''));
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const { uid } = decoded;
    
    const userProfile = await authService.getUserProfile(uid);
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Debug: Log what we received
    console.log('Received update data:', {
      previewModules: body.previewModules,
      fullModules: body.fullModules,
    });
    
    const validatedData = updateTrainingPlanSchema.parse(body);
    
    // Debug: Log what's validated
    console.log('Validated data:', {
      previewModules: validatedData.previewModules,
      fullModules: validatedData.fullModules,
    });
    
    const updatedPlan = await plansService.updatePlan(
      id,
      validatedData,
      userProfile.id,
      userProfile.role
    );

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Plan updated successfully'
    });
    
  } catch (error: any) {
    console.error('Update plan error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] - Delete plan
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verifica el token de Firebase y extrae UID
    const admin = (await import('firebase-admin')).default;
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(authHeader.replace('Bearer ', ''));
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const { uid } = decoded;
    
    const userProfile = await authService.getUserProfile(uid);
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await plansService.deletePlan(id, userProfile.id, userProfile.role);

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Delete plan error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}