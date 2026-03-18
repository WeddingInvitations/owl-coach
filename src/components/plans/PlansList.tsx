'use client';

import * as React from 'react';
import { TrainingPlan } from '@/types/training-plan';
import { PlanCard } from './PlanCardComponent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PlansListProps {
  plans?: TrainingPlan[];
  loading?: boolean;
  error?: string;
  showPurchaseButtons?: boolean;
  showManageButtons?: boolean;
  userAccess?: string[]; // Array of plan IDs user has access to
  onPurchase?: (planId: string) => void;
  onRefresh?: () => void;
}

export function PlansList({ 
  plans = [], 
  loading = false, 
  error,
  showPurchaseButtons = false,
  showManageButtons = false,
  userAccess = [],
  onPurchase,
  onRefresh
}: PlansListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('recent');

  // Filter and sort plans
  const filteredPlans = React.useMemo(() => {
    let filtered = plans;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.coachName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(plan => plan.difficulty === selectedDifficulty);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [plans, searchTerm, selectedDifficulty, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading plans..." />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Plans"
        description={error}
        icon={<span className="text-4xl">⚠️</span>}
        action={onRefresh ? {
          label: 'Try Again',
          onClick: onRefresh
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-xs"
        />
        
        <div className="flex gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || selectedDifficulty) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredPlans.length} of {plans.length} plans
          </span>
          {searchTerm && (
            <Badge variant="outline">
              Search: "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedDifficulty && (
            <Badge variant="outline">
              {selectedDifficulty}
              <button
                onClick={() => setSelectedDifficulty('')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          title="No Plans Found"
          description={
            searchTerm || selectedDifficulty
              ? "No plans match your current filters. Try adjusting your search criteria."
              : "There are no training plans available at the moment."
          }
          icon={<span className="text-4xl">📚</span>}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              showPurchaseButton={showPurchaseButtons}
              showManageButton={showManageButtons}
              userHasAccess={userAccess.includes(plan.id)}
              onPurchase={onPurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}