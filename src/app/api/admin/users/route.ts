import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Endpoint deprecated. Use Firestore client access with security rules.' },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Endpoint deprecated. Use Firestore client access with security rules.' },
    { status: 403 }
  );
}