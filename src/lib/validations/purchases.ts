import { z } from 'zod';

export const createPurchaseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  productType: z.enum(['plan', 'group']),
  productId: z.string().min(1, 'Product ID is required'),
  amount: z.number().min(0, 'Amount must be 0 or more'),
  currency: z.enum(['USD', 'EUR']),
  paymentProvider: z.enum(['simulated', 'stripe', 'paypal']),
});

export type CreatePurchaseFormData = z.infer<typeof createPurchaseSchema>;