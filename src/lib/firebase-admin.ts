import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function createAdminApp(): App {
  // 1. If service account env vars are provided, use them explicitly
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    return initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'owl-coach',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  // 2. Fall back to Application Default Credentials (gcloud auth application-default login)
  //    This works locally when you run: gcloud auth application-default login
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'owl-coach',
  });
}

let adminApp: App;
if (getApps().length > 0) {
  adminApp = getApps()[0];
} else {
  try {
    adminApp = createAdminApp();
  } catch (error) {
    console.error('[firebase-admin] Initialization error:', error);
    adminApp = initializeApp({ projectId: 'owl-coach' });
  }
}

export const admin = {
  firestore: () => getFirestore(adminApp),
};

export default adminApp;