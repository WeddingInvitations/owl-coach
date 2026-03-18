import { z } from 'zod';

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Exercise name is required'),
  description: z.string().min(1, 'Exercise description is required'),
  sets: z.number().min(1, 'Sets must be at least 1'),
  reps: z.string().min(1, 'Reps are required'),
  restTime: z.number().min(0, 'Rest time must be 0 or more'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
});

export const trainingModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Module title is required'),
  description: z.string().min(1, 'Module description is required'),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 minute'),
});

export const createTrainingPlanSchema = z.object({
  title: z.string().min(1, 'Plan title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  fullDescription: z.string().min(1, 'Full description is required'),
  coverImage: z.string().url('Cover image must be a valid URL'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1, 'Duration must be at least 1 week'),
  price: z.number().min(0, 'Price must be 0 or more'),
  currency: z.enum(['USD', 'EUR']),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  previewModules: z.array(trainingModuleSchema).min(1, 'At least one preview module is required'),
  fullModules: z.array(trainingModuleSchema).min(1, 'At least one full module is required'),
});

export const updateTrainingPlanSchema = createTrainingPlanSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export type CreateTrainingPlanFormData = z.infer<typeof createTrainingPlanSchema>;
export type UpdateTrainingPlanFormData = z.infer<typeof updateTrainingPlanSchema>;