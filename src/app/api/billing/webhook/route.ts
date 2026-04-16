import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/stripe';
import { paymentService } from '@/server/services/PaymentService';
import Stripe from 'stripe';

/**
 * POST /api/billing/webhook
 * Stripe webhook endpoint to handle payment events
 * 
 * IMPORTANT: This endpoint must be configured in Stripe Dashboard
 * Events to listen for: checkout.session.completed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✓ Received webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Processing checkout.session.completed:', session.id);
        
        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          try {
            await paymentService.handleCheckoutCompleted(session);
            console.log(`✓ Successfully processed payment for session ${session.id}`);
          } catch (error: any) {
            console.error('Error handling checkout completed:', error);
            // Return 500 so Stripe retries the webhook
            return NextResponse.json(
              { error: 'Failed to process checkout' },
              { status: 500 }
            );
          }
        } else {
          console.log(`Payment not completed for session ${session.id}, status: ${session.payment_status}`);
        }
        
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        // Optionally handle expired sessions
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session payment failed:', session.id);
        
        try {
          await paymentService.handleCheckoutFailed(session);
        } catch (error: any) {
          console.error('Error handling failed checkout:', error);
        }
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks (we need the raw body)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
