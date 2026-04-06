'use client';

import * as React from 'react';
import { PlansList } from '@/components/plans/PlansList';
import { TrainingPlan } from '@/types/training-plan';
import { AuthUser } from '@/types/auth';

export default function PlansPage() {
  const [plans, setPlans] = React.useState<TrainingPlan[]>([]);
  const [userAccess, setUserAccess] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadPlans();
    loadUserAccess();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load plans');
      }

      setPlans(result.data || []);
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
        setUserAccess(result.data?.unlockedPlanIds || []);
      }
    } catch (error) {
      console.error('Failed to load user access:', error);
    }
  };

  const handlePurchase = async (planId: string) => {
    if (!user) return;

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productType: 'plan',
          productId: planId,
          amount: plan.price,
          currency: plan.currency,
          paymentProvider: 'simulated'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'La compra ha fallado');
      }

      // Refresh user access
      await loadUserAccess();
      
      alert('¡Compra realizada con éxito! Ya tienes acceso a este plan.');
    } catch (error: any) {
      alert(`La compra ha fallado: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planes de Entrenamiento</h1>
        <p className="text-muted-foreground">
          Descubre programas de entrenamiento profesionales de coaches certificados
        </p>
      </div>

      <PlansList
        plans={user?.role === 'user' ? plans.filter(p => p.isPublished) : plans}
        loading={loading}
        error={error}
        showPurchaseButtons={user?.role === 'user'}
        userAccess={userAccess}
        onPurchase={handlePurchase}
        onRefresh={loadPlans}
      />
    </div>
  );
}