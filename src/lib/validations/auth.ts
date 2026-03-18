import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor introduce un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor introduce un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Por favor confirma tu contraseña'),
  displayName: z
    .string()
    .min(1, 'Tu nombre es requerido')
    .min(2, 'Tu nombre debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;