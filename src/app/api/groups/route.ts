import { NextRequest, NextResponse } from 'next/server';
import { groupsService } from '@/server/services/GroupsService';
import { authService } from '@/server/services/AuthService';
import { createTrainingPlanGroupSchema } from '@/lib/validations/groups';
import { requireCoach } from '@/lib/permissions/guards';

// GET /api/groups - Get all published groups or groups by coach
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const search = searchParams.get('search');
    
    let groups;
    
    if (coachId) {
      groups = await groupsService.getGroupsByCoach(coachId);
    } else if (search) {
      groups = await groupsService.searchGroups(search);
    } else {
      groups = await groupsService.getPublishedGroups();
    }

    return NextResponse.json({
      success: true,
      data: groups
    });
    
  } catch (error: any) {
    console.error('Get groups error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
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

    requireCoach(userProfile.role);

    const body = await request.json();
    const validatedData = createTrainingPlanGroupSchema.parse(body);
    
    const groupId = await groupsService.createGroup(
      validatedData,
      userProfile.id,
      userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`,
      userProfile.role
    );

    const createdGroup = await groupsService.getGroupById(groupId);

    return NextResponse.json({
      success: true,
      data: createdGroup,
      message: 'Group created successfully'
    });
    
  } catch (error: any) {
    console.error('Create group error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}