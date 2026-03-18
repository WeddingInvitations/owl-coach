import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyAQ0zuspsoBEQ54rCDGTKbAeHM96DVl3ZU',
  authDomain: 'owl-coach.firebaseapp.com',
  projectId: 'owl-coach',
  storageBucket: 'owl-coach.firebasestorage.app',
  messagingSenderId: '831473832501',
  appId: '1:831473832501:web:2e88bf60073fe84947177c',
};

function getPublicEnvValue(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

const firebaseConfig = {
  apiKey: getPublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, defaultFirebaseConfig.apiKey),
  authDomain: getPublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, defaultFirebaseConfig.authDomain),
  projectId: getPublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, defaultFirebaseConfig.projectId),
  storageBucket: getPublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, defaultFirebaseConfig.storageBucket),
  messagingSenderId: getPublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, defaultFirebaseConfig.messagingSenderId),
  appId: getPublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, defaultFirebaseConfig.appId),
};

const hasPublicFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

let appInstance: FirebaseApp | null = null;

export function isFirebaseClientConfigured() {
  return hasPublicFirebaseConfig;
}

export function getFirebaseClientConfig() {
  return firebaseConfig;
}

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) {
    return appInstance;
  }

  if (getApps().length > 0) {
    appInstance = getApp();
    return appInstance;
  }

  appInstance = hasPublicFirebaseConfig
    ? initializeApp(firebaseConfig)
    : initializeApp({ projectId: 'owl-coach' });

  return appInstance;
}

export const db = getFirestore(getFirebaseApp());

export default getFirebaseApp;