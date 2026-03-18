import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin solo si no está ya inicializado
let adminApp;
if (getApps().length === 0) {
  try {
    // En producción, usar service account key
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // En desarrollo o emuladores
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'owl-coach',
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Fallback a inicialización básica
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'owl-coach',
    });
  }
} else {
  adminApp = getApps()[0];
}

export const admin = {
  firestore: () => getFirestore(adminApp),
};

export default adminApp;