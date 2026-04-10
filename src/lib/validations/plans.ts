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

// Schema más permisivo para ejercicios existentes
export const existingExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  tipo: z.string().optional(),
  sets: z.number().default(0),
  reps: z.string().default(''),
  restTime: z.number().default(0),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(), 
  instructions: z.array(z.string()).optional().default([]),
}).passthrough(); // Permite campos adicionales

export const trainingModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'El título del módulo es requerido'),
  description: z.string().min(1, 'La descripción del módulo es requerida'),
  exercises: z.array(exerciseSchema).min(1, 'Al menos un ejercicio es requerido'),
  estimatedDuration: z.number().min(1, 'La duración debe ser al menos 1 minuto'),
});

// Schema más permisivo para módulos existentes
export const existingModuleSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  name: z.string().optional(), // Los módulos en Firestore usan 'name' en vez de 'title'
  description: z.string().default(''),
  exercises: z.array(existingExerciseSchema).default([]),
  estimatedDuration: z.number().default(0),
}).passthrough() // Permite campos adicionales
  .transform((data) => {
    // Normalizar: si tiene 'name' pero no 'title', usar 'name' como 'title'
    return {
      ...data,
      title: data.title || data.name || '',
    };
  });

const baseTrainingPlanSchema = z.object({
  title: z.string().min(1, 'El título del plan es requerido'),
  shortDescription: z.string().min(1, 'La descripción corta es requerida'),
  fullDescription: z.string().min(1, 'La descripción completa es requerida'),
  coverImage: z.string().optional().or(z.literal('')),
  difficulty: z.enum(['principiante', 'intermedio', 'avanzado']),
  duration: z.number().min(1, 'La duración debe ser al menos 1 semana'),
  price: z.number().min(0, 'El precio debe ser 0 o más'),
  currency: z.enum(['EUR', 'USD']),
  categoryIds: z.array(z.string()).min(1, 'Al menos una categoría es requerida'),
  previewModules: z.array(trainingModuleSchema).default([]),
  fullModules: z.array(existingModuleSchema).default([]),
});

export const createTrainingPlanSchema = baseTrainingPlanSchema.refine((data) => {
  // Si hay fullModules con contenido, no requerir previewModules
  const hasFullModules = data.fullModules && Array.isArray(data.fullModules) && data.fullModules.length > 0;
  const hasPreviewModules = data.previewModules && data.previewModules.length > 0;
  
  // Debe tener al menos un módulo (ya sea preview o full)
  return hasFullModules || hasPreviewModules;
}, {
  message: 'Debe añadir al menos un módulo existente o crear al menos un módulo de vista previa',
  path: ['previewModules']
});

export const updateTrainingPlanSchema = baseTrainingPlanSchema.partial().extend({
  isPublished: z.boolean().optional(),
  previewModules: z.array(z.any()).optional(),
  fullModules: z.array(z.any()).optional(),
});

export type CreateTrainingPlanFormData = z.infer<typeof createTrainingPlanSchema>;
export type UpdateTrainingPlanFormData = z.infer<typeof updateTrainingPlanSchema>;