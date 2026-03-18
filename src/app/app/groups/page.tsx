'use client';

import * as React from 'react';
import { TrainingPlanGroup } from '@/types/training-plan-group';
import { GroupCard } from '@/components/groups/GroupCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuthUser } from '@/types/auth';

export default function GroupsPage() {
  const [groups, setGroups] = React.useState<TrainingPlanGroup[]>([]);
  const [userAccess, setUserAccess] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadGroups();
    loadUserAccess();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load groups');
      }

      setGroups(result.data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/entitlements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const groupIds = result.data?.purchasedGroups?.map((g: any) => g.productId) || [];
        setUserAccess(groupIds);
      }
    } catch (error) {
      console.error('Failed to load user access:', error);
    }
  };

  const handlePurchase = async (groupId: string) => {
    if (!user) return;

    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productType: 'group',
          productId: groupId,
          amount: group.price,
          currency: group.currency,
          paymentProvider: 'simulated'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'La compra ha fallado');
      }

      await loadUserAccess();
      alert('¡Compra realizada con éxito! Ya tienes acceso a todos los planes de este paquete.');
    } catch (error: any) {
      alert(`La compra ha fallado: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading groups..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paquetes de Entrenamiento</h1>
        <p className="text-muted-foreground">
          Descubre paquetes de planes de entrenamiento con grandes descuentos
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No hay Paquetes Disponibles"
          description="No hay paquetes de entrenamiento disponibles en este momento. ¡Vuelve más tarde para ver nuevos bundles!"
          icon={<span className="text-4xl">📦</span>}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              showPurchaseButton={user?.role === 'user'}
              userHasAccess={userAccess.includes(group.id)}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}