'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { TrainingPlan, TrainingModule } from '@/types/training-plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDuration, formatDifficulty, formatEstimatedDuration } from '@/lib/utils/formatters';
import { AuthUser } from '@/types/auth';

export default function PlanDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const planSlug = params.slug as string;
  const hasAccessParam = searchParams.get('access') === 'true';

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

  const allModules = [
    ...(Array.isArray(plan.previewModules) ? plan.previewModules : []), 
    ...(Array.isArray(plan.fullModules) ? plan.fullModules : [])
  ];
  const visibleModules = hasAccess ? allModules : (Array.isArray(plan.previewModules) ? plan.previewModules : []);
  const totalEstimatedTime = allModules.reduce((total, module) => {
    const duration = typeof module.estimatedDuration === 'number' ? module.estimatedDuration : 0;
    return total + duration;
  }, 0);

  // Debug en consola
  console.log('Plan Detail - Modules:', {
    previewModules: plan.previewModules,
    fullModules: plan.fullModules,
    allModulesLength: allModules.length,
    totalEstimatedTime,
    hasAccess
  });

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
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {plan.fullDescription}
              </p>

              {/* Plan Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {allModules.length}
                    {!hasAccess && plan.fullModules && plan.fullModules.length > 0 && (
                      <span className="text-sm text-muted-foreground ml-1">*</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {allModules.length === 1 ? 'Módulo' : 'Módulos'}
                    {!hasAccess && plan.fullModules && plan.fullModules.length > 0 && (
                      <div className="text-[10px] mt-1">
                        ({visibleModules.length} disponibles)
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatDuration(plan.duration)}</div>
                  <div className="text-xs text-muted-foreground">Duración</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {totalEstimatedTime > 0 ? formatEstimatedDuration(totalEstimatedTime) : '0 min'}
                  </div>
                  <div className="text-xs text-muted-foreground">Tiempo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatDifficulty(plan.difficulty)}</div>
                  <div className="text-xs text-muted-foreground">Nivel</div>
                </div>
              </div>

              {/* Modules Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Módulos del Plan
                  {!hasAccess && plan.fullModules && plan.fullModules.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({visibleModules.length} desbloqueados, {plan.fullModules.length} bloqueados)
                    </span>
                  )}
                </h3>
                {allModules.length === 0 ? (
                  <div className="p-8 border rounded-lg bg-muted/20 border-dashed text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-muted-foreground">
                      Este plan aún no tiene módulos configurados
                    </p>
                    {user?.role === 'coach' || user?.role === 'owner' ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        Ve al panel de administración para añadir módulos a este plan
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Visible Modules (Preview or all if has access) */}
                    {visibleModules.map((module, index) => {
                      const moduleExercises = Array.isArray(module.exercises) ? module.exercises : [];
                      return (
                        <div key={module.id} className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              Módulo {index + 1}: {module.title || 'Sin título'}
                            </h4>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <span className="text-xs text-muted-foreground">
                                {formatEstimatedDuration(module.estimatedDuration || 0)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {module.description || 'Sin descripción'}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            📋 {moduleExercises.length} {moduleExercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Locked Modules - Show names but locked */}
                    {!hasAccess && plan.fullModules && plan.fullModules.length > 0 && (
                      plan.fullModules.map((module, index) => {
                        const moduleNumber = visibleModules.length + index + 1;
                        return (
                          <div key={module.id || `locked-${index}`} className="p-4 border rounded-lg bg-muted/50 border-dashed relative">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                🔒 Módulo {moduleNumber}: {module.title || 'Sin título'}
                              </h4>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                Bloqueado
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Compra este plan para ver el contenido completo
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Modules */}
          {plan.previewModules && plan.previewModules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Módulos de Vista Previa</CardTitle>
                <CardDescription>
                  Una muestra de lo que incluye este plan de entrenamiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModulesList modules={plan.previewModules} isPreview={true} />
              </CardContent>
            </Card>
          )}

          {/* Full Modules */}
          {hasAccess && plan.fullModules && plan.fullModules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Programa de Entrenamiento Completo</CardTitle>
                <CardDescription>
                  Contenido de acceso completo - disponible para propietarios del plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModulesList modules={plan.fullModules} isPreview={false} />
              </CardContent>
            </Card>
          )}

          {/* Locked Content */}
          {!hasAccess && plan.fullModules && plan.fullModules.length > 0 && (
            <Card className="relative">
              <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-semibold mb-2">Contenido Premium Bloqueado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compra este plan para desbloquear {plan.fullModules.length} módulos adicionales
                  </p>
                  {user?.role === 'user' && (
                    <Button onClick={handlePurchase} loading={purchaseLoading}>
                      Desbloquear por {formatPrice(plan.price, plan.currency)}
                    </Button>
                  )}
                </div>
              </div>
              <CardHeader>
                <CardTitle>Programa de Entrenamiento Completo</CardTitle>
                <CardDescription>
                  {plan.fullModules.length} módulos con ejercicios e instrucciones detalladas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.fullModules.map((module, index) => (
                    <div key={module.id || index} className="p-4 border rounded-lg opacity-50">
                      <h4 className="font-medium">Módulo {index + 1}: {module.title || 'Sin título'}</h4>
                      <p className="text-sm text-muted-foreground">{module.description || 'Sin descripción'}</p>
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
                  loading={purchaseLoading}
                >
                  Comprar Plan
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
                <span className="text-muted-foreground">Total Módulos</span>
                <span className="font-medium">{allModules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiempo Estimado</span>
                <span className="font-medium">
                  {totalEstimatedTime > 0 ? formatEstimatedDuration(totalEstimatedTime) : '0 min'}
                </span>
              </div>
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

function ModulesList({ modules, isPreview }: { modules: TrainingModule[], isPreview: boolean }) {
  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay módulos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const moduleExercises = Array.isArray(module.exercises) ? module.exercises : [];
        
        return (
          <div key={module.id || index} className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">
                  Módulo {index + 1}: {module.title || 'Sin título'}
                </h4>
                <div className="flex items-center space-x-2">
                  {isPreview && (
                    <Badge variant="outline" className="text-xs">
                      Vista previa
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatEstimatedDuration(module.estimatedDuration || 0)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {module.description || 'Sin descripción'}
              </p>
              <div className="text-xs text-muted-foreground">
                📋 {moduleExercises.length} {moduleExercises.length === 1 ? 'ejercicio' : 'ejercicios'}
              </div>
            </div>
            
            {/* Exercises List */}
            {moduleExercises.length > 0 && (
              <div className="p-4 space-y-3 bg-white">
                {moduleExercises.map((exercise, exIndex) => (
                  <div key={exercise.id || exIndex} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm">{exIndex + 1}. {exercise.name || 'Sin nombre'}</h5>
                      {exercise.restTime && exercise.restTime > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Descanso: {exercise.restTime}s
                        </span>
                      )}
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {exercise.sets && exercise.sets > 0 && (
                        <span>Series: <span className="font-medium text-foreground">{exercise.sets}</span></span>
                      )}
                      {exercise.reps && (
                        <span>Reps: <span className="font-medium text-foreground">{exercise.reps}</span></span>
                      )}
                    </div>
                    {exercise.instructions && Array.isArray(exercise.instructions) && exercise.instructions.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium mb-1">Instrucciones:</div>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                          {exercise.instructions.map((instruction, i) => (
                            <li key={i}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}