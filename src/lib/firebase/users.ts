import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { User, UserRole } from '@/types/user';

const OWNER_EMAILS = (process.env.NEXT_PUBLIC_OWNER_EMAILS || 'f14agui@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function resolveRole(email: string): UserRole {
  return OWNER_EMAILS.includes(email.toLowerCase()) ? 'owner' : 'user';
}

function splitDisplayName(displayName: string) {
  const parts = (displayName || '').trim().split(' ').filter(Boolean);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

export async function ensureUserProfile(params: {
  uid: string;
  email: string;
  displayName: string;
}): Promise<User> {
  const { uid, email, displayName } = params;
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const now = new Date().toISOString();
  const { firstName, lastName } = splitDisplayName(displayName);
  const expectedRole = resolveRole(email);

  if (!userSnap.exists()) {
    const userData: Omit<User, 'id'> = {
      email,
      firstName,
      lastName,
      displayName,
      role: expectedRole,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, userData);
    return { id: uid, ...userData };
  }

  const current = userSnap.data() as Omit<User, 'id'>;
  const updates: Partial<Omit<User, 'id'>> = {};

  if (!current.displayName && displayName) {
    updates.displayName = displayName;
  }
  if (!current.firstName && firstName) {
    updates.firstName = firstName;
  }
  if ((!current.lastName && lastName) || (current.displayName !== displayName && lastName)) {
    updates.lastName = lastName;
  }
  if (expectedRole === 'owner' && current.role !== 'owner') {
    updates.role = 'owner';
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = now;
    await updateDoc(userRef, updates);
  }

  return {
    id: uid,
    ...current,
    ...updates,
  } as User;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return null;
  }

  return {
    id: userSnap.id,
    ...(userSnap.data() as Omit<User, 'id'>),
  };
}

export async function listUsers(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map((userDoc) => ({
    id: userDoc.id,
    ...(userDoc.data() as Omit<User, 'id'>),
  }));
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    role,
    updatedAt: new Date().toISOString(),
  });
}

export async function createCoachProfile(params: {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<User> {
  const { uid, email, firstName, lastName } = params;
  const now = new Date().toISOString();
  const userRef = doc(db, 'users', uid);

  const userData: Omit<User, 'id'> = {
    email,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim(),
    role: 'coach',
    mustChangePassword: true,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userRef, userData);
  return { id: uid, ...userData };
}

export async function clearMustChangePassword(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  });
}
