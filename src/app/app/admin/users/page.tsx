'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { User } from '@/types/user';
import { UserRole } from '@/types/auth';
import { getUserProfile, listUsers, setUserRole, createCoachProfile } from '@/lib/firebase/users';
import { createAuthUserAsAdmin } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

interface CreateCoachForm {
  firstName: string;
  lastName: string;
  email: string;
  tempPassword: string;
}

const EMPTY_FORM: CreateCoachForm = { firstName: '', lastName: '', email: '', tempPassword: '' };

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<UserRole | 'all'>('all');
  const [currentUserId, setCurrentUserId] = React.useState<string>('');
  const [error, setError] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<CreateCoachForm>(EMPTY_FORM);
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState('');
  const [createSuccess, setCreateSuccess] = React.useState('');

  React.useEffect(() => {
    verifyOwnerAndLoadUsers();
  }, []);

  React.useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedRole !== 'all') {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const verifyOwnerAndLoadUsers = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) { router.push('/login'); return; }
      const parsedUser = JSON.parse(storedUser) as { id: string };
      const profile = await getUserProfile(parsedUser.id);
      if (!profile || profile.role !== 'owner') { router.push('/app/dashboard'); return; }
      setCurrentUserId(profile.id);
      const usersData = await listUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    } catch (loadError: any) {
      console.error('Error loading users:', loadError);
      setError('No se pudieron cargar los usuarios');
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setError('');
    try {
      const user = users.find((u) => u.id === userId);
      if (user && user.role === 'user' && newRole !== 'user') {
        setError('No puedes cambiar el tipo de usuario a owner o coach desde user');
        return;
      }
      await setUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (updateError: any) {
      console.error('Error updating user role:', updateError);
      setError('No tienes permisos para cambiar roles o ocurrió un error');
    }
  };

    const [confirmDeleteUserId, setConfirmDeleteUserId] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);
    const deleteUser = async () => {
      if (!confirmDeleteUserId) return;
      setError('');
      setDeleting(true);
      try {
        // Llama a la API backend para eliminar usuario completamente
        await fetch('/api/admin/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: confirmDeleteUserId }),
        });
        setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUserId));
        setConfirmDeleteUserId(null);
      } catch (deleteError: any) {
        console.error('Error deleting user:', deleteError);
        setError('No tienes permisos para eliminar usuarios o ocurrió un error');
      } finally {
        setDeleting(false);
      }
    };

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    const { firstName, lastName, email, tempPassword } = createForm;
    if (!firstName || !lastName || !email || !tempPassword) {
      setCreateError('Todos los campos son obligatorios');
      return;
    }
    if (tempPassword.length < 6) {
      setCreateError('La contraseña temporal debe tener al menos 6 caracteres');
      return;
    }
    setCreating(true);
    try {
      const { uid, error: authError } = await createAuthUserAsAdmin(email, tempPassword, `${firstName} ${lastName}`);
      if (authError || !uid) throw new Error(authError || 'Error al crear el usuario');
      const newUser = await createCoachProfile({ uid, email, firstName, lastName });
      setUsers((prev) => [...prev, newUser]);
      setCreateSuccess(`Coach "${firstName} ${lastName}" creado. Al iniciar sesión se le pedirá cambiar la contraseña.`);
      setCreateForm(EMPTY_FORM);
    } catch (err: any) {
      const msg = err.message || '';
      setCreateError(
        msg.includes('email-already-in-use')
          ? 'Ya existe un usuario con ese correo electrónico'
          : msg || 'Error al crear el coach',
      );
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' | 'destructive' => {
    switch (role) {
      case 'owner': return 'destructive';
      case 'coach': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'coach': return 'Coach';
      default: return 'Usuario';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div>Cargando usuarios...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header + Create Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Gestiona cuentas de usuario y roles en la plataforma</CardDescription>
            </div>
            <Button onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(''); setCreateSuccess(''); }}>
              {showCreateForm ? 'Cancelar' : '+ Añadir Coach'}
            </Button>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t pt-6">
            <h3 className="text-base font-semibold mb-4">Nuevo Coach</h3>
            <form onSubmit={handleCreateCoach} className="space-y-4">
              {createError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{createError}</div>
              )}
              {createSuccess && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">{createSuccess}</div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Nombre" placeholder="Nombre" value={createForm.firstName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} required />
                <Input label="Apellidos" placeholder="Apellidos" value={createForm.lastName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Correo electrónico" type="email" placeholder="coach@ejemplo.com" value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required />
                <Input label="Contraseña temporal" type="text" placeholder="Mínimo 6 caracteres" value={createForm.tempPassword}
                  onChange={(e) => setCreateForm((f) => ({ ...f, tempPassword: e.target.value }))} required />
              </div>
              <div className="flex gap-3">
                <Button type="submit" loading={creating}>Crear Coach</Button>
                <Button type="button" variant="outline"
                  onClick={() => { setShowCreateForm(false); setCreateForm(EMPTY_FORM); setCreateError(''); setCreateSuccess(''); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        <CardContent className={showCreateForm ? 'border-t pt-6' : ''}>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>
          )}
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Buscar por nombre o email..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">Todos los Roles</option>
              <option value="owner">Propietario</option>
              <option value="coach">Coach</option>
              <option value="user">Usuario</option>
            </select>
          </div>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total', count: users.length },
              { label: 'Propietarios', count: users.filter((u) => u.role === 'owner').length },
              { label: 'Coaches', count: users.filter((u) => u.role === 'coach').length },
              { label: 'Usuarios', count: users.filter((u) => u.role === 'user').length },
            ].map(({ label, count }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {users.length === 0 ? 'No se encontraron usuarios' : 'Ningún usuario coincide con el filtro'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium uppercase">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        {user.firstName} {user.lastName}
                        {user.mustChangePassword && (
                          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Pendiente cambio de contraseña
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                    <div className="flex gap-2">
                      {/* Only allow owner to change roles, and only if user is not 'user' */}
                      {user.role !== 'owner' && user.role !== 'user' && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateUserRole(user.id, 'owner')}
                          disabled={user.id === currentUserId}>
                          Owner
                        </Button>
                      )}
                      {user.role !== 'coach' && user.role !== 'user' && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateUserRole(user.id, 'coach')}
                          disabled={user.id === currentUserId && user.role === 'owner'}>
                          Coach
                        </Button>
                      )}
                      {user.role !== 'user' && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateUserRole(user.id, 'user')}
                          disabled={user.id === currentUserId && user.role === 'owner'}>
                          Usuario
                        </Button>
                      )}
                      {/* Delete user button for owners, not for self or other owners */}
                      {user.role !== 'owner' && user.id !== currentUserId && (
                        <Button size="sm" variant="destructive"
                          onClick={() => setConfirmDeleteUserId(user.id)}>
                          Eliminar
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
      {/* Confirm Delete Modal */}
      {confirmDeleteUserId && (
        <ConfirmModal
          isOpen={!!confirmDeleteUserId}
          onClose={() => setConfirmDeleteUserId(null)}
          onConfirm={deleteUser}
          title="Confirmar eliminación"
          description="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="destructive"
          loading={deleting}
        />
      )}
    </div>
  );
}
