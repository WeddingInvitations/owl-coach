import { z } from 'zod';

export const createTrainingPlanGroupSchema = z.object({
  title: z.string().min(1, 'El título del grupo es requerido'),
  shortDescription: z.string().min(1, 'La descripción corta es requerida'),
  fullDescription: z.string().min(1, 'La descripción completa es requerida'),
  coverImage: z.string().url('La imagen de portada debe ser una URL válida'),
  includedPlanIds: z.array(z.string()).min(1, 'Al menos un plan debe ser incluido'),
  price: z.number().min(0, 'El precio debe ser 0 o más'),
  currency: z.enum(['USD', 'EUR']),
});

export const updateTrainingPlanGroupSchema = createTrainingPlanGroupSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export type CreateTrainingPlanGroupFormData = z.infer<typeof createTrainingPlanGroupSchema>;
export type UpdateTrainingPlanGroupFormData = z.infer<typeof updateTrainingPlanGroupSchema>;