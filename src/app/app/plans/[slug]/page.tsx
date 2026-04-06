'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { TrainingPlan, Exercise } from '@/types/training-plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDuration, formatDifficulty, formatEstimatedDuration } from '@/lib/utils/formatters';
import { AuthUser } from '@/types/auth';

export default function PlanDetailPage() {
  const params = useParams();
  const planSlug = params.slug as string;

  const [plan, setPlan] = React.useState<TrainingPlan | null>(null);
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [purchaseLoading, setPurchaseLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadPlan();
  }, [planSlug]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Build URL with access parameter if user is authenticated
      let url = `/api/plans/${planSlug}`;
      if (token) {
        url += '?includeContent=true';
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load plan');
      }

      setPlan(result.data);
      
      // Check if user has access to full content
      if (token && result.data) {
        await checkAccess(result.data.id);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (planId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/entitlements?planId=${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setHasAccess(result.data?.hasAccess || false);
      }
    } catch (error) {
      console.error('Failed to check access:', error);
    }
  };

  const handlePurchase = async () => {
    if (!plan || !user) return;

    setPurchaseLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productType: 'plan',
          productId: plan.id,
          amount: plan.price,
          currency: plan.currency,
          paymentProvider: 'simulated'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'La compra ha fallado');
      }

      setHasAccess(true);
      alert('¡Compra realizada con éxito! Ya tienes acceso al plan completo.');
      
      // Reload plan to get full content
      await loadPlan();
    } catch (error: any) {
      alert(`La compra ha fallado: ${error.message}`);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando plan..." />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Plan no encontrado</h2>
        <p className="text-muted-foreground">{error || 'El plan solicitado no se pudo encontrar.'}</p>
      </div>
    );
  }

  const exercises: Exercise[] = plan.exercises ?? [];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <img
            src={plan.coverImage}
            alt={plan.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">
                {formatDifficulty(plan.difficulty)}
              </Badge>
              <Badge variant={plan.isPublished ? 'success' : 'warning'}>
                {plan.isPublished ? 'Publicado' : 'Borrador'}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-2">{plan.title}</h1>
            <p className="text-lg opacity-90">by {plan.coachName}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre este Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {plan.fullDescription}
              </p>
            </CardContent>
          </Card>

          {/* Exercises */}
          {hasAccess && exercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ejercicios del Plan</CardTitle>
                <CardDescription>Todos los ejercicios incluidos en este plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.map((ex, idx) => (
                    <div key={ex.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{idx + 1}. {ex.name}</h4>
                        {ex.tipo && <Badge variant="outline" className="text-xs">{ex.tipo}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{ex.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {ex.sets > 0 && <span><span className="font-medium">{ex.sets}</span> series</span>}
                        {ex.reps && <span><span className="font-medium">{ex.reps}</span> reps</span>}
                        {ex.restTime > 0 && <span className="text-muted-foreground">{ex.restTime}s descanso</span>}
                      </div>
                      {ex.instructions && ex.instructions.length > 0 && (
                        <ol className="mt-3 list-decimal list-inside space-y-1">
                          {ex.instructions.map((step, i) => (
                            <li key={i} className="text-sm text-muted-foreground">{step}</li>
                          ))}
                        </ol>
                      )}
                      {ex.videoUrl && (
                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary underline">
                          Ver vídeo
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locked content */}
          {!hasAccess && (
            <Card className="relative">
              <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-semibold mb-2">Contenido Premium Bloqueado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compra este plan para acceder a todos los ejercicios
                  </p>
                  {user?.role === 'user' && (
                    <Button onClick={handlePurchase} disabled={purchaseLoading}>
                      {purchaseLoading ? 'Procesando...' : `Desbloquear por ${formatPrice(plan.price, plan.currency)}`}
                    </Button>
                  )}
                </div>
              </div>
              <CardHeader>
                <CardTitle>Programa de Entrenamiento Completo</CardTitle>
                <CardDescription>Ejercicios con instrucciones detalladas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 blur-sm pointer-events-none select-none">
                  {[1,2,3].map(i => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {formatPrice(plan.price, plan.currency)}
              </CardTitle>
              <CardDescription>
                Compra única para acceso de por vida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasAccess && user?.role === 'user' && (
                <Button 
                  className="w-full" 
                  onClick={handlePurchase}
                  disabled={purchaseLoading}
                >
                  {purchaseLoading ? 'Procesando...' : 'Comprar Plan'}
                </Button>
              )}
              
              {hasAccess && (
                <Badge variant="success" className="w-full justify-center py-2">
                  ✅ Ya posees este plan
                </Badge>
              )}

              {!user && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Inicia sesión para comprar
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/login">Iniciar sesión</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración</span>
                <span className="font-medium">{formatDuration(plan.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dificultad</span>
                <Badge variant="outline">{formatDifficulty(plan.difficulty)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ejercicios</span>
                <span className="font-medium">{plan.exercises?.length ?? 0}</span>
              </div>
              {plan.estimatedDuration > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiempo Estimado</span>
                  <span className="font-medium">{formatEstimatedDuration(plan.estimatedDuration)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coach</span>
                <span className="font-medium">{plan.coachName}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

