export function canEditExercises(user) {
  return user?.role === 'owner' || user?.role === 'coach';
}

export function canViewExercises(user) {
  return !!user;
}
