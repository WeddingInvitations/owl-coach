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
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== planId));
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
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
        <div>Loading plans...</div>
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
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {plan.coverImage && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={plan.coverImage}
                                alt={plan.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{plan.title}</h3>
                              <Badge variant={getLevelBadgeVariant(plan.difficulty)}>
                                {plan.difficulty}
                              </Badge>
                              {plan.isPublished ? (
                                <Badge variant="default">Publicado</Badge>
                              ) : (
                                <Badge variant="secondary">No publicado</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {plan.shortDescription}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{plan.previewModules.length + plan.fullModules.length} módulos</span>
                              <span>
                                {[...plan.previewModules, ...plan.fullModules].reduce((total: number, module: any) => 
                                  total + module.exercises.length, 0
                                )} ejercicios
                              </span>
                              <span className="font-medium text-primary">
                                ${plan.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/app/admin/plans/${plan.id}`}>
                            Editar
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deletePlan(plan.id)}
                        >
                          Eliminar
                        </Button>
                        <Button
                          variant={plan.isPublished ? "secondary" : "default"}
                          size="sm"
                          onClick={() => togglePublish(plan.id)}
                        >
                          {plan.isPublished ? "Despublicar" : "Publicar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}