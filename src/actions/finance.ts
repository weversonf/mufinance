"use server";

import { revalidatePath } from "next/cache";
import { getAdminFirestore } from "../lib/firebase/admin";
import { getSessionUser, requireSessionUser } from "../lib/auth/session";
import { migrateLegacyState, type LegacyFinanceState } from "../lib/finance/normalization";
import {
  accountInputSchema,
  budgetInputSchema,
  categoryInputSchema,
  goalInputSchema,
  transactionInputSchema,
} from "../lib/finance/schemas";

function timestamp() {
  return new Date().toISOString();
}

async function getOwnedDocuments(collectionNames: string[], ownerId: string) {
  const db = getAdminFirestore();
  const snapshots = await Promise.all(collectionNames.flatMap((collectionName) => [
    db.collection(collectionName).where("ownerId", "==", ownerId).get(),
    db.collection(collectionName).where("uid", "==", ownerId).get(),
  ]));
  const documents = new Map<string, Record<string, unknown> & { id: string }>();
  for (const snapshot of snapshots) {
    for (const item of snapshot.docs) {
      documents.set(`${item.ref.parent.id}/${item.id}`, { id: item.id, ...item.data() });
    }
  }
  return [...documents.values()];
}

function normalizeLegacyRecord(collectionName: string, record: Record<string, unknown> & { id: string }) {
  const normalized = { ...record, ownerId: record.ownerId ?? record.uid };
  if (collectionName === "transactions") {
    const legacyType = String(record.type ?? "").toLowerCase();
    return {
      ...normalized,
      payee: record.payee ?? record.name ?? record.description,
      category: record.category ?? record.cat ?? record.categoryName,
      type: legacyType === "entrada" || legacyType === "income" ? "income" : legacyType === "saida" || legacyType === "expense" ? "expense" : record.type,
      status: legacyType === "prevista" || record.status === "prevista" ? "pending" : record.status,
    };
  }
  if (collectionName === "categories") {
    return { ...normalized, name: record.name ?? record.label ?? record.cat };
  }
  return normalized;
}

export async function getFinanceSnapshot() {
  const user = await getSessionUser();
  if (!user) return null;

  const [accounts, creditCards, transactions, categories, goals, budgets] = await Promise.all([
    getOwnedDocuments(["accounts"], user.uid),
    getOwnedDocuments(["creditCards", "cards"], user.uid),
    getOwnedDocuments(["transactions"], user.uid),
    getOwnedDocuments(["categories"], user.uid),
    getOwnedDocuments(["goals"], user.uid),
    getOwnedDocuments(["budgets", "budget"], user.uid),
  ]);

  return {
    uid: user.uid,
    accounts: accounts.map((item) => normalizeLegacyRecord("accounts", item)),
    creditCards: creditCards.map((item) => normalizeLegacyRecord("creditCards", item)),
    transactions: transactions.map((item) => normalizeLegacyRecord("transactions", item)),
    categories: categories.map((item) => normalizeLegacyRecord("categories", item)),
    goals: goals.map((item) => normalizeLegacyRecord("goals", item)),
    budgets: budgets.map((item) => normalizeLegacyRecord("budgets", item)),
  };
}

export async function migrateLegacyFinanceState() {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const legacyReference = db.doc(`users/${user.uid}/finance/state`);
  const legacySnapshot = await legacyReference.get();
  if (!legacySnapshot.exists) return { migrated: false, writes: 0 };

  const result = await migrateLegacyState(db, user.uid, legacySnapshot.data() as LegacyFinanceState);
  await db.doc(`users/${user.uid}/finance/meta`).set({
    normalizedMigrationVersion: 1,
    normalizedMigrationAt: timestamp(),
    normalizedWrites: result.writes,
  }, { merge: true });
  revalidatePath("/");
  return { migrated: true, writes: result.writes };
}

async function findOwnedReference(collectionNames: string[], id: string, ownerId: string) {
  const db = getAdminFirestore();
  for (const collectionName of collectionNames) {
    const reference = db.collection(collectionName).doc(id);
    const snapshot = await reference.get();
    if (snapshot.exists && (snapshot.data()?.ownerId === ownerId || snapshot.data()?.uid === ownerId)) {
      return reference;
    }
  }
  throw new Error("Registro não encontrado para este usuário.");
}

export async function updateAccount(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = accountInputSchema.parse(input);
  const reference = await findOwnedReference(["accounts"], id, user.uid);
  const payload = { ...data, ownerId: user.uid, updatedAt: timestamp() };
  await reference.set(payload, { merge: true });
  revalidatePath("/");
  return { id, ...payload };
}

export async function createAccount(input: unknown) {
  const user = await requireSessionUser();
  const data = accountInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("accounts").doc();
  const payload = { ...data, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() };
  await reference.set(payload);
  revalidatePath("/");
  return { id: reference.id, ...payload };
}

export async function createCreditCard(input: unknown) {
  const user = await requireSessionUser();
  const data = (await import("../lib/finance/schemas")).creditCardInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("creditCards").doc();
  const payload = { ...data, balance: "R$ 0,00", dueDate: `vence em ${data.dueDay}`, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() };
  await reference.set(payload);
  revalidatePath("/");
  return { id: reference.id, ...payload };
}

export async function updateTransaction(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = transactionInputSchema.parse(input);
  const reference = await findOwnedReference(["transactions"], id, user.uid);
  const payload = { ...data, ownerId: user.uid, updatedAt: timestamp() };
  await reference.set(payload, { merge: true });
  revalidatePath("/");
  return { id, ...payload };
}

export async function createTransaction(input: unknown) {
  const user = await requireSessionUser();
  const data = transactionInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("transactions").doc();
  const payload = { ...data, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() };
  await reference.set(payload);
  revalidatePath("/");
  return { id: reference.id, ...payload };
}

export async function createCategory(input: unknown) {
  const user = await requireSessionUser();
  const data = categoryInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("categories").doc();
  const payload = { ...data, ownerId: user.uid, usage: 0, createdAt: timestamp(), updatedAt: timestamp() };
  await reference.set(payload);
  revalidatePath("/");
  return { id: reference.id, ...payload };
}

export async function updateCategory(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = categoryInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("categories").doc(id);
  const snapshot = await reference.get();
  if (!snapshot.exists || snapshot.data()?.ownerId !== user.uid) throw new Error("Categoria não encontrada.");
  await reference.set({ ...data, updatedAt: timestamp() }, { merge: true });
  revalidatePath("/");
  return { id, ...data };
}

export async function deleteCategory(id: string) {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const reference = db.collection("categories").doc(id);
  const snapshot = await reference.get();
  if (!snapshot.exists || snapshot.data()?.ownerId !== user.uid) throw new Error("Categoria não encontrada.");
  await reference.delete();
  revalidatePath("/");
  return { id, deleted: true };
}

export async function createGoal(input: unknown) {
  const user = await requireSessionUser();
  const data = goalInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("goals").doc();
  const payload = { ...data, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() };
  await reference.set(payload);
  revalidatePath("/");
  return { id: reference.id, ...payload };
}

export async function upsertBudget(input: unknown) {
  const user = await requireSessionUser();
  const data = budgetInputSchema.parse(input);
  const db = getAdminFirestore();
  const id = `${user.uid}_${data.month}_${data.categoryId}`;
  const reference = db.collection("budgets").doc(id);
  const payload = { ...data, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() };
  await reference.set(payload, { merge: true });
  revalidatePath("/");
  return { id: reference.id, ...payload };
}
