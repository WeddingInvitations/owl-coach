'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.displayName}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your training platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Plans
            </CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">
              Training plans available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Library
            </CardTitle>
            <span className="text-2xl">🔓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Plans you own
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plan Groups
            </CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Training packages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Role
            </CardTitle>
            <span className="text-2xl">👤</span>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg">
              {user.role}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Based on Role */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* General Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Explore Training Plans</CardTitle>
            <CardDescription>
              Discover new training programs from expert coaches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/app/plans">
              <Button className="w-full">Browse All Plans</Button>
            </Link>
            <Link href="/app/groups">
              <Button variant="outline" className="w-full">View Plan Groups</Button>
            </Link>
            <Link href="/app/my-library">
              <Button variant="ghost" className="w-full">My Library</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Role-specific Actions */}
        {user.role === 'owner' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Manage users, plans, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
              <Link href="/app/admin/plans">
                <Button variant="outline" className="w-full">All Plans</Button>
              </Link>
              <Link href="/app/admin/groups">
                <Button variant="ghost" className="w-full">All Groups</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {(user.role === 'coach' || user.role === 'owner') && (
          <Card>
            <CardHeader>
              <CardTitle>Coach Panel</CardTitle>
              <CardDescription>
                Create and manage your training content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/coach/plans/create">
                <Button className="w-full">Create New Plan</Button>
              </Link>
              <Link href="/app/coach/plans">
                <Button variant="outline" className="w-full">My Plans</Button>
              </Link>
              <Link href="/app/coach/groups">
                <Button variant="ghost" className="w-full">My Groups</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {user.role === 'user' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Training</CardTitle>
              <CardDescription>
                Continue your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/app/my-library">
                <Button className="w-full">Continue Training</Button>
              </Link>
              <Link href="/app/plans">
                <Button variant="outline" className="w-full">Find New Plans</Button>
              </Link>
              <Link href="/app/groups">
                <Button variant="ghost" className="w-full">Plan Packages</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">📚</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New plan available: "HIIT Fundamentals"</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">📦</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New training package: "Complete Strength Bundle"</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">🏆</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Platform update: Enhanced video player</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}