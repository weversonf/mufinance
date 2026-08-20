"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseConfigReady, getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signInGoogle: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncSession(user: User | null) {
  if (user) {
    const idToken = await user.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } else {
    await fetch("/api/session", { method: "DELETE" });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      void syncSession(nextUser).catch((error) => console.error("Falha ao sincronizar sessão", error));
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error(firebaseConfigReady ? "A autenticação só pode ser executada no navegador." : "Firebase não está configurado neste ambiente.");
    const result = await signInWithEmailAndPassword(auth, email, password);
    await syncSession(result.user);
    return result.user;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error(firebaseConfigReady ? "A autenticação só pode ser executada no navegador." : "Firebase não está configurado neste ambiente.");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) await updateProfile(result.user, { displayName: name.trim() });
    await result.user.getIdToken(true);
    await syncSession(result.user);
    return result.user;
  }, []);

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error(firebaseConfigReady ? "A autenticação só pode ser executada no navegador." : "Firebase não está configurado neste ambiente.");
    const result = await signInWithPopup(auth, getGoogleProvider());
    await syncSession(result.user);
    return result.user;
  }, []);

  const resetPassword = useCallback((email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return Promise.reject(new Error(firebaseConfigReady ? "A autenticação só pode ser executada no navegador." : "Firebase não está configurado neste ambiente."));
    return sendPasswordResetEmail(auth, email);
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    await syncSession(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signInGoogle, resetPassword, logout }), [user, loading, signIn, signUp, signInGoogle, resetPassword, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
