'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrainingPlan } from '@/types/training-plan';

export default function AdminPlansPage() {
  const [plans, setPlans] = React.useState<TrainingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = React.useState<TrainingPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');

  React.useEffect(() => {
    loadPlans();
  }, []);

  React.useEffect(() => {
    let filtered = plans;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(plan => plan.difficulty === selectedLevel);
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, selectedLevel]);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const plansData: TrainingPlan[] = await response.json();
        setPlans(plansData);
        setFilteredPlans(plansData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading plans:', error);
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== planId));
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const getLevelBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' => {
    switch (level) {
      case 'advanced':
        return 'destructive';
      case 'intermediate':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div>Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Training Plans Management</CardTitle>
          <CardDescription>
            Manage all training plans on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 flex-1">
              <Input
                placeholder="Search plans by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Button asChild>
              <Link href="/app/admin/plans/create">
                Create Plan
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{plans.length}</div>
                <div className="text-sm text-muted-foreground">Total Plans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.difficulty === 'beginner').length}
                </div>
                <div className="text-sm text-muted-foreground">Beginner</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.difficulty === 'intermediate').length}
                </div>
                <div className="text-sm text-muted-foreground">Intermediate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.difficulty === 'advanced').length}
                </div>
                <div className="text-sm text-muted-foreground">Advanced</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Plans ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {plans.length === 0 ? 'No plans found' : 'No plans match the current filter'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {plan.coverImage && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={plan.coverImage}
                                alt={plan.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{plan.title}</h3>
                              <Badge variant={getLevelBadgeVariant(plan.difficulty)}>
                                {plan.difficulty}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {plan.shortDescription}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {/* Remove tag display since plans don't have tags */}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{plan.previewModules.length + plan.fullModules.length} modules</span>
                              <span>
                                {[...plan.previewModules, ...plan.fullModules].reduce((total: number, module: any) => 
                                  total + module.exercises.length, 0
                                )} exercises
                              </span>
                              <span className="font-medium text-primary">
                                ${plan.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/app/admin/plans/${plan.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deletePlan(plan.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}