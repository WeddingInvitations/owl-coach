'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TrainingPlan } from '@/types/training-plan';
import { formatPrice, formatDuration, formatDifficulty } from '@/lib/utils/formatters';

interface PlanCardProps {
  plan: TrainingPlan;
  showPurchaseButton?: boolean;
  isOwned?: boolean;
  onPurchase?: (planId: string) => void;
  purchasing?: boolean;
}

export function PlanCard({ 
  plan, 
  showPurchaseButton = true, 
  isOwned = false,
  onPurchase,
  purchasing = false 
}: PlanCardProps) {
  return (
    <Card className="h-full flex flex-col">
      {/* Cover Image */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={plan.coverImage}
          alt={plan.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge variant={plan.difficulty === 'beginner' ? 'success' : 
                        plan.difficulty === 'intermediate' ? 'warning' : 'destructive'}>
            {formatDifficulty(plan.difficulty)}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">{formatDuration(plan.duration)}</Badge>
          <span className="text-lg font-bold text-primary">
            {formatPrice(plan.price, plan.currency)}
          </span>
        </div>
        <CardTitle className="line-clamp-2">{plan.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {plan.shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {/* Coach Info */}
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs">👨‍💼</span>
            </div>
            <span className="text-sm text-muted-foreground">
              by {plan.coachName}
            </span>
          </div>

          {/* Preview Modules Count */}
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs">📚</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {plan.previewModules.length} preview modules, {plan.fullModules.length} total modules
            </span>
          </div>

          {/* Status */}
          {isOwned && (
            <Badge variant="success" className="w-fit">
              ✓ Owned
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="w-full space-y-2">
          <Link href={`/app/plans/${plan.slug}`} className="block w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          
          {showPurchaseButton && !isOwned && (
            <Button 
              className="w-full"
              onClick={() => onPurchase?.(plan.id)}
              loading={purchasing}
              disabled={!plan.isPublished}
            >
              {plan.isPublished ? 'Purchase Plan' : 'Not Available'}
            </Button>
          )}
          
          {isOwned && (
            <Link href={`/app/plans/${plan.slug}?access=true`} className="block w-full">
              <Button className="w-full">
                Start Training
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}