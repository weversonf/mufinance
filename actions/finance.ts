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

function ownerQuery(collectionName: string, ownerId: string) {
  return getAdminFirestore().collection(collectionName).where("ownerId", "==", ownerId);
}

export async function getFinanceSnapshot() {
  const user = await getSessionUser();
  if (!user) return null;

  const db = getAdminFirestore();
  const [accounts, creditCards, transactions, categories, goals, budgets] = await Promise.all([
    ownerQuery("accounts", user.uid).get(),
    ownerQuery("creditCards", user.uid).get(),
    ownerQuery("transactions", user.uid).get(),
    ownerQuery("categories", user.uid).get(),
    ownerQuery("goals", user.uid).get(),
    ownerQuery("budgets", user.uid).get(),
  ]);

  return {
    uid: user.uid,
    accounts: accounts.docs.map((item) => ({ id: item.id, ...item.data() })),
    creditCards: creditCards.docs.map((item) => ({ id: item.id, ...item.data() })),
    transactions: transactions.docs.map((item) => ({ id: item.id, ...item.data() })),
    categories: categories.docs.map((item) => ({ id: item.id, ...item.data() })),
    goals: goals.docs.map((item) => ({ id: item.id, ...item.data() })),
    budgets: budgets.docs.map((item) => ({ id: item.id, ...item.data() })),
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
