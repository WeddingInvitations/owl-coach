'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return <div>Cargando...</div>;
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planes Disponibles
            </CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Planes que posees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paquetes de Planes
            </CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Paquetes de entrenamiento
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
            <Link href="/app/groups">
              <Button variant="outline" className="w-full">Ver Paquetes</Button>
            </Link>
            <Link href="/app/my-library">
              <Button variant="ghost" className="w-full">Mi Biblioteca</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Role-specific Actions */}
        {user.role === 'owner' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Manage users, plans, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
              <Link href="/app/admin/plans">
                <Button variant="outline" className="w-full">All Plans</Button>
              </Link>
              <Link href="/app/admin/groups">
                <Button variant="ghost" className="w-full">All Groups</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {(user.role === 'coach' || user.role === 'owner') && (
          <Card>
            <CardHeader>
              <CardTitle>Coach Panel</CardTitle>
              <CardDescription>
                Create and manage your training content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/coach/plans/create">
                <Button className="w-full">Create New Plan</Button>
              </Link>
              <Link href="/app/coach/plans">
                <Button variant="outline" className="w-full">My Plans</Button>
              </Link>
              <Link href="/app/coach/groups">
                <Button variant="ghost" className="w-full">My Groups</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {user.role === 'user' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Training</CardTitle>
              <CardDescription>
                Continue your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/my-library">
                <Button className="w-full">Continue Training</Button>
              </Link>
              <Link href="/app/plans">
                <Button variant="outline" className="w-full">Find New Plans</Button>
              </Link>
              <Link href="/app/groups">
                <Button variant="ghost" className="w-full">Plan Packages</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas novedades en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">📚</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo plan disponible: "Fundamentos HIIT"</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">📦</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo paquete: "Bundle Fuerza Completa"</p>
                <p className="text-xs text-muted-foreground">Hace 1 día</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">🏆</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Actualización: Reproductor de vídeo mejorado</p>
                <p className="text-xs text-muted-foreground">Hace 3 días</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}