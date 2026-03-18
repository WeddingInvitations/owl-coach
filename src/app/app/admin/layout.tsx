'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AuthUser } from '@/types/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is owner
      if (parsedUser.role !== 'owner') {
        window.location.href = '/app/dashboard';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  if (!user || user.role !== 'owner') {
    return (
      <div className="flex justify-center py-12">
        <div>Loading...</div>
      </div>
    );
  }

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">⚙️</span>
            <span>Admin Panel</span>
          </CardTitle>
          <CardDescription>
            Platform administration and management tools
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Admin Navigation */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/app/admin/users">
          <Card className={`cursor-pointer transition-colors ${
            isActive('/app/admin/users') ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Users</div>
              <div className="text-xs text-muted-foreground">Manage users & roles</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/admin/plans">
          <Card className={`cursor-pointer transition-colors ${
            isActive('/app/admin/plans') ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Plans</div>
              <div className="text-xs text-muted-foreground">All training plans</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/admin/groups">
          <Card className={`cursor-pointer transition-colors ${
            isActive('/app/admin/groups') ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium">Groups</div>
              <div className="text-xs text-muted-foreground">Plan packages</div>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-not-allowed opacity-60">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Analytics</div>
            <div className="text-xs text-muted-foreground">Coming soon</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Content */}
      <div>{children}</div>
    </div>
  );
}