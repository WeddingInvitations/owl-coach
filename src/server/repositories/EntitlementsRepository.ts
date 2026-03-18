import { UserEntitlement, CreateUserEntitlementData } from '@/types/entitlement';
import { BaseRepository } from './BaseRepository';

export class EntitlementsRepository extends BaseRepository<UserEntitlement> {
  protected collectionName = 'userEntitlements';

  async createEntitlement(id: string, entitlementData: CreateUserEntitlementData): Promise<void> {
    const entitlement: Omit<UserEntitlement, 'id'> = {
      ...entitlementData,
      createdAt: new Date(),
    };

    await this.create(id, entitlement);
  }

  async getByUser(userId: string): Promise<UserEntitlement[]> {
    return await this.getByField('userId', userId);
  }

  async getByProduct(
    productType: UserEntitlement['productType'], 
    productId: string
  ): Promise<UserEntitlement[]> {
    return await this.getAll({
      filters: [
        { field: 'productType', operator: '==', value: productType },
        { field: 'productId', operator: '==', value: productId }
      ]
    });
  }

  async getUserUnlockedPlans(userId: string): Promise<string[]> {
    const entitlements = await this.getByUser(userId);
    const unlockedPlanIds = new Set<string>();

    entitlements.forEach(entitlement => {
      entitlement.unlockedPlanIds.forEach(planId => {
        unlockedPlanIds.add(planId);
      });
    });

    return Array.from(unlockedPlanIds);
  }

  async hasUserAccessToPlan(userId: string, planId: string): Promise<boolean> {
    const entitlements = await this.getByUser(userId);
    
    return entitlements.some(entitlement => 
      entitlement.unlockedPlanIds.includes(planId)
    );
  }

  async hasUserPurchasedProduct(
    userId: string, 
    productType: UserEntitlement['productType'], 
    productId: string
  ): Promise<boolean> {
    const entitlements = await this.getAll({
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'productType', operator: '==', value: productType },
        { field: 'productId', operator: '==', value: productId }
      ],
      limit: 1
    });

    return entitlements.length > 0;
  }

  async deleteByPurchase(purchaseId: string): Promise<void> {
    const entitlements = await this.getByField('sourcePurchaseId', purchaseId);
    
    for (const entitlement of entitlements) {
      await this.delete(entitlement.id);
    }
  }
}

export const entitlementsRepository = new EntitlementsRepository();