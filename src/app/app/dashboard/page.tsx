'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalPlans: 0,
    userLibrary: 0,
  });

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Cargar planes publicados
      const plansResponse = await fetch('/api/plans');
      const plansResult = await plansResponse.json();
      const plansData = plansResult.data || plansResult;
      const totalPlans = Array.isArray(plansData) ? plansData.filter((p: any) => p.isPublished).length : 0;

      // Cargar biblioteca del usuario (solo si está autenticado)
      let userLibrary = 0;
      if (token) {
        try {
          const libraryResponse = await fetch('/api/entitlements', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (libraryResponse.ok) {
            const libraryData = await libraryResponse.json();
            userLibrary = libraryData.data?.unlockedPlanIds?.length || 0;
          }
        } catch (error) {
          console.error('Error loading library:', error);
        }
      }

      setStats({
        totalPlans,
        userLibrary,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          ¡Bienvenido de nuevo, {user.displayName}!
        </h1>
        <p className="text-muted-foreground">
          Aquí está lo que está pasando en tu plataforma de entrenamiento
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planes Disponibles
            </CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Planes de entrenamiento disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mi Biblioteca
            </CardTitle>
            <span className="text-2xl">🔓</span>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-2xl font-bold">{stats.userLibrary}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Planes que posees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tu Rol
            </CardTitle>
            <span className="text-2xl">👤</span>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg">
              {user.role}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Based on Role */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* General Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Explorar Planes de Entrenamiento</CardTitle>
            <CardDescription>
              Descubre nuevos programas de entrenamiento de coaches expertos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/app/plans">
              <Button className="w-full">Ver Todos los Planes</Button>
            </Link>
            <Link href="/app/my-library">
              <Button variant="outline" className="w-full">Mi Biblioteca</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Role-specific Actions */}
        {user.role === 'owner' && (
          <Card>
            <CardHeader>
              <CardTitle>Panel de Administración</CardTitle>
              <CardDescription>
                Gestiona usuarios, planes y la configuración de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/admin/users">
                <Button className="w-full">Gestionar usuarios</Button>
              </Link>
              <Link href="/app/admin/plans">
                <Button variant="outline" className="w-full">Todos los planes</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {(user.role === 'coach' || user.role === 'owner') && (
          <Card>
            <CardHeader>
              <CardTitle>Panel de Coach</CardTitle>
              <CardDescription>
                Crea y gestiona tu contenido de entrenamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/coach/plans/create">
                <Button className="w-full">Crear nuevo plan</Button>
              </Link>
              <Link href="/app/coach/plans">
                <Button variant="outline" className="w-full">Mis planes</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {user.role === 'user' && (
          <Card>
            <CardHeader>
              <CardTitle>Tu Entrenamiento</CardTitle>
              <CardDescription>
                Continúa con tu progreso de entrenamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/my-library">
                <Button className="w-full">Continuar entrenando</Button>
              </Link>
              <Link href="/app/plans">
                <Button variant="outline" className="w-full">Encontrar nuevos planes</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}