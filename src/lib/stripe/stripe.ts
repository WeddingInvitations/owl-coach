import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// Check if Stripe is properly configured
if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('REEMPLAZA')) {
  console.error('⚠️  STRIPE_SECRET_KEY is not configured in .env.local');
  console.error('📝 Get your keys from: https://dashboard.stripe.com/test/apikeys');
  console.error('🔧 Update STRIPE_SECRET_KEY in your .env.local file');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET.includes('REEMPLAZA')) {
  console.warn('⚠️  STRIPE_WEBHOOK_SECRET is not configured');
  console.warn('🔧 For local development, run: stripe listen --forward-to localhost:3000/api/billing/webhook');
}

export const isStripeConfigured = (): boolean => {
  return !!(
    STRIPE_SECRET_KEY && 
    !STRIPE_SECRET_KEY.includes('REEMPLAZA') &&
    STRIPE_SECRET_KEY.startsWith('sk_')
  );
};
