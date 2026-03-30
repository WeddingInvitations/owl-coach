import { z } from 'zod';

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del ejercicio es requerido'),
  description: z.string().min(1, 'La descripción del ejercicio es requerida'),
  sets: z.number().min(1, 'Las series deben ser al menos 1'),
  reps: z.string().min(1, 'Las repeticiones son requeridas'),
  restTime: z.number().min(0, 'El tiempo de descanso debe ser 0 o más'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  instructions: z.array(z.string()).min(1, 'Al menos una instrucción es requerida'),
});

export const trainingModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'El título del módulo es requerido'),
  description: z.string().min(1, 'La descripción del módulo es requerida'),
  exercises: z.array(exerciseSchema).min(1, 'Al menos un ejercicio es requerido'),
  estimatedDuration: z.number().min(1, 'La duración debe ser al menos 1 minuto'),
});

export const createTrainingPlanSchema = z.object({
  title: z.string().min(1, 'El título del plan es requerido'),
  shortDescription: z.string().min(1, 'La descripción corta es requerida'),
  fullDescription: z.string().min(1, 'La descripción completa es requerida'),
  coverImage: z.string().url('La imagen de portada debe ser una URL válida').optional().or(z.literal('')),
  difficulty: z.enum(['principiante', 'intermedio', 'avanzado']),
  duration: z.number().min(1, 'La duración debe ser al menos 1 semana'),
  price: z.number().min(0, 'El precio debe ser 0 o más'),
  currency: z.enum(['USD', 'EUR']),
  categoryIds: z.array(z.string()).min(1, 'Al menos una categoría es requerida'),
  previewModules: z.array(trainingModuleSchema).min(1, 'Al menos un módulo de vista previa es requerido'),
  fullModules: z.array(trainingModuleSchema).optional().or(z.array(z.any()).length(0)),
});

export const updateTrainingPlanSchema = createTrainingPlanSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export type CreateTrainingPlanFormData = z.infer<typeof createTrainingPlanSchema>;
export type UpdateTrainingPlanFormData = z.infer<typeof updateTrainingPlanSchema>;