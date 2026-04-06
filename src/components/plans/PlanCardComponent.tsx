import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrainingPlan } from '@/types/training-plan';
import { formatPrice, formatDuration, formatDifficulty } from '@/lib/utils/formatters';

interface PlanCardProps {
  plan: TrainingPlan;
  showPurchaseButton?: boolean;
  showManageButton?: boolean;
  onPurchase?: (planId: string) => void;
  userHasAccess?: boolean;
}

export function PlanCard({ 
  plan, 
  showPurchaseButton = false, 
  showManageButton = false,
  onPurchase,
  userHasAccess = false
}: PlanCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={plan.coverImage}
          alt={plan.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">
            {formatDifficulty(plan.difficulty)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant={plan.isPublished ? 'success' : 'warning'}>
            {plan.isPublished ? 'Publicado' : 'Borrador'}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/app/plans/${plan.slug}`}>
                {plan.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-2">
              por {plan.coachName}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {formatPrice(plan.price, plan.currency)}
            </div>
          </div>
        </div>
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
            <span>{plan.previewModules.length + plan.fullModules.length} módulos</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link href={`/app/plans/${plan.slug}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Detalle
            </Button>
          </Link>

          {showPurchaseButton && !userHasAccess && plan.isPublished && (
            <Button 
              onClick={() => onPurchase?.(plan.id)}
              className="flex-1"
            >
              Comprar
            </Button>
          )}

          {userHasAccess && (
            <Link href={`/app/plans/${plan.slug}?access=true`} className="flex-1">
              <Button className="w-full">
                Acceder al plan
              </Button>
            </Link>
          )}

          {showManageButton && (
            <Link href={`/app/coach/plans/${plan.id}/edit`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Gestionar
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}