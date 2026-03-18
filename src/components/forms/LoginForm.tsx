'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  loading?: boolean;
  error?: string;
  successMessage?: string;
}

export function LoginForm({ onSubmit, onGoogleSignIn, loading = false, error, successMessage }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bienvenido de nuevo</CardTitle>
        <CardDescription>
          Inicia sesión para acceder a tus planes de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            label="Email"
            type="email"
            placeholder="Introduce tu email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Introduce tu contraseña"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Iniciar sesión
          </Button>

          {onGoogleSignIn && (
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={onGoogleSignIn}
              disabled={loading}
            >
              Continuar con Google
            </Button>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              Regístrate
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}