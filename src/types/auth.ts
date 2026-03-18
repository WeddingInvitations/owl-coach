import { UserRole } from './user';

export type { UserRole } from './user';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user?: AuthUser;
  token?: string;
  error?: string;
}