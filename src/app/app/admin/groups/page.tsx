'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrainingPlanGroup } from '@/types/training-plan-group';
import { TrainingPlan } from '@/types/training-plan';
import { formatPrice } from '@/lib/utils/formatters';

export default function AdminGroupsPage() {
  const [groups, setGroups] = React.useState<TrainingPlanGroup[]>([]);
  const [plans, setPlans] = React.useState<TrainingPlan[]>([]);
  const [filteredGroups, setFilteredGroups] = React.useState<TrainingPlanGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    let filtered = groups;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.coachName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGroups(filtered);
  }, [groups, searchTerm]);

  const loadData = async () => {
    try {
      const [groupsResponse, plansResponse] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/plans')
      ]);

      if (groupsResponse.ok) {
        const groupsData: TrainingPlanGroup[] = await groupsResponse.json();
        setGroups(groupsData);
        setFilteredGroups(groupsData);
      }

      if (plansResponse.ok) {
        const plansData: TrainingPlan[] = await plansResponse.json();
        setPlans(plansData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paquete?')) return;

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGroups(groups.filter(group => group.id !== groupId));
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const getGroupPlans = (group: TrainingPlanGroup): TrainingPlan[] => {
    return plans.filter(plan => group.includedPlanIds.includes(plan.id));
  };

  const calculateOriginalPrice = (group: TrainingPlanGroup): number => {
    const groupPlans = getGroupPlans(group);
    return groupPlans.reduce((sum, plan) => sum + plan.price, 0);
  };

  const calculateDiscount = (group: TrainingPlanGroup): number => {
    const originalPrice = calculateOriginalPrice(group);
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - group.price) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div>Cargando paquetes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Paquetes de Planes</CardTitle>
          <CardDescription>
            Gestiona paquetes y bundles de planes de entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Buscar paquetes por título, descripción o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button asChild>
              <Link href="/app/admin/groups/create">
                Crear paquete
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{groups.length}</div>
                <div className="text-sm text-muted-foreground">Total paquetes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {groups.reduce((total, g) => total + g.includedPlanIds.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Planes en paquetes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {groups.length > 0 
                    ? Math.round(groups.reduce((sum, g) => sum + calculateDiscount(g), 0) / groups.length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Descuento medio</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>Paquetes ({filteredGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {groups.length === 0 ? 'No se encontraron paquetes' : 'Ningún paquete coincide con la búsqueda'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredGroups.map((group) => {
                const groupPlans = getGroupPlans(group);
                const originalPrice = calculateOriginalPrice(group);
                const discount = calculateDiscount(group);

                return (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {group.coverImage && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={group.coverImage}
                                  alt={group.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{group.title}</h3>
                                {discount > 0 && (
                                  <Badge variant="destructive">
                                    {discount}% OFF
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {group.shortDescription}
                              </p>
                              
                              <div className="space-y-2 mb-3">
                                <div className="text-sm font-medium">
                                  Planes incluidos ({groupPlans.length}):
                                </div>
                                <div className="grid gap-1">
                                  {groupPlans.slice(0, 3).map((plan) => (
                                    <div key={plan.id} className="text-sm text-muted-foreground">
                                      • {plan.title}
                                    </div>
                                  ))}
                                  {groupPlans.length > 3 && (
                                    <div className="text-sm text-muted-foreground">
                                      • +{groupPlans.length - 3} planes más
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  {group.includedPlanIds.length} planes
                                </span>
                                <div className="flex items-center gap-2">
                                  {originalPrice > group.price && (
                                    <span className="text-muted-foreground line-through">
                                      {formatPrice(originalPrice, group.currency)}
                                    </span>
                                  )}
                                  <span className="font-medium text-primary text-lg">
                                    {formatPrice(group.price, group.currency)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/app/admin/groups/${group.id}`}>
                              Editar
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteGroup(group.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}