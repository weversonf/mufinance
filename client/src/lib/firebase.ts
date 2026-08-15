import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyCWlVvnA29CnKco7mBG6LvpzDtcYmr28cY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "projetomu-d5722.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "projetomu-d5722",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "projetomu-d5722.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "94478862714",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:94478862714:web:578561a199f685f9e5eec3",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
