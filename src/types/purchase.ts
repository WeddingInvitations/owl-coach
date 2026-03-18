import { Currency } from './training-plan';

export type ProductType = 'plan' | 'group';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentProvider = 'simulated' | 'stripe' | 'paypal';

export interface Purchase {
  id: string;
  userId: string;
  productType: ProductType;
  productId: string;
  amount: number;
  currency: Currency;
  status: PurchaseStatus;
  paymentProvider: PaymentProvider;
  createdAt: Date;
}

export interface CreatePurchaseData {
  userId: string;
  productType: ProductType;
  productId: string;
  amount: number;
  currency: Currency;
  paymentProvider: PaymentProvider;
}