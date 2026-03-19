import { NextRequest, NextResponse } from 'next/server';
import { deleteUserCompletely } from '@/lib/firebase/deleteUser';

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ success: false, error: 'Missing uid' }, { status: 400 });
    await deleteUserCompletely(uid);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error deleting user' }, { status: 500 });
  }
}
