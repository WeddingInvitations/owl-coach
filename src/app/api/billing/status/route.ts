import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured } from '@/lib/stripe/stripe';

/**
 * GET /api/billing/status
 * Check if Stripe is properly configured
 */
export async function GET(request: NextRequest) {
  const configured = isStripeConfigured();
  
  const status = {
    stripe: {
      configured,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not set',
    },
    environment: process.env.NODE_ENV,
  };

  if (!configured) {
    return NextResponse.json({
      success: false,
      error: 'Stripe is not configured',
      details: status,
      message: 'Please configure STRIPE_SECRET_KEY in Cloud Run environment variables'
    }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    message: 'Stripe is configured correctly',
    details: status
  });
}
