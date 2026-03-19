export function canEditModules(user) {
  return user?.role === 'owner' || user?.role === 'coach';
}

export function canViewModules(user) {
  return !!user;
}
