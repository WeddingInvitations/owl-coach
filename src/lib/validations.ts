import { z } from 'zod';

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Training Plan Validation Schemas
export const exerciseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Exercise title is required'),
  description: z.string().min(1, 'Exercise description is required'),
  duration: z.number().min(0, 'Duration must be positive'),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

export const moduleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Module title is required'),
  description: z.string().min(1, 'Module description is required'),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
});

export const createTrainingPlanSchema = z.object({
  title: z.string().min(1, 'Plan title is required'),
  description: z.string().min(1, 'Plan description is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.number().min(0, 'Price must be positive'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()),
  modules: z.array(moduleSchema).min(1, 'At least one module is required'),
});

export const updateTrainingPlanSchema = createTrainingPlanSchema.partial();

// Training Plan Group Validation Schemas
export const createTrainingPlanGroupSchema = z.object({
  title: z.string().min(1, 'Group title is required'),
  description: z.string().min(1, 'Group description is required'),
  price: z.number().min(0, 'Price must be positive'),
  trainingPlanIds: z.array(z.string()).min(1, 'At least one plan is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()),
});

export const updateTrainingPlanGroupSchema = createTrainingPlanGroupSchema.partial();

// Purchase Validation Schemas
export const createPurchaseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  productType: z.enum(['plan', 'group']),
  productId: z.string().min(1, 'Product ID is required'),
  amount: z.number().min(0, 'Amount must be positive'),
});

// User Management Validation Schemas
export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['owner', 'coach', 'user']),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTrainingPlanInput = z.infer<typeof createTrainingPlanSchema>;
export type UpdateTrainingPlanInput = z.infer<typeof updateTrainingPlanSchema>;
export type CreateTrainingPlanGroupInput = z.infer<typeof createTrainingPlanGroupSchema>;
export type UpdateTrainingPlanGroupInput = z.infer<typeof updateTrainingPlanGroupSchema>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;