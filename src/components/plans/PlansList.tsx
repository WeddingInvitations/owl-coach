'use client';

import * as React from 'react';
import { TrainingPlan } from '@/types/training-plan';
import { PlanCard } from './PlanCardComponent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlanQuickViewModal } from './PlanQuickViewModal';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      img: any;
      span: any;
      select: any;
      option: any;
      button: any;
      input: any;
      form: any;
    }
  }
}

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
  const [quickViewPlan, setQuickViewPlan] = React.useState<TrainingPlan | null>(null);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const handleQuickView = (plan: TrainingPlan) => {
    setQuickViewPlan(plan);
    setQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setQuickViewOpen(false);
    setQuickViewPlan(null);
  };

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="md:max-w-xs"
        />
        
        <div className="flex gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todas las dificultades</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="recent">Más recientes</option>
            <option value="name">Nombre A-Z</option>
            <option value="price-low">Precio: de menor a mayor</option>
            <option value="price-high">Precio: de mayor a menor</option>
            <option value="duration">Duración</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || selectedDifficulty) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredPlans.length} de {plans.length} planes
          </span>
          {searchTerm && (
            <Badge variant="outline">
              Búsqueda: "{searchTerm}"
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
              Dificultad: {selectedDifficulty}
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
          title="No se encontraron planes"
          description={
            searchTerm || selectedDifficulty
              ? "No hay planes que coincidan con tus filtros actuales. Intenta ajustar tus criterios de búsqueda."
              : "No hay planes de entrenamiento disponibles en este momento."
          }
          icon={<span className="text-4xl">📚</span>}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan: TrainingPlan) => (
            <div key={plan.id} className="cursor-pointer" onClick={() => handleQuickView(plan)}>
              <PlanCard
                plan={plan}
                showPurchaseButton={showPurchaseButtons}
                showManageButton={showManageButtons}
                userHasAccess={userAccess.includes(plan.id)}
                onPurchase={onPurchase}
              />
            </div>
          ))}
        </div>
      )}
      <PlanQuickViewModal plan={quickViewPlan} isOpen={quickViewOpen} onClose={handleCloseQuickView} />
    </div>
  );
}