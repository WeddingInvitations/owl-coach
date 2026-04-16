import { entitlementsRepository } from '../repositories/EntitlementsRepository';
import { UserEntitlement } from '@/types/entitlement';
import { UserRole } from '@/types/user';

export class EntitlementsService {
  async getUserEntitlements(userId: string): Promise<UserEntitlement[]> {
    return await entitlementsRepository.getByUser(userId);
  }

  async getUserUnlockedPlansIds(userId: string): Promise<string[]> {
    return await entitlementsRepository.getUserUnlockedPlans(userId);
  }

  async canAccessPlanContent(
    userId: string, 
    planId: string, 
    userRole: UserRole
  ): Promise<boolean> {
    // Check if user has purchased access to this plan
    // No special treatment for owners/coaches - they must purchase like everyone else
    const hasAccess = await entitlementsRepository.hasUserAccessToPlan(userId, planId);
    
    console.log(`[EntitlementsService] User ${userId} (role: ${userRole}) access to plan ${planId}: ${hasAccess}`);
    
    return hasAccess;
  }

  async canAccessGroupContent(
    userId: string, 
    groupId: string, 
    userRole: UserRole
  ): Promise<boolean> {
    // Check if user has purchased this group
    // No special treatment for owners/coaches - they must purchase like everyone else
    const hasAccess = await entitlementsRepository.hasUserPurchasedProduct(userId, 'group', groupId);
    
    console.log(`[EntitlementsService] User ${userId} (role: ${userRole}) access to group ${groupId}: ${hasAccess}`);
    
    return hasAccess;
  }

  async getUserLibrary(userId: string): Promise<{
    unlockedPlanIds: string[];
    purchasedGroups: UserEntitlement[];
    directPlanPurchases: UserEntitlement[];
  }> {
    const entitlements = await this.getUserEntitlements(userId);
    
    const unlockedPlanIds = await this.getUserUnlockedPlansIds(userId);
    
    const purchasedGroups = entitlements.filter(e => e.productType === 'group');
    const directPlanPurchases = entitlements.filter(e => e.productType === 'plan');

    return {
      unlockedPlanIds,
      purchasedGroups,
      directPlanPurchases,
    };
  }

  async getProductEntitlements(
    productType: UserEntitlement['productType'], 
    productId: string
  ): Promise<UserEntitlement[]> {
    return await entitlementsRepository.getByProduct(productType, productId);
  }

  async revokeUserAccess(userId: string, productType: UserEntitlement['productType'], productId: string): Promise<void> {
    const entitlements = await entitlementsRepository.getByUser(userId);
    
    const targetEntitlements = entitlements.filter(e => 
      e.productType === productType && e.productId === productId
    );

    for (const entitlement of targetEntitlements) {
      await entitlementsRepository.delete(entitlement.id);
    }
  }

  async getUserAccessSummary(userId: string): Promise<{
    totalPlansUnlocked: number;
    totalGroupsPurchased: number;
    totalDirectPlanPurchases: number;
  }> {
    const library = await this.getUserLibrary(userId);
    
    return {
      totalPlansUnlocked: library.unlockedPlanIds.length,
      totalGroupsPurchased: library.purchasedGroups.length,
      totalDirectPlanPurchases: library.directPlanPurchases.length,
    };
  }
}

export const entitlementsService = new EntitlementsService();