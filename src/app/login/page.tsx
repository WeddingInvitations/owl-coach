'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { LoginForm } from '@/components/forms/LoginForm';
import { LoginFormData } from '@/lib/validations/auth';
import { loginUser, loginWithGoogle, logoutUser, deleteCurrentAuthUser } from '@/lib/firebase/auth';
import { ensureUserProfile, getUserProfile } from '@/lib/firebase/users';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const hintParam = searchParams.get('hint');
  const successMessage =
    hintParam === 'alreadyregistered'
      ? 'Tu cuenta de Google ya está registrada. Inicia sesión normalmente.'
      : '';

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
      const { user, error: loginError, errorCode } = await loginUser(data.email, data.password);

      if (!user) {
        // User does not exist → redirect to register
        if (
          errorCode === 'auth/user-not-found' ||
          errorCode === 'auth/invalid-credential'
        ) {
          router.push(`/register?email=${encodeURIComponent(data.email)}&hint=notfound`);
          return;
        }
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
      const { user, isNewUser, error: loginError } = await loginWithGoogle();

      if (loginError || !user) {
        throw new Error(loginError || 'Error al iniciar sesión con Google');
      }

      if (isNewUser) {
        // New Firebase Auth account → delete it and redirect to register
        await deleteCurrentAuthUser();
        router.push(
          `/register?email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.displayName || '')}&hint=google`
        );
        return;
      }

      // Existing Firebase Auth user: check they have a Firestore profile
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        // Auth account exists but no Firestore profile → treat as new user
        await deleteCurrentAuthUser();
        router.push(
          `/register?email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.displayName || '')}&hint=google`
        );
        return;
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
          successMessage={successMessage}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}