import { NextRequest, NextResponse } from 'next/server';
import { plansService } from '@/server/services/PlansService';
import { authService } from '@/server/services/AuthService';
import { updateTrainingPlanSchema } from '@/lib/validations/plans';

interface RouteParams {
  params: { id: string };
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
        }
      } catch (err) {
        // Invalid token - continue as unauthenticated user
      }
    }

    // Helper: lookup by ID first, then fall back to slug
    const resolvedPlan = async (planIdOrSlug: string) => {
      const byId = await plansService.getPlanById(planIdOrSlug);
      if (byId) return byId;
      return await plansService.getPlanBySlug(planIdOrSlug);
    };

    let plan;
    
    if (includeContent && userId && userRole) {
      // Resolve document first so we have the real Firestore ID
      const resolved = await resolvedPlan(id);
      if (resolved) {
        plan = await plansService.getPlanWithAccessControl(resolved.id, userId, userRole as any);
      }
    } else {
      // Public access - hide exercises content
      plan = await resolvedPlan(id);
      if (plan) {
        plan = { ...plan, exercises: [] };
      }
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan
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
    const validatedData = updateTrainingPlanSchema.parse(body);
    
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