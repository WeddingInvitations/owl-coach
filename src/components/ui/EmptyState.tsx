import * as React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}