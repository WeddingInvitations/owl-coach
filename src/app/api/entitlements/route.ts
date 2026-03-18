import { NextRequest, NextResponse } from 'next/server';
import { entitlementsService } from '@/server/services/EntitlementsService';
import { authService } from '@/server/services/AuthService';

// GET /api/entitlements - Get user entitlements and library
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const groupId = searchParams.get('groupId');
    
    if (planId) {
      // Check specific plan access
      const hasAccess = await entitlementsService.canAccessPlanContent(
        userId,
        planId,
        userProfile.role
      );
      
      return NextResponse.json({
        success: true,
        data: { hasAccess, planId }
      });
    }
    
    if (groupId) {
      // Check specific group access
      const hasAccess = await entitlementsService.canAccessGroupContent(
        userId,
        groupId,
        userProfile.role
      );
      
      return NextResponse.json({
        success: true,
        data: { hasAccess, groupId }
      });
    }

    // Get full user library
    const library = await entitlementsService.getUserLibrary(userId);
    const summary = await entitlementsService.getUserAccessSummary(userId);

    return NextResponse.json({
      success: true,
      data: {
        ...library,
        summary
      }
    });
    
  } catch (error: any) {
    console.error('Get entitlements error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}