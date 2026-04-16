import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// Check if Stripe is properly configured
const isConfigured = !!(STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('REEMPLAZA') && STRIPE_SECRET_KEY.startsWith('sk_'));

if (!isConfigured && process.env.NODE_ENV !== 'production') {
  console.error('⚠️  STRIPE_SECRET_KEY is not configured in .env.local');
  console.error('📝 Get your keys from: https://dashboard.stripe.com/test/apikeys');
  console.error('🔧 Update STRIPE_SECRET_KEY in your .env.local file');
}

// Use a dummy key during build to prevent errors
const apiKey = isConfigured ? STRIPE_SECRET_KEY : 'sk_test_dummy_key_for_build';

export const stripe = new Stripe(apiKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET.includes('REEMPLAZA')) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET is not configured');
    console.warn('🔧 For local development, run: stripe listen --forward-to localhost:3000/api/billing/webhook');
  }
}

export const isStripeConfigured = (): boolean => {
  return isConfigured;
};
