import { admin } from '@/lib/firebase-admin';

/**
 * Delete a user from Firebase Auth and Firestore
 * @param uid User ID
 */
export async function deleteUserCompletely(uid: string): Promise<void> {
  // Delete from Auth
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    // If user doesn't exist in Auth, ignore
    const error: any = err;
    if (error.code !== 'auth/user-not-found') throw error;
  }
  // Delete from Firestore
  await admin.firestore().collection('users').doc(uid).delete();
}
