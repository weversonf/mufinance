import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const runtimeEnv: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {};

const firebaseConfig = {
  apiKey: runtimeEnv.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCWlVvnA29CnKco7mBG6LvpzDtcYmr28cY",
  authDomain: runtimeEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "projetomu-d5722.firebaseapp.com",
  projectId: runtimeEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "projetomu-d5722",
  storageBucket: runtimeEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "projetomu-d5722.firebasestorage.app",
  messagingSenderId: runtimeEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "94478862714",
  appId: runtimeEnv.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:94478862714:web:578561a199f685f9e5eec3",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// Os dados legados possuem campos opcionais; ignorar undefined evita que uma
// única propriedade ausente impeça a persistência do estado inteiro.
export const firebaseDb = (() => {
  try {
    return initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(firebaseApp);
  }
})();
