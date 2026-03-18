'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { AuthUser } from '@/types/auth';
import { getUserProfile } from '@/lib/firebase/users';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<AuthUser | undefined>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (!(token && userData)) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData) as AuthUser;
        const profile = await getUserProfile(parsedUser.id);

        if (profile) {
          const syncedUser: AuthUser = {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            displayName: profile.displayName,
            role: profile.role,
          };

          setUser(syncedUser);
          localStorage.setItem('user', JSON.stringify(syncedUser));
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error syncing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    syncUser();
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