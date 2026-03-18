'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { changeUserPassword } from '@/lib/firebase/auth';
import { clearMustChangePassword } from '@/lib/firebase/users';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);

    try {
      const { success: changed, error: changeError } = await changeUserPassword(
        currentPassword,
        newPassword,
      );

      if (!changed || changeError) {
        throw new Error(changeError || 'Error al cambiar la contraseña');
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        await clearMustChangePassword(user.id);
        localStorage.setItem('user', JSON.stringify({ ...user, mustChangePassword: false }));
      }

      setSuccess(true);
      setTimeout(() => router.push('/app/dashboard'), 2000);
    } catch (err: any) {
      setError(
        err.message?.includes('wrong-password') || err.message?.includes('invalid-credential')
          ? 'La contraseña temporal introducida es incorrecta'
          : err.message || 'Error al cambiar la contraseña',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">¡Contraseña actualizada!</h2>
            <p className="text-muted-foreground">Redirigiendo al panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">🦉</span>
          </div>
          <h1 className="text-2xl font-bold">Owl Coach</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cambio de contraseña requerido</CardTitle>
            <CardDescription>
              Por seguridad, debes establecer una nueva contraseña antes de continuar.
              Introduce la contraseña temporal que te proporcionó el administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Input
                label="Contraseña temporal (actual)"
                type="password"
                placeholder="Introduce la contraseña temporal"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirmar nueva contraseña"
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Guardar nueva contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
