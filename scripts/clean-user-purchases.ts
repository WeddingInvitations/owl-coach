/**
 * Script to clean test purchases and entitlements
 * Run with: npx tsx scripts/clean-user-purchases.ts
 */

import { purchasesRepository } from '../src/server/repositories/PurchasesRepository';
import { entitlementsRepository } from '../src/server/repositories/EntitlementsRepository';

async function cleanUserPurchases(userId: string, productId: string) {
  console.log(`🧹 Cleaning purchases for user ${userId}, product ${productId}...`);

  try {
    // Get and delete purchases
    const purchases = await purchasesRepository.getByUser(userId);
    const matchingPurchases = purchases.filter(p => p.productId === productId);
    
    console.log(`Found ${matchingPurchases.length} purchases to delete`);
    
    for (const purchase of matchingPurchases) {
      await purchasesRepository.delete(purchase.id);
      console.log(`✓ Deleted purchase ${purchase.id}`);
    }

    // Get and delete entitlements
    const entitlements = await entitlementsRepository.getByUser(userId);
    const matchingEntitlements = entitlements.filter(e => e.productId === productId);
    
    console.log(`Found ${matchingEntitlements.length} entitlements to delete`);
    
    for (const entitlement of matchingEntitlements) {
      await entitlementsRepository.delete(entitlement.id);
      console.log(`✓ Deleted entitlement ${entitlement.id}`);
    }

    console.log('✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Usage: Change these values
const USER_ID = 'your-user-id-here';
const PRODUCT_ID = 'your-product-id-here';

cleanUserPurchases(USER_ID, PRODUCT_ID)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
