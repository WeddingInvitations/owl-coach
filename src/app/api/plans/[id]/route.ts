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
      const token = authHeader.replace('Bearer ', '');
      const userProfile = await authService.getUserProfile(token);
      if (userProfile) {
        userId = userProfile.id;
        userRole = userProfile.role as any;
      }
    }

    let plan;
    
    if (includeContent && userId && userRole) {
      // Include content based on user permissions
      plan = await plansService.getPlanWithAccessControl(id, userId, userRole as any);
    } else {
      // Public access - no full content
      plan = await plansService.getPlanById(id);
      if (plan) {
        plan.fullModules = []; // Hide full content for unauthenticated users
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

    const userId = authHeader.replace('Bearer ', '');
    const userProfile = await authService.getUserProfile(userId);
    
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

    const userId = authHeader.replace('Bearer ', '');
    const userProfile = await authService.getUserProfile(userId);
    
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