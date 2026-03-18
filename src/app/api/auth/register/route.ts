import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/firebase/auth';
import { authService } from '@/server/services/AuthService';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = registerSchema.parse(body);
    
    // Attempt to register user with Firebase
    const { user, error } = await registerUser(
      validatedData.email,
      validatedData.password,
      validatedData.displayName
    );
    
    if (error || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: error || 'Registration failed' 
        },
        { status: 400 }
      );
    }

    // Create user profile in Firestore
    // Split displayName into firstName and lastName
    const nameParts = validatedData.displayName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userProfile = await authService.createUserProfile(
      user.uid,
      user.email || '',
      firstName,
      lastName
    );

    return NextResponse.json({
      success: true,
      data: {
        user: authService.toAuthUser(userProfile),
        token: await user.getIdToken(),
      },
      message: 'Account created successfully'
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}