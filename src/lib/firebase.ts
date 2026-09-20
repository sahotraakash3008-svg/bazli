import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the explicit firestore database ID provisioned in config or default
export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

// Automatically initialize anonymous authentication session for seamless Firestore operations
export const ensureAuthenticated = async (): Promise<void> => {
    if (auth.currentUser) return;
    try {
        return;
    } catch (err) {
        console.warn('Anonymous auth note (proceeding):', err);
    }
};
// Eagerly trigger authentication
ensureAuthenticated().catch(() => {});

export default app;

