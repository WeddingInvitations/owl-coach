import { User } from '@/types/user';

export function canEditModules(user: User) {
  return user?.role === 'owner' || user?.role === 'coach';
}

export function canViewModules(user: User) {
  return !!user;
}
