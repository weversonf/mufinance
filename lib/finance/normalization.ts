import type { Account, CreditCard, FinanceCategory, Transaction, VehicleProfile } from "@/lib/financeData";
import { defaultFinanceCategories } from "@/lib/financeData";
import type { Firestore } from "firebase-admin/firestore";
import type { DocumentData } from "firebase-admin/firestore";
import { normalizedCollections } from "./schemas";

export type LegacyFinanceState = {
  localAccounts?: Account[];
  localCreditCards?: CreditCard[];
  localTransactions?: Transaction[];
  localCategories?: FinanceCategory[];
  localVehicle?: VehicleProfile;
  profile?: Record<string, unknown>;
  paidBills?: string[];
  onboardingComplete?: boolean;
};

export type NormalizedRecord = DocumentData & {
  ownerId: string;
  migratedFrom?: string;
  createdAt: string;
  updatedAt: string;
};

function safeId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || "item";
}

function now() {
  return new Date().toISOString();
}

function categoryKey(category: Pick<FinanceCategory, "type" | "name">) {
  return `${category.type}:${category.name.trim().toLocaleLowerCase("pt-BR")}`;
}

export function mergeCategories(categories: FinanceCategory[] = []) {
  const merged = [...categories];
  const existing = new Set(merged.map(categoryKey));
  for (const category of defaultFinanceCategories) {
    if (!existing.has(categoryKey(category))) {
      merged.push(category);
      existing.add(categoryKey(category));
    }
  }
  return merged;
}

export function normalizedAccountId(ownerId: string, account: Account) {
  return `${ownerId}_account_${safeId(account.name)}`;
}

export function normalizedCardId(ownerId: string, card: CreditCard) {
  return `${ownerId}_card_${safeId(card.id || card.name)}`;
}

export function normalizedTransactionId(ownerId: string, transaction: Transaction) {
  return `${ownerId}_transaction_${safeId(transaction.id || `${transaction.dateISO ?? transaction.date}-${transaction.payee}-${transaction.amount}`)}`;
}

export function normalizedCategoryId(ownerId: string, category: FinanceCategory) {
  return `${ownerId}_category_${safeId(`${category.type}-${category.name}`)}`;
}

export function createNormalizedState(ownerId: string, state: LegacyFinanceState) {
  const timestamp = now();
  const categories = mergeCategories(state.localCategories);
  const records: Record<string, Array<{ id: string; data: NormalizedRecord }>> = {
    [normalizedCollections.accounts]: (state.localAccounts ?? []).map((account) => ({
      id: normalizedAccountId(ownerId, account),
      data: { ...account, ownerId, source: "legacy-state", migratedFrom: "users/{uid}/finance/state.localAccounts", createdAt: timestamp, updatedAt: timestamp },
    })),
    [normalizedCollections.creditCards]: (state.localCreditCards ?? []).map((card) => ({
      id: normalizedCardId(ownerId, card),
      data: { ...card, ownerId, source: "legacy-state", migratedFrom: "users/{uid}/finance/state.localCreditCards", createdAt: timestamp, updatedAt: timestamp },
    })),
    [normalizedCollections.transactions]: (state.localTransactions ?? []).map((transaction) => ({
      id: normalizedTransactionId(ownerId, transaction),
      data: { ...transaction, ownerId, source: "legacy-state", migratedFrom: "users/{uid}/finance/state.localTransactions", createdAt: timestamp, updatedAt: timestamp },
    })),
    [normalizedCollections.categories]: categories.map((category) => ({
      id: normalizedCategoryId(ownerId, category),
      data: { ...category, ownerId, source: "legacy-state", migratedFrom: "users/{uid}/finance/state.localCategories", createdAt: timestamp, updatedAt: timestamp },
    })),
    [normalizedCollections.goals]: [],
    [normalizedCollections.budgets]: [],
  };
  return records;
}

export async function migrateLegacyState(db: Firestore, ownerId: string, state: LegacyFinanceState) {
  const records = createNormalizedState(ownerId, state);
  const batch = db.batch();
  let writes = 0;

  for (const collectionName of Object.values(normalizedCollections)) {
    for (const record of records[collectionName]) {
      const reference = db.collection(collectionName).doc(record.id);
      const existing = await reference.get();
      if (!existing.exists) {
        batch.set(reference, record.data, { merge: true });
        writes += 1;
      }
    }
  }

  if (writes > 0) await batch.commit();
  return { records, writes };
}
