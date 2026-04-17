import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/services/PaymentService';
import { admin } from '@/lib/firebase-admin';
import { ProductType } from '@/types/purchase';

/**
 * POST /api/billing/create-checkout-session
 * Create a Stripe Checkout Session for purchasing a plan or group
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { productType, productId } = body;

    console.log(`[Checkout] User ${userId} attempting to purchase ${productType}:${productId}`);

    // Validate input
    if (!productType || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields: productType and productId' },
        { status: 400 }
      );
    }

    if (productType !== 'plan' && productType !== 'group') {
      return NextResponse.json(
        { error: 'Invalid productType. Must be "plan" or "group"' },
        { status: 400 }
      );
    }

    // Create checkout session
    const checkoutUrl = await paymentService.createCheckoutSession(
      userId,
      productType as ProductType,
      productId
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    console.log(`[Checkout] Session created successfully for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        url: checkoutUrl
      }
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: request.headers.get('authorization') ? 'authenticated' : 'not authenticated'
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        success: false 
      },
      { status: error.message?.includes('not configured') ? 503 : 500 }
    );
  }
}
