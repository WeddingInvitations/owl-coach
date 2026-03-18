'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuthUser } from '@/types/auth';

interface HeaderProps {
  user?: AuthUser;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🦉</span>
            </div>
            <span className="text-xl font-bold">Owl Coach</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/app/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/app/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/app/plans"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/app/plans') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Plans
            </Link>
            <Link 
              href="/app/groups"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/app/groups') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Groups
            </Link>
            <Link 
              href="/app/my-library"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/app/my-library') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Library
            </Link>

            {/* Role-based navigation */}
            {user?.role === 'owner' && (
              <Link 
                href="/app/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/app/admin') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Admin
              </Link>
            )}

            {(user?.role === 'coach' || user?.role === 'owner') && (
              <Link 
                href="/app/coach"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/app/coach') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Coach Panel
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}