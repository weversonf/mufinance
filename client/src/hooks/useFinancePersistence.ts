import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb } from "@/lib/firebase";
import type { P2PActivity, P2PContact, P2PRequest } from "@/components/finance/P2PDialog";
import { formatBRL, type Account, type CreditCard, type FinanceCategory, type Transaction, type VehicleProfile } from "@/lib/financeData";

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

type LegacyDoc = { id: string; data: Record<string, unknown> };

type LegacyFinanceData = {
  profile: PersistedProfile | null;
  accounts: Account[];
  transactions: Transaction[];
  cards: CreditCard[];
  fingerprint: string;
};

const statePath = (uid: string) => doc(firebaseDb, "users", uid, "finance", "state");
const toneCycle: Account["tone"][] = ["mint", "lavender", "peach", "blue"];
const cardColors: CreditCard["color"][] = ["ocean", "forest", "plum", "sunset", "graphite"];
const acceptedBrands: CreditCard["brand"][] = ["Visa", "Mastercard", "Elo", "Amex"];

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateValue(value: unknown) {
  if (typeof value === "string") return value.slice(0, 10);
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate() as Date;
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] ?? "";
}

function fallbackProfile(user: User, legacy: PersistedProfile | null): PersistedProfile {
  const email = legacy?.email || user.email || "";
  const generatedName = firstName(email.split("@")[0].replace(/[._-]+/g, " ")) || "Usuário";
  return {
    name: legacy?.name || user.displayName || generatedName,
    email,
    username: legacy?.username || email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 20),
    usernameChangedAt: legacy?.usernameChangedAt ?? null,
  };
}

function mapLegacyAccounts(docs: LegacyDoc[]) {
  return docs.map((item, index) => {
    const balance = numberValue(item.data.balance);
    const last4 = text(item.data.number).replace(/\D/g, "").slice(-4);
    return {
      name: text(item.data.name, "Conta"),
      number: last4 ? `•••• ${last4}` : "••••",
      value: formatBRL(balance),
      balance,
      change: "",
      tone: toneCycle[index % toneCycle.length],
      icon: text(item.data.type) === "carteira" ? "wallet" : "bank",
    } satisfies Account;
  });
}

function mapLegacyCards(docs: LegacyDoc[]) {
  return docs.map((item, index) => {
    const rawNumber = text(item.data.number);
    const last4 = rawNumber.replace(/\D/g, "").slice(-4) || "0000";
    const rawBrand = text(item.data.brand) || text(item.data.type, "Visa");
    const brand = acceptedBrands.find((candidate) => candidate.toLowerCase() === rawBrand.toLowerCase()) ?? "Visa";
    return {
      id: item.id,
      name: text(item.data.name) || text(item.data.holder, "Cartão"),
      last4,
      brand,
      color: cardColors[index % cardColors.length],
      balance: formatBRL(Math.abs(numberValue(item.data.balance))),
      dueDate: text(item.data.expiry) ? `vence em ${text(item.data.expiry)}` : "",
      limit: numberValue(item.data.limit),
      closingDay: numberValue(item.data.closingDay, 20),
      dueDay: numberValue(item.data.dueDay, 28),
    } satisfies CreditCard;
  });
}

function mapLegacyTransactions(docs: LegacyDoc[], accounts: LegacyDoc[]) {
  const accountNames = new Map(accounts.map((item) => [item.id, text(item.data.name, "Conta principal")]));
  return docs.map((item) => {
    const rawType = text(item.data.type).toLowerCase();
    const rawStatus = text(item.data.status).toLowerCase();
    const dateISO = dateValue(item.data.date);
    const amount = Math.abs(numberValue(item.data.amount));
    return {
      id: item.id,
      date: dateISO,
      dateISO,
      payee: text(item.data.name) || text(item.data.payee, "Lançamento"),
      category: text(item.data.category) || text(item.data.cat, "Outros"),
      account: accountNames.get(text(item.data.accountId)) || text(item.data.account, "Conta principal"),
      destinationAccount: text(item.data.destinationAccount) || undefined,
      sourceType: text(item.data.sourceType) === "credit-card" ? "credit-card" : "account",
      sourceId: text(item.data.sourceId) || text(item.data.accountId) || undefined,
      invoiceId: text(item.data.invoiceId) || undefined,
      amount,
      type: rawType === "entrada" || rawType === "income" ? "income" : rawType === "transfer" ? "transfer" : "expense",
      status: rawStatus === "prevista" || rawStatus === "planned" ? "planned" : "completed",
      settled: rawStatus !== "prevista" && rawStatus !== "planned",
      p2pCounterpartName: text(item.data.p2pCounterpartName) || undefined,
      p2pSenderUid: text(item.data.p2pSenderUid) || undefined,
      p2pTargetUid: text(item.data.p2pTargetUid) || undefined,
    } satisfies Transaction;
  });
}

async function readOwnedCollection(name: string, uid: string) {
  const snapshot = await getDocs(query(collection(firebaseDb, name), where("uid", "==", uid)));
  return snapshot.docs.map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }));
}

async function readLegacyFinanceData(user: User): Promise<LegacyFinanceData> {
  const [profileSnapshot, accountDocs, transactionDocs, cardDocs] = await Promise.all([
    getDoc(doc(firebaseDb, "profile", user.uid)),
    readOwnedCollection("accounts", user.uid),
    readOwnedCollection("transactions", user.uid),
    readOwnedCollection("cards", user.uid),
  ]);
  const profileData = profileSnapshot.exists() ? profileSnapshot.data() : null;
  const legacyProfile = profileData ? {
    name: text(profileData.name),
    email: text(profileData.email),
    username: text(profileData.username),
    usernameChangedAt: text(profileData.usernameChangedAt) || null,
  } : null;
  const legacy = {
    profile: legacyProfile,
    accounts: mapLegacyAccounts(accountDocs),
    transactions: mapLegacyTransactions(transactionDocs, accountDocs),
    cards: mapLegacyCards(cardDocs),
  };
  return {
    ...legacy,
    fingerprint: JSON.stringify(legacy) ?? "",
  };
}

function hasLegacyFinanceData(data: LegacyFinanceData) {
  return Boolean(data.profile?.name || data.profile?.email || data.accounts.length || data.transactions.length || data.cards.length);
}

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
        const currentData = snapshot.exists() ? snapshot.data() : {};
        // Sempre consultamos as coleções legadas. O marcador legacyMigrated antigo
        // não é suficiente para indicar que a migração foi concluída corretamente.
        const legacy = await readLegacyFinanceData(user);
        const legacyChanged = currentData.legacySyncVersion !== legacy.fingerprint;
        const hasLegacyData = hasLegacyFinanceData(legacy);
        const shouldApplyLegacy = hasLegacyData && legacyChanged;
        const useLegacyTransactions = legacy.transactions.length > 0 && (shouldApplyLegacy || !Array.isArray(currentData.localTransactions));
        const useLegacyAccounts = legacy.accounts.length > 0 && (shouldApplyLegacy || !Array.isArray(currentData.localAccounts));
        const useLegacyCards = legacy.cards.length > 0 && (shouldApplyLegacy || !Array.isArray(currentData.localCreditCards));
        if (cancelled) return;

        if (Array.isArray(currentData.localTransactions) && !useLegacyTransactions) input.setLocalTransactions(currentData.localTransactions as Transaction[]);
        if (Array.isArray(currentData.localAccounts) && !useLegacyAccounts) input.setLocalAccounts(currentData.localAccounts as Account[]);
        if (Array.isArray(currentData.localCreditCards) && !useLegacyCards) input.setLocalCreditCards(currentData.localCreditCards as CreditCard[]);
        if (useLegacyTransactions) input.setLocalTransactions(legacy.transactions);
        if (useLegacyAccounts) input.setLocalAccounts(legacy.accounts);
        if (useLegacyCards) input.setLocalCreditCards(legacy.cards);
        if (currentData.localVehicle && typeof currentData.localVehicle === "object") input.setLocalVehicle(currentData.localVehicle as VehicleProfile);
        if (Array.isArray(currentData.localCategories)) input.setLocalCategories(currentData.localCategories as FinanceCategory[]);
        if (Array.isArray(currentData.paidBills)) input.setPaidBills(currentData.paidBills as string[]);
        if (shouldApplyLegacy && legacy.profile) input.setProfile(fallbackProfile(user, legacy.profile));
        else if (currentData.profile && typeof currentData.profile === "object") input.setProfile(currentData.profile as PersistedProfile);
        else input.setProfile(fallbackProfile(user, null));
        if (Array.isArray(currentData.p2pRequests)) input.setP2PRequests(currentData.p2pRequests as P2PRequest[]);
        if (Array.isArray(currentData.p2pActivities)) input.setP2PActivities(currentData.p2pActivities as P2PActivity[]);
        if (typeof currentData.accountBalanceAdjustment === "number") input.setAccountBalanceAdjustment(currentData.accountBalanceAdjustment);
        if (typeof currentData.compactMode === "boolean") input.setCompactMode(currentData.compactMode);
        if (typeof currentData.alertsEnabled === "boolean") input.setAlertsEnabled(currentData.alertsEnabled);

        if (legacyChanged) {
          await setDoc(statePath(user.uid), {
            legacyMigrated: true,
            legacySyncVersion: legacy.fingerprint,
            migratedAt: new Date().toISOString(),
          }, { merge: true });
        }
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
