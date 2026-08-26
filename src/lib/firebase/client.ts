import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

// Firebase Web App configuration is public by design. Environment variables remain
// the preferred override for preview/production projects, while these defaults keep
// the published MuFinance client functional when deployment variables are missing.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCWlVvnA29CnKco7mBG6LvpzDtcYmr28cY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "projetomu-d5722.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "projetomu-d5722",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "projetomu-d5722.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "94478862714",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:94478862714:web:578561a199f685f9e5eec3",
};

export const firebaseConfigReady = Object.values(firebaseConfig).every(Boolean);
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

export function getFirebaseAuth() {
  if (typeof window === "undefined" || !firebaseConfigReady) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (!auth) auth = getAuth(app);
  return auth;
}

export function getGoogleProvider() {
  if (!provider) provider = new GoogleAuthProvider();
  return provider;
}
