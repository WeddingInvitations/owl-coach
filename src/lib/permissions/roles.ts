import { UserRole } from '@/types/user';

export const ROLES: Record<UserRole, UserRole> = {
  owner: 'owner',
  coach: 'coach',
  user: 'user',
} as const;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  coach: 2,
  owner: 3,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isOwner(userRole: UserRole): boolean {
  return userRole === ROLES.owner;
}

export function isCoach(userRole: UserRole): boolean {
  return userRole === ROLES.coach;
}

export function isUser(userRole: UserRole): boolean {
  return userRole === ROLES.user;
}

export function canManageUsers(userRole: UserRole): boolean {
  return isOwner(userRole);
}

export function canCreatePlans(userRole: UserRole): boolean {
  return isOwner(userRole) || isCoach(userRole);
}

export function canManageOwnContent(userRole: UserRole): boolean {
  return isOwner(userRole) || isCoach(userRole);
}

export function canManageAllContent(userRole: UserRole): boolean {
  return isOwner(userRole);
}

export function canAccessAdminPanel(userRole: UserRole): boolean {
  return isOwner(userRole);
}

export function canAccessCoachPanel(userRole: UserRole): boolean {
  return isOwner(userRole) || isCoach(userRole);
}