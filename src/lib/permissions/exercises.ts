import { User } from '@/types/user';

export function canEditExercises(user: User) {
  return user?.role === 'owner' || user?.role === 'coach';
}

export function canViewExercises(user: User) {
  return !!user;
}
