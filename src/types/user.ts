export type UserRole = 'owner' | 'coach' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: UserRole;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: UserRole;
}
