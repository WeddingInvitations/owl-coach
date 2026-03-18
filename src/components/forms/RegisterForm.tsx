'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  initialEmail?: string;
  initialDisplayName?: string;
}

export function RegisterForm({ onSubmit, onGoogleSignIn, loading = false, error, successMessage, initialEmail = '', initialDisplayName = '' }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: initialEmail,
      displayName: initialDisplayName,
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Únete a nuestra plataforma para acceder a planes de entrenamiento premium
        </CardDescription>
      </CardHeader>
      <CardContent>
        {onGoogleSignIn && (
          <div className="mb-4">
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={onGoogleSignIn}
              disabled={loading}
            >
              Registrarse con Google
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O con email</span>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <Input
            label="Nombre"
            type="text"
            placeholder="Introduce tu nombre"
            error={errors.displayName?.message}
            {...register('displayName')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Introduce tu email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Crea una contraseña"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Confirma tu contraseña"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Crear Cuenta
          </Button>
        </form>


        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}