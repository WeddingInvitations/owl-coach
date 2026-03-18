import { NextRequest, NextResponse } from 'next/server';
import { purchasesService } from '@/server/services/PurchasesService';
import { authService } from '@/server/services/AuthService';
import { createPurchaseSchema } from '@/lib/validations/purchases';

// GET /api/purchases - Get user purchases
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
    const status = searchParams.get('status');
    
    let purchases;
    
    if (status === 'completed') {
      purchases = await purchasesService.getUserCompletedPurchases(userId);
    } else {
      purchases = await purchasesService.getUserPurchases(userId);
    }

    return NextResponse.json({
      success: true,
      data: purchases
    });
    
  } catch (error: any) {
    console.error('Get purchases error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/purchases - Create and process purchase
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createPurchaseSchema.parse({
      ...body,
      userId: userProfile.id
    });
    
    // Check if user can purchase this product
    const canPurchase = await purchasesService.canUserPurchaseProduct(
      validatedData.userId,
      validatedData.productType,
      validatedData.productId
    );

    if (!canPurchase.canPurchase) {
      return NextResponse.json(
        { success: false, error: canPurchase.reason },
        { status: 400 }
      );
    }

    // Create purchase
    const purchaseId = await purchasesService.createPurchase(validatedData);
    
    // Process payment (simulated)
    const completedPurchase = await purchasesService.processPurchase(purchaseId);

    return NextResponse.json({
      success: true,
      data: completedPurchase,
      message: 'Purchase completed successfully'
    });
    
  } catch (error: any) {
    console.error('Create purchase error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}