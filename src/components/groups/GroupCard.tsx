import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrainingPlanGroup } from '@/types/training-plan-group';
import { formatPrice } from '@/lib/utils/formatters';

interface GroupCardProps {
  group: TrainingPlanGroup;
  showPurchaseButton?: boolean;
  showManageButton?: boolean;
  onPurchase?: (groupId: string) => void;
  userHasAccess?: boolean;
}

export function GroupCard({ 
  group, 
  showPurchaseButton = false, 
  showManageButton = false,
  onPurchase,
  userHasAccess = false
}: GroupCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={group.coverImage}
          alt={group.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="info">
            📦 Package
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant={group.isPublished ? 'success' : 'warning'}>
            {group.isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {group.includedPlanIds.length} Plans Included
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/app/groups/${group.slug}`}>
                {group.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-2">
              by {group.coachName}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {formatPrice(group.price, group.currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              Bundle Price
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {group.shortDescription}
        </p>

        {/* Group Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <span>📚</span>
            <span>{group.includedPlanIds.length} training plans</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>💰</span>
            <span>Bundle savings</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link href={`/app/groups/${group.slug}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>

          {showPurchaseButton && !userHasAccess && (
            <Button 
              onClick={() => onPurchase?.(group.id)}
              className="flex-1"
            >
              Purchase Bundle
            </Button>
          )}

          {userHasAccess && (
            <Link href={`/app/groups/${group.slug}?access=true`} className="flex-1">
              <Button className="w-full">
                Access Plans
              </Button>
            </Link>
          )}

          {showManageButton && (
            <Link href={`/app/coach/groups/${group.id}/edit`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Manage
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}