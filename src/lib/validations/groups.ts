import { z } from 'zod';

export const createTrainingPlanGroupSchema = z.object({
  title: z.string().min(1, 'Group title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  fullDescription: z.string().min(1, 'Full description is required'),
  coverImage: z.string().url('Cover image must be a valid URL'),
  includedPlanIds: z.array(z.string()).min(1, 'At least one plan must be included'),
  price: z.number().min(0, 'Price must be 0 or more'),
  currency: z.enum(['USD', 'EUR']),
});

export const updateTrainingPlanGroupSchema = createTrainingPlanGroupSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export type CreateTrainingPlanGroupFormData = z.infer<typeof createTrainingPlanGroupSchema>;
export type UpdateTrainingPlanGroupFormData = z.infer<typeof updateTrainingPlanGroupSchema>;