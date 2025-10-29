import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  OAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Persist session across refreshes
setPersistence(auth, browserLocalPersistence).catch(() => { /* ignore */ });

export const msProvider = new OAuthProvider('microsoft.com');

export async function signInMicrosoft() {
  try {
    const result = await signInWithPopup(auth, msProvider);
    return result.user;
  } catch (error) {
    // Ignore harmless popup concurrency/close errors
    if (
      error?.code !== 'auth/cancelled-popup-request' &&
      error?.code !== 'auth/popup-closed-by-user'
    ) {
      console.error('Firebase login error:', error);
    }
    return null;
  }
}

export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function signOutUser() {
  await signOut(auth);
}