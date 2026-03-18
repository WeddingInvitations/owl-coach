'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AuthUser } from '@/types/auth';
import { TrainingPlan } from '@/types/training-plan';
import { TrainingPlanGroup } from '@/types/training-plan-group';
import { Purchase } from '@/types/purchase';

export default function AdminPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    users: 0,
    plans: 0,
    groups: 0,
    purchases: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load users stats
      const usersResponse = await fetch('/api/admin/users');
      const users = usersResponse.ok ? await usersResponse.json() : [];

      // Load plans stats
      const plansResponse = await fetch('/api/plans');
      const plans = plansResponse.ok ? await plansResponse.json() : [];

      // Load groups stats
      const groupsResponse = await fetch('/api/groups');
      const groups = groupsResponse.ok ? await groupsResponse.json() : [];

      // Load purchases stats
      const purchasesResponse = await fetch('/api/purchases');
      const purchases = purchasesResponse.ok ? await purchasesResponse.json() : [];

      const totalRevenue = purchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0);

      setStats({
        users: users.length,
        plans: plans.length,
        groups: groups.length,
        purchases: purchases.length,
        revenue: totalRevenue,
      });

      // Recent activity (last 5 purchases)
      const recentPurchases = purchases
        .sort((a: Purchase, b: Purchase) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setRecentActivity(recentPurchases);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-xs text-muted-foreground">
              Platform registrations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Training Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plans}</div>
            <div className="text-xs text-muted-foreground">
              Individual courses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groups}</div>
            <div className="text-xs text-muted-foreground">
              Package offerings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.purchases}</div>
            <div className="text-xs text-muted-foreground">
              Successful orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Total earnings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>
            Latest purchase activity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((purchase: Purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      Purchase #{purchase.id.slice(-8)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      User: {purchase.userId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Item: {purchase.productId} ({purchase.productType})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      ${purchase.amount.toFixed(2)}
                    </div>
                    <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Create Training Plan</div>
              <div className="text-sm text-muted-foreground">Add new course content</div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Create Plan Group</div>
              <div className="text-sm text-muted-foreground">Bundle plans together</div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-muted-foreground">View and edit user accounts</div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">Download reports</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}