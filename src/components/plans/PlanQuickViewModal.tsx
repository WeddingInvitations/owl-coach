import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDuration, formatDifficulty } from '@/lib/utils/formatters';
import { TrainingPlan } from '@/types/training-plan';

interface PlanQuickViewModalProps {
  plan: TrainingPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlanQuickViewModal({ plan, isOpen, onClose }: PlanQuickViewModalProps) {
  if (!plan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
        {/* children debe ir aquí, no dentro del Modal en sí */}
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>{plan.title}</CardTitle>
            <CardDescription>{plan.shortDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <img src={plan.coverImage} alt={plan.title} className="rounded w-full h-48 object-cover mb-2" />
              <div className="flex gap-2 items-center">
                <Badge variant="secondary">{formatDifficulty(plan.difficulty)}</Badge>
                <Badge variant="outline">{formatDuration(plan.duration)}</Badge>
                <span className="font-bold text-primary">{formatPrice(plan.price, plan.currency)}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Coach: {plan.coachName}</div>
            </div>
          </CardContent>
        </Card>
    </Modal>
  );
}
