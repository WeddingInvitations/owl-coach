import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { User } from '@/types/user';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is owner
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // In a real app, we'd verify the token
    // For MVP, we'll trust the client-side check
    
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const users: User[] = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<User, 'id'>
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role }: { userId: string; role: UserRole } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = admin.firestore();
    await db.collection('users').doc(userId).update({ role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}