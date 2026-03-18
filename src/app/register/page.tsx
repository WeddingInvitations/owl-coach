'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { RegisterFormData } from '@/lib/validations/auth';
import { registerUser, loginWithGoogle, logoutUser } from '@/lib/firebase/auth';
import { ensureUserProfile, getUserProfile } from '@/lib/firebase/users';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const hintParam = searchParams.get('hint');
  const emailParam = searchParams.get('email') || '';
  const nameParam = searchParams.get('name') || '';

  const hintMessage =
    hintParam === 'notfound'
      ? 'No encontramos ninguna cuenta con ese email. Regístrate para continuar.'
      : hintParam === 'google'
      ? 'Tu cuenta de Google no está registrada aquí todavía. Completa el formulario para crear tu cuenta.'
      : '';

  const completeRegistrationLogin = async (firebaseUser: User) => {
    const userProfile = await ensureUserProfile({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
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
    }));
    router.push('/app/dashboard');
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    try {
      const { user, error: registerError } = await registerUser(
        data.email,
        data.password,
        data.displayName,
      );

      if (registerError || !user) {
        throw new Error(registerError || 'Error al crear la cuenta');
      }

      const userProfile = await ensureUserProfile({
        uid: user.uid,
        email: user.email || data.email,
        displayName: data.displayName,
      });

      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        displayName: userProfile.displayName,
        role: userProfile.role,
      }));

      router.push('/app/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const { user, isNewUser, error: googleError } = await loginWithGoogle();

      if (googleError || !user) {
        throw new Error(googleError || 'Error al conectar con Google');
      }

      if (!isNewUser) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          await logoutUser();
          router.push('/login?hint=alreadyregistered');
          return;
        }
      }

      await completeRegistrationLogin(user);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🦩</span>
            </div>
            <span className="text-xl font-bold">Owl Coach</span>
          </Link>
        </div>

        <RegisterForm
          onSubmit={handleRegister}
          onGoogleSignIn={handleGoogleRegister}
          loading={loading}
          error={error}
          successMessage={hintMessage}
          initialEmail={emailParam}
          initialDisplayName={nameParam}
        />

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
