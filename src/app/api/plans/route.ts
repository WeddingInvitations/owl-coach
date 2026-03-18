import { NextRequest, NextResponse } from 'next/server';
import { plansService } from '@/server/services/PlansService';
import { authService } from '@/server/services/AuthService';
import { createTrainingPlanSchema } from '@/lib/validations/plans';
import { requireCoach } from '@/lib/permissions/guards';

// GET /api/plans - Get all published plans or plans by coach
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');
    
    let plans;
    
    if (coachId) {
      plans = await plansService.getPlansByCoach(coachId);
    } else if (search) {
      plans = await plansService.searchPlans(search);
    } else if (difficulty) {
      plans = await plansService.getPlansByDifficulty(difficulty);
    } else {
      plans = await plansService.getPublishedPlans();
    }

    return NextResponse.json({
      success: true,
      data: plans
    });
    
  } catch (error: any) {
    console.error('Get plans error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // For now, we'll assume the token is valid and contains the user ID
    // In production, you'd verify the Firebase token
    const userId = authHeader.replace('Bearer ', '');
    
    const userProfile = await authService.getUserProfile(userId);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    requireCoach(userProfile.role);

    const body = await request.json();
    const validatedData = createTrainingPlanSchema.parse(body);
    
    // Asegura que coverImage siempre sea string
    const fixedData = {
      ...validatedData,
      coverImage: typeof validatedData.coverImage === 'string' ? validatedData.coverImage : '',
      fullModules: Array.isArray(validatedData.fullModules)
        ? validatedData.fullModules.filter((m) => typeof m === 'object' && m !== null && 'id' in m)
        : [],
    };
    const planId = await plansService.createPlan(
      fixedData,
      userProfile.id,
      userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`,
      userProfile.role
    );

    const createdPlan = await plansService.getPlanById(planId);

    return NextResponse.json({
      success: true,
      data: createdPlan,
      message: 'Plan created successfully'
    });
    
  } catch (error: any) {
    console.error('Create plan error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}