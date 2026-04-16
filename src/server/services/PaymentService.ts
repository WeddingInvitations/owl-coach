import { stripe, isStripeConfigured } from '@/lib/stripe/stripe';
import { purchasesRepository } from '@/server/repositories/PurchasesRepository';
import { entitlementsRepository } from '@/server/repositories/EntitlementsRepository';
import { TrainingPlansRepository } from '@/server/repositories/TrainingPlansRepository';
import { TrainingPlanGroupsRepository } from '@/server/repositories/TrainingPlanGroupsRepository';
import { Purchase, ProductType } from '@/types/purchase';
import { CreateUserEntitlementData } from '@/types/entitlement';
import Stripe from 'stripe';

const plansRepository = new TrainingPlansRepository();
const groupsRepository = new TrainingPlanGroupsRepository();

export class PaymentService {
  /**
   * Create a Stripe Checkout Session for a product purchase
   */
  async createCheckoutSession(
    userId: string,
    productType: ProductType,
    productId: string
  ): Promise<string> {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      throw new Error(
        'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env.local file. ' +
        'Get your keys from: https://dashboard.stripe.com/test/apikeys'
      );
    }
    // Validate and get product data
    const productData = await this.getProductData(productType, productId);
    
    if (!productData) {
      throw new Error(`Product not found: ${productType} ${productId}`);
    }

    if (!productData.isPublished) {
      throw new Error('Product is not published');
    }

    // Check if user already purchased this product
    const hasPurchased = await purchasesRepository.hasUserPurchased(
      userId,
      productType,
      productId
    );

    if (hasPurchased) {
      throw new Error('You already have purchased this product');
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: productData.currency.toLowerCase(),
            product_data: {
              name: productData.title,
              description: productData.shortDescription,
              images: productData.coverImage ? [productData.coverImage] : undefined,
            },
            unit_amount: Math.round(productData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/plans/${productData.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/plans/${productData.slug}?payment=cancelled`,
      metadata: {
        userId,
        productType,
        productId,
      },
      client_reference_id: userId,
    });

    return session.url || '';
  }

  /**
   * Handle successful checkout session
   * Creates purchase and entitlement records
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { userId, productType, productId } = session.metadata as {
      userId: string;
      productType: ProductType;
      productId: string;
    };

    if (!userId || !productType || !productId) {
      throw new Error('Missing required metadata in checkout session');
    }

    // Get product data for price and currency
    const productData = await this.getProductData(productType, productId);
    
    if (!productData) {
      throw new Error(`Product not found: ${productType} ${productId}`);
    }

    // Create purchase record
    const purchaseId = `purchase_${Date.now()}_${userId}`;
    await purchasesRepository.createPurchase(purchaseId, {
      userId,
      productType,
      productId,
      amount: productData.price,
      currency: productData.currency,
      paymentProvider: 'stripe',
    });

    // Update purchase with Stripe data and mark as completed
    await purchasesRepository.update(purchaseId, {
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      status: 'completed',
    });

    // Determine which plans to unlock
    const unlockedPlanIds = await this.getUnlockedPlanIds(productType, productId);

    // Create entitlement
    const entitlementId = `entitlement_${Date.now()}_${userId}`;
    const entitlementData: CreateUserEntitlementData = {
      userId,
      productType,
      productId,
      unlockedPlanIds,
      sourcePurchaseId: purchaseId,
    };

    await entitlementsRepository.createEntitlement(entitlementId, entitlementData);

    console.log(`✓ Checkout completed for user ${userId}: ${productType} ${productId}`);
  }

  /**
   * Get product data (plan or group)
   */
  private async getProductData(
    productType: ProductType,
    productId: string
  ): Promise<{
    title: string;
    slug: string;
    shortDescription: string;
    coverImage: string;
    price: number;
    currency: 'EUR' | 'USD';
    isPublished: boolean;
  } | null> {
    if (productType === 'plan') {
      const plan = await plansRepository.getById(productId);
      if (!plan) return null;
      
      return {
        title: plan.title,
        slug: plan.slug,
        shortDescription: plan.shortDescription,
        coverImage: plan.coverImage,
        price: plan.price,
        currency: plan.currency,
        isPublished: plan.isPublished,
      };
    } else if (productType === 'group') {
      const group = await groupsRepository.getById(productId);
      if (!group) return null;
      
      return {
        title: group.title,
        slug: group.slug,
        shortDescription: group.shortDescription,
        coverImage: group.coverImage,
        price: group.price,
        currency: group.currency,
        isPublished: group.isPublished,
      };
    }

    return null;
  }

  /**
   * Get plan IDs that should be unlocked for a product
   */
  private async getUnlockedPlanIds(
    productType: ProductType,
    productId: string
  ): Promise<string[]> {
    if (productType === 'plan') {
      // Single plan purchase unlocks only that plan
      return [productId];
    } else if (productType === 'group') {
      // Group purchase unlocks all included plans
      const group = await groupsRepository.getById(productId);
      if (!group) {
        throw new Error(`Group not found: ${productId}`);
      }
      return group.includedPlanIds;
    }

    return [];
  }

  /**
   * Handle failed or cancelled checkout
   */
  async handleCheckoutFailed(session: Stripe.Checkout.Session): Promise<void> {
    const { userId, productType, productId } = session.metadata as {
      userId: string;
      productType: ProductType;
      productId: string;
    };

    if (!userId || !productType || !productId) {
      return;
    }

    // Get product data
    const productData = await this.getProductData(productType, productId);
    if (!productData) return;

    // Create failed purchase record for tracking
    const purchaseId = `purchase_failed_${Date.now()}_${userId}`;
    await purchasesRepository.createPurchase(purchaseId, {
      userId,
      productType,
      productId,
      amount: productData.price,
      currency: productData.currency,
      paymentProvider: 'stripe',
    });

    await purchasesRepository.update(purchaseId, {
      stripeSessionId: session.id,
      status: 'failed',
    });

    console.log(`✗ Checkout failed for user ${userId}: ${productType} ${productId}`);
  }
}

export const paymentService = new PaymentService();
