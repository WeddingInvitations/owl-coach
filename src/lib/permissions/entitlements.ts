import { entitlementsRepository } from '@/server/repositories/EntitlementsRepository';
import { purchasesRepository } from '@/server/repositories/PurchasesRepository';

/**
 * Check if a user can access a specific plan
 * Returns true if:
 * - User has purchased the plan directly
 * - User has purchased a group that includes the plan
 * - User is the owner of the plan (to be implemented based on your role system)
 */
export async function canAccessPlan(userId: string, planId: string): Promise<boolean> {
  try {
    // Check if user has an entitlement that unlocks this plan
    const hasAccess = await entitlementsRepository.hasUserAccessToPlan(userId, planId);
    
    return hasAccess;
  } catch (error) {
    console.error('Error checking plan access:', error);
    return false;
  }
}

/**
 * Check if a user has purchased a specific product
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productType: 'plan' | 'group',
  productId: string
): Promise<boolean> {
  try {
    const hasPurchased = await purchasesRepository.hasUserPurchased(userId, productType, productId);
    return hasPurchased;
  } catch (error) {
    console.error('Error checking product purchase:', error);
    return false;
  }
}

/**
 * Get all plan IDs that a user has access to
 */
export async function getUserAccessiblePlans(userId: string): Promise<string[]> {
  try {
    const unlockedPlanIds = await entitlementsRepository.getUserUnlockedPlans(userId);
    return unlockedPlanIds;
  } catch (error) {
    console.error('Error getting user accessible plans:', error);
    return [];
  }
}
