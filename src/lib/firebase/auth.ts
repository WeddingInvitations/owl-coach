import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  getAuth
} from 'firebase/auth';
import { getFirebaseApp, isFirebaseClientConfigured } from './config';

function getClientAuth() {
  if (!isFirebaseClientConfigured()) {
    throw new Error('Firebase client environment variables are not configured');
  }

  return getAuth(getFirebaseApp());
}

export async function loginUser(email: string, password: string) {
  try {
    const auth = getClientAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function registerUser(email: string, password: string, displayName: string) {
  try {
    const auth = getClientAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function logoutUser() {
  try {
    const auth = getClientAuth();
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getCurrentUser(): User | null {
  const auth = getClientAuth();
  return auth.currentUser;
}