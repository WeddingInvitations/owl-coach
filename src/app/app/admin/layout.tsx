'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AuthUser } from '@/types/auth';
import { getUserProfile } from '@/lib/firebase/users';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const verifyOwner = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        window.location.href = '/login';
        return;
      }

      const parsedUser = JSON.parse(userData);
      const profile = await getUserProfile(parsedUser.id);

      if (!profile || profile.role !== 'owner') {
        window.location.href = '/app/dashboard';
        return;
      }

      if (isMounted) {
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
      }
    };

    verifyOwner().catch(() => {
      window.location.href = '/app/dashboard';
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user || user.role !== 'owner') {
    return (
      <div className="flex justify-center py-12">
        <div>Cargando...</div>
      </div>
    );
  }

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">⚙️</span>
            <span>Panel de Administración</span>
          </CardTitle>
          <CardDescription>
            Herramientas de administración y gestión de la plataforma
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Admin Navigation */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/app/admin/users">
          <Card className={`cursor-pointer transition-colors ${
            isActive('/app/admin/users') ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Usuarios</div>
              <div className="text-xs text-muted-foreground">Gestionar usuarios y roles</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/admin/plans">
          <Card className={`cursor-pointer transition-colors ${
            isActive('/app/admin/plans') ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Planes</div>
              <div className="text-xs text-muted-foreground">Todos los planes de entrenamiento</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/admin/groups">
          <Card className={`cursor-pointer transition-colors ${
            isActive('/app/admin/groups') ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium">Paquetes</div>
              <div className="text-xs text-muted-foreground">Paquetes de planes</div>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-not-allowed opacity-60">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Analíticas</div>
              <div className="text-xs text-muted-foreground">Próximamente</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Content */}
      <div>{children}</div>
    </div>
  );
}