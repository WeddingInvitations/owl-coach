'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User } from '@/types/user';
import { UserRole } from '@/types/auth';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<UserRole | 'all'>('all');

  React.useEffect(() => {
    loadUsers();
  }, []);

  React.useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const usersData: User[] = await response.json();
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' | 'destructive' => {
    switch (role) {
      case 'owner':
        return 'destructive';
      case 'coach':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and roles across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="coach">Coach</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'owner').length}
                </div>
                <div className="text-sm text-muted-foreground">Owners</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'coach').length}
                </div>
                <div className="text-sm text-muted-foreground">Coaches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'user').length}
                </div>
                <div className="text-sm text-muted-foreground">Users</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {users.length === 0 ? 'No users found' : 'No users match the current filter'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {user.role !== 'coach' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserRole(user.id, 'coach')}
                        >
                          Make Coach
                        </Button>
                      )}
                      
                      {user.role !== 'user' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserRole(user.id, 'user')}
                        >
                          Make User
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}