import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  updateProfile,
  getAuth,
  deleteUser,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
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

/**
 * Change the current user's password. Requires re-authentication.
 */
export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
) {
  try {
    const auth = getClientAuth();
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Usuario no autenticado');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new Firebase Auth user without signing out the current admin.
 * Uses a temporary secondary Firebase app instance.
 */
export async function createAuthUserAsAdmin(
  email: string,
  password: string,
  displayName: string,
) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await updateProfile(credential.user, { displayName });
    const uid = credential.user.uid;
    // Sign out from secondary app immediately
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
    return { uid, error: null };
  } catch (error: any) {
    await deleteApp(secondaryApp).catch(() => {});
    return { uid: null, error: error.message };
  }
}