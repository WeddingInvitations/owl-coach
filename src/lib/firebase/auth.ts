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
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirebaseApp, isFirebaseClientConfigured, getFirebaseClientConfig } from './config';

let authInstance: ReturnType<typeof getAuth> | null = null;
let authInitPromise: Promise<ReturnType<typeof getAuth>> | null = null;

async function getClientAuth() {
  if (!isFirebaseClientConfigured()) {
    throw new Error('Firebase client environment variables are not configured');
  }

  if (authInstance) {
    return authInstance;
  }

  if (!authInitPromise) {
    const auth = getAuth(getFirebaseApp());
    authInitPromise = setPersistence(auth, browserLocalPersistence)
      .then(() => {
        authInstance = auth;
        return auth;
      })
      .catch((error) => {
        authInitPromise = null;
        throw error;
      });
  }

  return authInitPromise;
}

export async function loginUser(email: string, password: string) {
  try {
    const auth = await getClientAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null, errorCode: null };
  } catch (error: any) {
    return { user: null, error: error.message, errorCode: error.code as string };
  }
}

export async function registerUser(email: string, password: string, displayName: string) {
  try {
    const auth = await getClientAuth();
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

export async function loginWithGoogle() {
  try {
    const auth = await getClientAuth();
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const additionalInfo = getAdditionalUserInfo(userCredential);
    const isNewUser = additionalInfo?.isNewUser ?? false;
    return { user: userCredential.user, isNewUser, error: null };
  } catch (error: any) {
    return { user: null, isNewUser: false, error: error.message };
  }
}

export async function deleteCurrentAuthUser(): Promise<void> {
  const auth = getAuth(getFirebaseApp());
  const user = auth.currentUser;
  if (user) {
    await deleteUser(user);
  }
}

export async function logoutUser() {
  try {
    const auth = await getClientAuth();
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getCurrentUser(): User | null {
  if (!isFirebaseClientConfigured()) {
    return null;
  }

  const auth = getAuth(getFirebaseApp());
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
    const auth = await getClientAuth();
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
  const firebaseConfig = getFirebaseClientConfig();

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