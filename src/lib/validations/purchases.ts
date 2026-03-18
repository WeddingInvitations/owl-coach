import { z } from 'zod';

export const createPurchaseSchema = z.object({
  userId: z.string().min(1, 'El ID del usuario es requerido'),
  productType: z.enum(['plan', 'group']),
  productId: z.string().min(1, 'El ID del producto es requerido'),
  amount: z.number().min(0, 'El monto debe ser 0 o más'),
  currency: z.enum(['USD', 'EUR']),
  paymentProvider: z.enum(['simulated', 'stripe', 'paypal']),
});

export type CreatePurchaseFormData = z.infer<typeof createPurchaseSchema>;