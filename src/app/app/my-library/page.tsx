'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrainingPlan } from '@/types/training-plan';
import { formatPrice, formatDuration, formatDifficulty } from '@/lib/utils/formatters';
import Link from 'next/link';

export default function MyLibraryPage() {
  const [unlockedPlans, setUnlockedPlans] = React.useState<TrainingPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    loadUserLibrary();
  }, []);

  const loadUserLibrary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Inicia sesión para ver tu biblioteca');
      }

      // Get user entitlements
      const entitlementsResponse = await fetch('/api/entitlements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!entitlementsResponse.ok) {
        throw new Error('No se pudo cargar tu biblioteca');
      }

      const entitlementsResult = await entitlementsResponse.json();
      const unlockedPlanIds = entitlementsResult.data?.unlockedPlanIds || [];

      if (unlockedPlanIds.length === 0) {
        setUnlockedPlans([]);
        return;
      }

      // Get plan details for unlocked plans
      const plansResponse = await fetch('/api/plans');
      const plansResult = await plansResponse.json();

      if (plansResponse.ok) {
        const allPlans = plansResult.data || [];
        const userPlans = allPlans.filter((plan: TrainingPlan) => 
          unlockedPlanIds.includes(plan.id)
        );
        setUnlockedPlans(userPlans);
      }

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando tu biblioteca..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No se pudo cargar la biblioteca</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Biblioteca</h1>
        <p className="text-muted-foreground">
          Accede a tus planes de entrenamiento comprados y sigue tu progreso
        </p>
      </div>

      {unlockedPlans.length === 0 ? (
        <EmptyState
          title="Tu Biblioteca está Vacía"
          description="Todavía no has comprado ningún plan de entrenamiento. Explora nuestro catálogo para encontrar planes que se ajusten a tus objetivos."
          icon={<span className="text-4xl">📚</span>}
          action={{
            label: 'Ver Planes',
            onClick: () => window.location.href = '/app/plans'
          }}
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planes Adquiridos
                </CardTitle>
                <span className="text-2xl">📚</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unlockedPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Planes de entrenamiento en tu biblioteca
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valor Total
                </CardTitle>
                <span className="text-2xl">💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(
                    unlockedPlans.reduce((total, plan) => total + plan.price, 0),
                    'USD'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inversión total en entrenamiento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Duración Total
                </CardTitle>
                <span className="text-2xl">⏱️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {unlockedPlans.reduce((total, plan) => total + plan.duration, 0)} semanas
                </div>
                <p className="text-xs text-muted-foreground">
                  De contenido de entrenamiento estructurado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {unlockedPlans.map((plan) => (
              <Card key={plan.id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={plan.coverImage}
                    alt={plan.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="success">
                      ✅ Adquirido
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">
                      {formatDifficulty(plan.difficulty)}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {plan.title}
                  </CardTitle>
                  <CardDescription>
                    por {plan.coachName}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {plan.shortDescription}
                  </p>

                  {/* Plan Stats */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{formatDuration(plan.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📚</span>
                      <span>{plan.exercises?.length ?? 0} ejercicios</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/app/plans/${plan.slug}`} className="flex-1">
                      <Button className="w-full">
                        Comenzar Entrenamiento 
                      </Button>
                    </Link>
                    <Link href={`/app/plans/${plan.slug}`}>
                      <Button variant="outline" size="icon">
                        <span className="text-sm">📖</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}