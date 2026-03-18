import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { success, error } = await logoutUser();
    
    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}