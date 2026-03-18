import { ProductType } from './purchase';

export interface UserEntitlement {
  id: string;
  userId: string;
  productType: ProductType;
  productId: string;
  unlockedPlanIds: string[];
  sourcePurchaseId: string;
  createdAt: Date;
}

// Alias for compatibility
export interface Entitlement extends UserEntitlement {}

export interface CreateUserEntitlementData {
  userId: string;
  productType: ProductType;
  productId: string;
  unlockedPlanIds: string[];
  sourcePurchaseId: string;
}