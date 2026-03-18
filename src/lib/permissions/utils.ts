import { UserRole } from '@/types/user';

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

export function getPlanPermissions(
  userRole: UserRole, 
  userId: string, 
  planCoachId?: string
): PermissionCheck {
  const isOwner = userRole === 'owner';
  const isCoach = userRole === 'coach';
  const isOwnContent = planCoachId === userId;

  return {
    canView: true, // Everyone can view plans
    canEdit: isOwner || (isCoach && isOwnContent),
    canDelete: isOwner || (isCoach && isOwnContent),
    canCreate: isOwner || isCoach,
  };
}

export function getGroupPermissions(
  userRole: UserRole, 
  userId: string, 
  groupCoachId?: string
): PermissionCheck {
  const isOwner = userRole === 'owner';
  const isCoach = userRole === 'coach';
  const isOwnContent = groupCoachId === userId;

  return {
    canView: true, // Everyone can view groups
    canEdit: isOwner || (isCoach && isOwnContent),
    canDelete: isOwner || (isCoach && isOwnContent),
    canCreate: isOwner || isCoach,
  };
}

export function getUserPermissions(userRole: UserRole): PermissionCheck {
  const isOwner = userRole === 'owner';

  return {
    canView: isOwner,
    canEdit: isOwner,
    canDelete: isOwner,
    canCreate: isOwner,
  };
}

export function getNavigationPermissions(userRole: UserRole) {
  const isOwner = userRole === 'owner';
  const isCoach = userRole === 'coach';

  return {
    showAdminPanel: isOwner,
    showCoachPanel: isOwner || isCoach,
    showUserDashboard: true,
    showPlansManagement: isOwner || isCoach,
    showGroupsManagement: isOwner || isCoach,
    showUsersManagement: isOwner,
  };
}