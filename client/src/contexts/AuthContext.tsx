"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();

async function syncSessionCookie(nextUser: User | null) {
  if (!nextUser) {
    await fetch("/api/session", { method: "DELETE" }).catch(() => undefined);
    return;
  }
  const idToken = await nextUser.getIdToken();
  const response = await fetch("/api/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }) });
  if (!response.ok) throw new Error("Não foi possível sincronizar a sessão do servidor.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      try {
        await syncSessionCookie(nextUser);
      } catch (error) {
        console.error("Falha ao sincronizar sessão do MuFinance", error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await syncSessionCookie(credential.user);
    },
    signUp: async (email, password) => {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await syncSessionCookie(credential.user);
    },
    signInWithGoogle: async () => {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      await syncSessionCookie(credential.user);
    },
    resetPassword: (email) => sendPasswordResetEmail(firebaseAuth, email),
    logout: async () => {
      await signOut(firebaseAuth);
      await syncSessionCookie(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  return context;
}
