import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { purchasesRepository } from '@/server/repositories/PurchasesRepository';
import { entitlementsRepository } from '@/server/repositories/EntitlementsRepository';

/**
 * GET /api/debug/user-purchases
 * Debug endpoint to check user's purchases and entitlements
 * Add ?userId=xxx or it will use authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // If no userId provided, use authenticated user
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized - provide userId param or auth token' },
          { status: 401 }
        );
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    }

    // Get all purchases for this user
    const purchases = await purchasesRepository.getByUser(userId);
    
    // Get all entitlements for this user
    const entitlements = await entitlementsRepository.getByUser(userId);

    // Get unlocked plan IDs
    const unlockedPlanIds = await entitlementsRepository.getUserUnlockedPlans(userId);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        purchases: purchases.map(p => ({
          id: p.id,
          productType: p.productType,
          productId: p.productId,
          status: p.status,
          amount: p.amount,
          paymentProvider: p.paymentProvider,
          createdAt: p.createdAt,
        })),
        entitlements: entitlements.map(e => ({
          id: e.id,
          productType: e.productType,
          productId: e.productId,
          unlockedPlanIds: e.unlockedPlanIds,
          sourcePurchaseId: e.sourcePurchaseId,
          createdAt: e.createdAt,
        })),
        unlockedPlanIds,
        summary: {
          totalPurchases: purchases.length,
          completedPurchases: purchases.filter(p => p.status === 'completed').length,
          totalEntitlements: entitlements.length,
          totalUnlockedPlans: unlockedPlanIds.length,
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching user purchases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user purchases' },
      { status: 500 }
    );
  }
}
