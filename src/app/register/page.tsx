'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { RegisterFormData } from '@/lib/validations/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Store user data and token
      if (result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }

      // Redirect to dashboard
      router.push('/app/dashboard');
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

        {/* Register Form */}
        <RegisterForm
          onSubmit={handleRegister}
          loading={loading}
          error={error}
        />

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}