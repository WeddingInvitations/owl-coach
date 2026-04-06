import { z } from 'zod';

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del ejercicio es requerido'),
  description: z.string().default(''),
  tipo: z.string().optional(),
  sets: z.number().min(0),
  reps: z.string().default(''),
  restTime: z.number().min(0),
  videoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  instructions: z.array(z.string()).default([]),
});

const baseTrainingPlanSchema = z.object({
  title: z.string().min(1, 'El título del plan es requerido'),
  shortDescription: z.string().min(1, 'La descripción corta es requerida'),
  fullDescription: z.string().min(1, 'La descripción completa es requerida'),
  coverImage: z.string().url('La imagen de portada debe ser una URL válida').optional().or(z.literal('')),
  difficulty: z.enum(['principiante', 'intermedio', 'avanzado']),
  duration: z.number().min(1, 'La duración debe ser al menos 1 semana'),
  estimatedDuration: z.number().min(0).default(0),
  price: z.number().min(0, 'El precio debe ser 0 o más'),
  currency: z.enum(['USD', 'EUR']),
  categoryIds: z.array(z.string()).default([]),
  exercises: z.array(exerciseSchema).default([]),
});

export const createTrainingPlanSchema = baseTrainingPlanSchema;

export const updateTrainingPlanSchema = baseTrainingPlanSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export type CreateTrainingPlanFormData = z.infer<typeof createTrainingPlanSchema>;
export type UpdateTrainingPlanFormData = z.infer<typeof updateTrainingPlanSchema>;
