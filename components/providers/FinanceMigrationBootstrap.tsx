"use client";

import { useEffect, useRef } from "react";
import { migrateLegacyFinanceState } from "../../actions/finance";
import { useAuth } from "@/contexts/AuthContext";

export function FinanceMigrationBootstrap() {
  const { user } = useAuth();
  const migratedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!user || migratedUid.current === user.uid) return;
    migratedUid.current = user.uid;
    void migrateLegacyFinanceState().catch((error) => {
      console.error("Falha na migração financeira normalizada", error);
      migratedUid.current = null;
    });
  }, [user]);

  return null;
}
