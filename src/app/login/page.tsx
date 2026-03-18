'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { LoginForm } from '@/components/forms/LoginForm';
import { LoginFormData } from '@/lib/validations/auth';
import { loginUser, loginWithGoogle } from '@/lib/firebase/auth';
import { ensureUserProfile } from '@/lib/firebase/users';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const completeLogin = async (firebaseUser: User, fallbackEmail: string = '') => {
    const userProfile = await ensureUserProfile({
      uid: firebaseUser.uid,
      email: firebaseUser.email || fallbackEmail,
      displayName: firebaseUser.displayName || '',
    });

    const token = await firebaseUser.getIdToken();

    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      displayName: userProfile.displayName,
      role: userProfile.role,
      mustChangePassword: userProfile.mustChangePassword ?? false,
    }));

    if (userProfile.mustChangePassword) {
      router.push('/app/change-password');
    } else {
      router.push('/app/dashboard');
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const { user, error: loginError } = await loginUser(data.email, data.password);

      if (loginError || !user) {
        throw new Error(loginError || 'Error al iniciar sesión');
      }

      await completeLogin(user, data.email);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { user, error: loginError } = await loginWithGoogle();

      if (loginError || !user) {
        throw new Error(loginError || 'Error al iniciar sesión con Google');
      }

      await completeLogin(user);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🦉</span>
            </div>
            <span className="text-xl font-bold">Owl Coach</span>
          </Link>
        </div>

        {/* Login Form */}
        <LoginForm
          onSubmit={handleLogin}
          onGoogleSignIn={handleGoogleLogin}
          loading={loading}
          error={error}
        />

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}