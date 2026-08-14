import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb } from "@/lib/firebase";
import type { P2PActivity, P2PContact, P2PRequest } from "@/components/finance/P2PDialog";
import type { Account, CreditCard, FinanceCategory, Transaction, VehicleProfile } from "@/lib/financeData";

type PersistedProfile = { name: string; email: string; username: string; usernameChangedAt: string | null };

type PersistenceInput = {
  user: User | null;
  localTransactions: Transaction[];
  setLocalTransactions: Dispatch<SetStateAction<Transaction[]>>;
  localAccounts: Account[];
  setLocalAccounts: Dispatch<SetStateAction<Account[]>>;
  localCreditCards: CreditCard[];
  setLocalCreditCards: Dispatch<SetStateAction<CreditCard[]>>;
  localVehicle: VehicleProfile;
  setLocalVehicle: Dispatch<SetStateAction<VehicleProfile>>;
  localCategories: FinanceCategory[];
  setLocalCategories: Dispatch<SetStateAction<FinanceCategory[]>>;
  paidBills: string[];
  setPaidBills: Dispatch<SetStateAction<string[]>>;
  profile: PersistedProfile;
  setProfile: Dispatch<SetStateAction<PersistedProfile>>;
  p2pRequests: P2PRequest[];
  setP2PRequests: Dispatch<SetStateAction<P2PRequest[]>>;
  p2pActivities: P2PActivity[];
  setP2PActivities: Dispatch<SetStateAction<P2PActivity[]>>;
  accountBalanceAdjustment: number;
  setAccountBalanceAdjustment: Dispatch<SetStateAction<number>>;
  compactMode: boolean;
  setCompactMode: Dispatch<SetStateAction<boolean>>;
  alertsEnabled: boolean;
  setAlertsEnabled: Dispatch<SetStateAction<boolean>>;
};

const statePath = (uid: string) => doc(firebaseDb, "users", uid, "finance", "state");

export function useFinancePersistence(input: PersistenceInput) {
  const { user } = input;
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    setStorageError(null);
    if (!user) return () => { cancelled = true; };

    const load = async () => {
      try {
        const snapshot = await getDoc(statePath(user.uid));
        if (!snapshot.exists()) {
          if (!cancelled) setHydrated(true);
          return;
        }
        const data = snapshot.data();
        if (cancelled) return;
        if (Array.isArray(data.localTransactions)) input.setLocalTransactions(data.localTransactions as Transaction[]);
        if (Array.isArray(data.localAccounts)) input.setLocalAccounts(data.localAccounts as Account[]);
        if (Array.isArray(data.localCreditCards)) input.setLocalCreditCards(data.localCreditCards as CreditCard[]);
        if (data.localVehicle && typeof data.localVehicle === "object") input.setLocalVehicle(data.localVehicle as VehicleProfile);
        if (Array.isArray(data.localCategories)) input.setLocalCategories(data.localCategories as FinanceCategory[]);
        if (Array.isArray(data.paidBills)) input.setPaidBills(data.paidBills as string[]);
        if (data.profile && typeof data.profile === "object") input.setProfile(data.profile as PersistedProfile);
        if (Array.isArray(data.p2pRequests)) input.setP2PRequests(data.p2pRequests as P2PRequest[]);
        if (Array.isArray(data.p2pActivities)) input.setP2PActivities(data.p2pActivities as P2PActivity[]);
        if (typeof data.accountBalanceAdjustment === "number") input.setAccountBalanceAdjustment(data.accountBalanceAdjustment);
        if (typeof data.compactMode === "boolean") input.setCompactMode(data.compactMode);
        if (typeof data.alertsEnabled === "boolean") input.setAlertsEnabled(data.alertsEnabled);
        setHydrated(true);
      } catch (error) {
        console.error("Falha ao carregar dados do Firestore", error);
        if (!cancelled) {
          setStorageError("Não foi possível carregar seus dados. Confira as regras do Firestore.");
          setHydrated(true);
        }
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !hydrated) return;
    const timer = window.setTimeout(async () => {
      try {
        await setDoc(statePath(user.uid), {
          localTransactions: input.localTransactions,
          localAccounts: input.localAccounts,
          localCreditCards: input.localCreditCards,
          localVehicle: input.localVehicle,
          localCategories: input.localCategories,
          paidBills: input.paidBills,
          profile: input.profile,
          p2pRequests: input.p2pRequests,
          p2pActivities: input.p2pActivities,
          accountBalanceAdjustment: input.accountBalanceAdjustment,
          compactMode: input.compactMode,
          alertsEnabled: input.alertsEnabled,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        setStorageError(null);
      } catch (error) {
        console.error("Falha ao salvar dados no Firestore", error);
        setStorageError("Não foi possível salvar a última alteração no Firestore.");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [hydrated, user?.uid, input.localTransactions, input.localAccounts, input.localCreditCards, input.localVehicle, input.localCategories, input.paidBills, input.profile, input.p2pRequests, input.p2pActivities, input.accountBalanceAdjustment, input.compactMode, input.alertsEnabled]);

  return { hydrated, storageError };
}
