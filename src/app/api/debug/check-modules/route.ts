import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import adminApp from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    
    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }
    
    // Read directly from Firestore without any processing
    const db = getFirestore(adminApp);
    const docRef = db.collection('trainingPlans').doc(planId);
    const snap = await docRef.get();
    
    if (!snap.exists) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    const rawData = snap.data();
    
    return NextResponse.json({
      success: true,
      debug: {
        docId: snap.id,
        exists: snap.exists,
        allFields: Object.keys(rawData || {}),
        previewModules: {
          exists: 'previewModules' in (rawData || {}),
          type: Array.isArray(rawData?.previewModules) ? 'array' : typeof rawData?.previewModules,
          length: Array.isArray(rawData?.previewModules) ? rawData.previewModules.length : 'N/A',
          data: rawData?.previewModules,
        },
        fullModules: {
          exists: 'fullModules' in (rawData || {}),
          type: Array.isArray(rawData?.fullModules) ? 'array' : typeof rawData?.fullModules,
          length: Array.isArray(rawData?.fullModules) ? rawData.fullModules.length : 'N/A',
          data: rawData?.fullModules,
        },
      },
      rawData: rawData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
