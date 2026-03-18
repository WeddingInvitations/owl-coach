import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/firebase/auth';
import { authService } from '@/server/services/AuthService';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = loginSchema.parse(body);
    
    // Attempt to login user with Firebase
    const { user, error } = await loginUser(validatedData.email, validatedData.password);
    
    if (error || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: error || 'Login failed' 
        },
        { status: 401 }
      );
    }

    // Get or create user profile
    const userProfile = await authService.ensureUserExists(
      user.uid,
      user.email || '',
      user.displayName || ''
    );

    return NextResponse.json({
      success: true,
      data: {
        user: authService.toAuthUser(userProfile),
        token: await user.getIdToken(),
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}