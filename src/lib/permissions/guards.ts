import { UserRole } from '@/types/user';
import { hasPermission } from './roles';

export class PermissionError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'PermissionError';
  }
}

export function requirePermission(userRole: UserRole, requiredRole: UserRole): void {
  if (!hasPermission(userRole, requiredRole)) {
    throw new PermissionError(`Required role: ${requiredRole}, current role: ${userRole}`);
  }
}

export function requireOwner(userRole: UserRole): void {
  requirePermission(userRole, 'owner');
}

export function requireCoach(userRole: UserRole): void {
  requirePermission(userRole, 'coach');
}

export function canEditPlan(userRole: UserRole, planCoachId: string, userId: string): boolean {
  if (userRole === 'owner') return true;
  if (userRole === 'coach' && planCoachId === userId) return true;
  return false;
}

export function canEditGroup(userRole: UserRole, groupCoachId: string, userId: string): boolean {
  if (userRole === 'owner') return true;
  if (userRole === 'coach' && groupCoachId === userId) return true;
  return false;
}

export function requireCanEditPlan(userRole: UserRole, planCoachId: string, userId: string): void {
  if (!canEditPlan(userRole, planCoachId, userId)) {
    throw new PermissionError('You can only edit your own plans');
  }
}

export function requireCanEditGroup(userRole: UserRole, groupCoachId: string, userId: string): void {
  if (!canEditGroup(userRole, groupCoachId, userId)) {
    throw new PermissionError('You can only edit your own groups');
  }
}