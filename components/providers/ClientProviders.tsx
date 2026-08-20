"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthScreen from "@/components/AuthScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { ReactNode } from "react";
import { FinanceMigrationBootstrap } from "./FinanceMigrationBootstrap";

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading" aria-live="polite">Carregando seu espaço…</div>;
  }

  return user ? <>{children}</> : <AuthScreen />;
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AuthGate>
              <FinanceMigrationBootstrap />
              {children}
            </AuthGate>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
