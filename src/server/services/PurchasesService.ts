import { purchasesRepository } from '../repositories/PurchasesRepository';
import { entitlementsRepository } from '../repositories/EntitlementsRepository';
import { trainingPlansRepository } from '../repositories/TrainingPlansRepository';
import { trainingPlanGroupsRepository } from '../repositories/TrainingPlanGroupsRepository';
import { Purchase, CreatePurchaseData } from '@/types/purchase';
import { CreateUserEntitlementData } from '@/types/entitlement';

export class PurchasesService {
  async createPurchase(purchaseData: CreatePurchaseData): Promise<string> {
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await purchasesRepository.createPurchase(purchaseId, purchaseData);
    
    return purchaseId;
  }

  async processPurchase(purchaseId: string): Promise<Purchase> {
    const purchase = await purchasesRepository.getById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.status !== 'pending') {
      throw new Error('Purchase is not in pending state');
    }

    // Simulate payment processing (in real app, integrate with Stripe/PayPal)
    const success = await this.simulatePaymentProcessing();

    if (success) {
      // Mark purchase as completed
      await purchasesRepository.updatePurchaseStatus(purchaseId, 'completed');
      
      // Create entitlements
      await this.createEntitlementsForPurchase(purchase);
      
      const completedPurchase = await purchasesRepository.getById(purchaseId);
      return completedPurchase!;
    } else {
      // Mark purchase as failed
      await purchasesRepository.updatePurchaseStatus(purchaseId, 'failed');
      throw new Error('Payment processing failed');
    }
  }

  private async simulatePaymentProcessing(): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  private async createEntitlementsForPurchase(purchase: Purchase): Promise<void> {
    let unlockedPlanIds: string[] = [];

    if (purchase.productType === 'plan') {
      // Direct plan purchase
      unlockedPlanIds = [purchase.productId];
    } else if (purchase.productType === 'group') {
      // Group purchase - unlock all plans in the group
      const group = await trainingPlanGroupsRepository.getById(purchase.productId);
      if (group) {
        unlockedPlanIds = group.includedPlanIds;
      }
    }

    if (unlockedPlanIds.length > 0) {
      const entitlementData: CreateUserEntitlementData = {
        userId: purchase.userId,
        productType: purchase.productType,
        productId: purchase.productId,
        unlockedPlanIds,
        sourcePurchaseId: purchase.id,
      };

      const entitlementId = `entitlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await entitlementsRepository.createEntitlement(entitlementId, entitlementData);
    }
  }

  async getPurchaseById(purchaseId: string): Promise<Purchase | null> {
    return await purchasesRepository.getById(purchaseId);
  }

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    return await purchasesRepository.getByUser(userId);
  }

  async getUserCompletedPurchases(userId: string): Promise<Purchase[]> {
    return await purchasesRepository.getCompletedByUser(userId);
  }

  async hasUserPurchasedProduct(
    userId: string, 
    productType: Purchase['productType'], 
    productId: string
  ): Promise<boolean> {
    return await purchasesRepository.hasUserPurchased(userId, productType, productId);
  }

  async refundPurchase(purchaseId: string): Promise<Purchase> {
    const purchase = await purchasesRepository.getById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.status !== 'completed') {
      throw new Error('Only completed purchases can be refunded');
    }

    // Mark purchase as refunded
    await purchasesRepository.updatePurchaseStatus(purchaseId, 'refunded');
    
    // Remove associated entitlements
    await entitlementsRepository.deleteByPurchase(purchaseId);

    const refundedPurchase = await purchasesRepository.getById(purchaseId);
    return refundedPurchase!;
  }

  async getRecentPurchases(limit: number = 10): Promise<Purchase[]> {
    return await purchasesRepository.getRecentPurchases(limit);
  }

  async getTotalRevenue(): Promise<number> {
    return await purchasesRepository.getTotalRevenue();
  }

  async canUserPurchaseProduct(
    userId: string, 
    productType: Purchase['productType'], 
    productId: string
  ): Promise<{ canPurchase: boolean; reason?: string }> {
    // Check if user already owns this product
    const alreadyPurchased = await this.hasUserPurchasedProduct(userId, productType, productId);
    
    if (alreadyPurchased) {
      return {
        canPurchase: false,
        reason: 'You already own this product'
      };
    }

    // Check if product exists and is published
    if (productType === 'plan') {
      const plan = await trainingPlansRepository.getById(productId);
      if (!plan || !plan.isPublished) {
        return {
          canPurchase: false,
          reason: 'This plan is not available for purchase'
        };
      }
    } else if (productType === 'group') {
      const group = await trainingPlanGroupsRepository.getById(productId);
      if (!group || !group.isPublished) {
        return {
          canPurchase: false,
          reason: 'This group is not available for purchase'
        };
      }
    }

    return { canPurchase: true };
  }
}

export const purchasesService = new PurchasesService();