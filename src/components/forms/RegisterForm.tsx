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
  loading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, loading = false, error }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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