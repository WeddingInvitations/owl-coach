'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrainingPlan } from '@/types/training-plan';

export default function AdminPlansPage() {
    const togglePublish = async (planId: string) => {
      try {
        // Obtiene el usuario actual y su token usando getCurrentUser
        const { getCurrentUser } = await import('@/lib/firebase/auth');
        const user = getCurrentUser();
        const token = user ? await user.getIdToken() : null;
        if (!token) {
          alert('No se pudo obtener el token de autenticación.');
          return;
        }
        const response = await fetch(`/api/plans/${planId}/publish`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const updated = await response.json();
          setPlans(plans.map(p => p.id === planId ? updated.data : p));
        }
      } catch (error) {
        console.error('Error toggling publish:', error);
      }
    };
  const [plans, setPlans] = React.useState<TrainingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = React.useState<TrainingPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');

  React.useEffect(() => {
    loadPlans();
  }, []);

  React.useEffect(() => {
    let filtered = plans;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(plan => plan.difficulty === selectedLevel);
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, selectedLevel]);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const { data } = await response.json();
        setPlans(data);
        setFilteredPlans(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading plans:', error);
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) return;

    try {
      const { getCurrentUser } = await import('@/lib/firebase/auth');
      const user = getCurrentUser();
      const token = user ? await user.getIdToken() : null;
      if (!token) {
        alert('No se pudo obtener el token de autenticación.');
        return;
      }

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== planId));
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el plan: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error al eliminar el plan');
    }
  };

  const getLevelBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' => {
    switch (level) {
      case 'advanced':
        return 'destructive';
      case 'intermediate':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div>Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de planes de entrenamiento</CardTitle>
          <CardDescription>
            Gestiona todos los planes de entrenamiento en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 flex-1">
              <Input
                placeholder="Buscar planes por título, descripción o etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos los niveles</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
            <Button asChild>
              <Link href="/app/admin/plans/create">
                Crear Plan
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{plans.length}</div>
                <div className="text-sm text-muted-foreground">Total de Planes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.difficulty === 'principiante').length}
                </div>
                <div className="text-sm text-muted-foreground">Principiante</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.difficulty === 'intermedio').length}
                </div>
                <div className="text-sm text-muted-foreground">Intermedio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.difficulty === 'avanzado').length}
                </div>
                <div className="text-sm text-muted-foreground">Avanzado</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Planes ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {plans.length === 0 ? 'No se han encontrado planes' : 'No hay planes que coincidan con el filtro actual'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPlans.map((plan: any) => {
                // Compatibilidad: ejercicios directos (nuevo) o dentro de módulos (antiguo)
                const directExercises: any[] = Array.isArray(plan.exercises) ? plan.exercises : [];
                const legacyModules: any[] = [
                  ...((Array.isArray(plan.previewModules) ? plan.previewModules : [])),
                  ...((Array.isArray(plan.fullModules) ? plan.fullModules : [])),
                ];
                const legacyExercises: any[] = legacyModules.flatMap((m: any) =>
                  Array.isArray(m.exercises) ? m.exercises : []
                );
                const allExercises = directExercises.length > 0 ? directExercises : legacyExercises;

                return (
                <div key={plan.id} className="border rounded-lg p-4 bg-white shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-blue-700">{plan.title}</span>
                      <Badge variant={getLevelBadgeVariant(plan.difficulty)}>{plan.difficulty}</Badge>
                      {plan.isPublished
                        ? <Badge variant="default">Publicado</Badge>
                        : <Badge variant="secondary">Borrador</Badge>}
                      <span className="text-sm text-gray-500">
                        · {allExercises.length} ejercicios
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/app/admin/plans/${plan.id}`}>Editar</Link>
                      </Button>
                      <Button
                        variant={plan.isPublished ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => togglePublish(plan.id)}
                      >
                        {plan.isPublished ? 'Despublicar' : 'Publicar'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deletePlan(plan.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3 text-gray-700 text-sm">{plan.shortDescription}</div>
                  <div className="text-xs text-gray-500 mb-3">
                    {plan.duration} semanas
                    {(plan.estimatedDuration ?? 0) > 0 ? ` · ${plan.estimatedDuration} min` : ''}
                    {' · '}<span className="font-semibold text-primary">${plan.price}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-800 text-sm">Ejercicios:</span>
                    {allExercises.length === 0 ? (
                      <div className="text-sm text-gray-400 mt-1">Sin ejercicios añadidos.</div>
                    ) : (
                      <ul className="mt-2 grid gap-2">
                        {allExercises.map((ex: any, i: number) => (
                          <li key={ex.id ?? i} className="border rounded p-2 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-blue-600 text-sm">{ex.name}</span>
                              {ex.restTime > 0 && <span className="text-xs text-gray-500">Descanso: {ex.restTime}s</span>}
                            </div>
                            {ex.tipo && <div className="text-xs text-gray-500 mb-1">Tipo: {ex.tipo}</div>}
                            {ex.description && <div className="text-xs text-gray-700 mb-1">{ex.description}</div>}
                            <div className="text-xs text-gray-600">
                              {ex.sets > 0 ? `Series: ${ex.sets}` : ''}
                              {ex.reps ? ` | Reps: ${ex.reps}` : ''}
                            </div>
                            {Array.isArray(ex.instructions) && ex.instructions.length > 0 && (
                              <ul className="ml-4 mt-1 text-xs text-gray-500">
                                {ex.instructions.map((inst: string, j: number) => (
                                  <li key={j}>• {inst}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}