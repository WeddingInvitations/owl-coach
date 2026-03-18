'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { AuthUser } from '@/types/auth';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { ensureUserProfile } from '@/lib/firebase/users';
import { getFirebaseApp } from '@/lib/firebase/config';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<AuthUser | undefined>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = getAuth(getFirebaseApp());

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(undefined);
        setLoading(false);
        return;
      }

      try {
        const profile = await ensureUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
        });

        const token = await firebaseUser.getIdToken();
        const syncedUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          displayName: profile.displayName,
          role: profile.role,
        };

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify({
          ...syncedUser,
          mustChangePassword: profile.mustChangePassword ?? false,
        }));
        setUser(syncedUser);
      } catch (error) {
        console.error('Error syncing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(undefined);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}