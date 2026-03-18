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
        throw new Error('Please sign in to view your library');
      }

      // Get user entitlements
      const entitlementsResponse = await fetch('/api/entitlements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!entitlementsResponse.ok) {
        throw new Error('Failed to load your library');
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
        <LoadingSpinner size="lg" text="Loading your library..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Unable to Load Library</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
        <p className="text-muted-foreground">
          Access your purchased training plans and track your progress
        </p>
      </div>

      {unlockedPlans.length === 0 ? (
        <EmptyState
          title="Your Library is Empty"
          description="You haven't purchased any training plans yet. Browse our catalog to find plans that match your fitness goals."
          icon={<span className="text-4xl">📚</span>}
          action={{
            label: 'Browse Plans',
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
                  Owned Plans
                </CardTitle>
                <span className="text-2xl">📚</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unlockedPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Training plans in your library
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
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
                  Total investment in training
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Duration
                </CardTitle>
                <span className="text-2xl">⏱️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {unlockedPlans.reduce((total, plan) => total + plan.duration, 0)} weeks
                </div>
                <p className="text-xs text-muted-foreground">
                  Of structured training content
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
                      ✅ Owned
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
                    by {plan.coachName}
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
                      <span>{plan.previewModules.length + plan.fullModules.length} modules</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/app/plans/${plan.slug}?access=true`} className="flex-1">
                      <Button className="w-full">
                        Start Training
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