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

function numericAmount(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? "").trim().replace(/[^0-9,.-]/g, "");
  if (!raw) return 0;
  const comma = raw.lastIndexOf(",");
  const dot = raw.lastIndexOf(".");
  const normalized = comma >= 0 && dot >= 0
    ? comma > dot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "")
    : comma >= 0 ? raw.replace(",", ".") : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function updateAccount(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = accountInputSchema.parse(input);
  const { createAdjustment, ...cleanData } = data;
  const reference = await findOwnedReference(["accounts"], id, user.uid);
  const currentSnapshot = await reference.get();
  const currentBalance = numericAmount(currentSnapshot.data()?.balance);
  const difference = Number((cleanData.balance - currentBalance).toFixed(2));
  const now = timestamp();
  const accountPayload = { ...cleanData, ownerId: user.uid, updatedAt: now };
  const batch = getAdminFirestore().batch();
  batch.set(reference, accountPayload, { merge: true });

  if (difference !== 0 && createAdjustment !== false) {
    const adjustmentReference = getAdminFirestore().collection("transactions").doc();
    batch.set(adjustmentReference, {
      date: now.slice(0, 10),
      payee: "Ajuste de saldo",
      category: "Ajuste",
      accountId: id,
      amount: Math.abs(difference),
      type: difference > 0 ? "income" : "expense",
      status: "completed",
      sourceType: "account",
      sourceId: id,
      notes: `Saldo ajustado de ${currentBalance.toFixed(2)} para ${cleanData.balance.toFixed(2)}.`,
      isSystemEntry: true,
      ownerId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  revalidatePath("/");
  return { id, ...accountPayload, adjustment: difference };
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
  const db = getAdminFirestore();
  const reference = await findOwnedReference(["transactions"], id, user.uid);

  await db.runTransaction(async (txn) => {
    // ── FASE 1: todas as leituras (Firestore exige get antes de write) ──
    const current = await txn.get(reference);
    if (!current.exists) throw new Error("Transação não encontrada.");

    const oldType = String(current.data()?.type ?? "");
    const oldAmount = numericAmount(current.data()?.amount);
    const oldAccountId = String(current.data()?.accountId ?? "");
    const sameAccount = oldAccountId === data.accountId;

    const oldAccountRef = oldAccountId ? db.collection("accounts").doc(oldAccountId) : null;
    const newAccountRef = (data.accountId && !sameAccount) ? db.collection("accounts").doc(data.accountId) : null;

    const oldAccountSnap = oldAccountRef ? await txn.get(oldAccountRef) : null;
    const newAccountSnap = newAccountRef ? await txn.get(newAccountRef) : null;
    // Se mesma conta, reutilizar o snapshot já lido
    const sameAccountSnap = sameAccount && oldAccountSnap ? oldAccountSnap : null;

    // ── FASE 2: todas as escritas ──

    // Reverte efeito antigo e aplica novo (mesma conta)
    if (sameAccount && sameAccountSnap?.exists && (sameAccountSnap.data()?.ownerId === user.uid || sameAccountSnap.data()?.uid === user.uid)) {
      const balance = numericAmount(sameAccountSnap.data()?.balance);
      const revert = oldType === "income" ? -oldAmount : oldType === "expense" ? oldAmount : 0;
      const apply = data.type === "income" ? data.amount : data.type === "expense" ? -data.amount : 0;
      txn.update(oldAccountRef!, { balance: Number((balance + revert + apply).toFixed(2)), updatedAt: timestamp() });
    } else {
      // Reverte efeito antigo na conta antiga
      if (oldAccountSnap?.exists && (oldAccountSnap.data()?.ownerId === user.uid || oldAccountSnap.data()?.uid === user.uid) && (oldType === "income" || oldType === "expense")) {
        const oldBalance = numericAmount(oldAccountSnap.data()?.balance);
        const revert = oldType === "income" ? -oldAmount : oldAmount;
        txn.update(oldAccountRef!, { balance: Number((oldBalance + revert).toFixed(2)), updatedAt: timestamp() });
      }
      // Aplica efeito novo na conta nova
      if (newAccountSnap?.exists && (newAccountSnap.data()?.ownerId === user.uid || newAccountSnap.data()?.uid === user.uid) && (data.type === "income" || data.type === "expense")) {
        const newBalance = numericAmount(newAccountSnap.data()?.balance);
        const delta = data.type === "income" ? data.amount : -data.amount;
        txn.update(newAccountRef!, { balance: Number((newBalance + delta).toFixed(2)), updatedAt: timestamp() });
      }
    }

    txn.set(reference, { ...data, ownerId: user.uid, updatedAt: timestamp() }, { merge: true });
  });

  revalidatePath("/");
  return { id, ...data };
}

export async function createTransaction(input: unknown) {
  const user = await requireSessionUser();
  const data = transactionInputSchema.parse(input);
  const db = getAdminFirestore();
  const reference = db.collection("transactions").doc();
  const payload = { ...data, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() };

  if (data.type === "transfer" && data.destinationAccountId) {
    // Transferência: debita conta origem e credita conta destino atomicamente
    await db.runTransaction(async (txn) => {
      const [originSnap, destSnap] = await Promise.all([
        txn.get(db.collection("accounts").doc(data.accountId)),
        txn.get(db.collection("accounts").doc(data.destinationAccountId!)),
      ]);
      if (!originSnap.exists || (originSnap.data()?.ownerId !== user.uid && originSnap.data()?.uid !== user.uid)) {
        throw new Error("Conta de origem não encontrada ou sem permissão.");
      }
      if (!destSnap.exists || (destSnap.data()?.ownerId !== user.uid && destSnap.data()?.uid !== user.uid)) {
        throw new Error("Conta de destino não encontrada ou sem permissão.");
      }
      const originBalance = numericAmount(originSnap.data()?.balance);
      const destBalance = numericAmount(destSnap.data()?.balance);
      txn.update(originSnap.ref, { balance: Number((originBalance - data.amount).toFixed(2)), updatedAt: timestamp() });
      txn.update(destSnap.ref, { balance: Number((destBalance + data.amount).toFixed(2)), updatedAt: timestamp() });
      // Salva dois registros espelhados: saída na origem e entrada no destino
      const destTxnRef = db.collection("transactions").doc();
      txn.set(reference, { ...payload, type: "expense" });
      txn.set(destTxnRef, { ...payload, id: destTxnRef.id, accountId: data.destinationAccountId, destinationAccountId: data.accountId, type: "income" });
    });
  } else if (data.type === "income" || data.type === "expense") {
    // Receita ou despesa: atualiza saldo da conta atomicamente
    await db.runTransaction(async (txn) => {
      const accountRef = db.collection("accounts").doc(data.accountId);
      const accountSnap = await txn.get(accountRef);
      if (accountSnap.exists && (accountSnap.data()?.ownerId === user.uid || accountSnap.data()?.uid === user.uid)) {
        const currentBalance = numericAmount(accountSnap.data()?.balance);
        const delta = data.type === "income" ? data.amount : -data.amount;
        txn.update(accountRef, { balance: Number((currentBalance + delta).toFixed(2)), updatedAt: timestamp() });
      }
      txn.set(reference, payload);
    });
  } else {
    await reference.set(payload);
  }

  revalidatePath("/");
  return { id: reference.id, ...payload };
}

export async function deleteTransaction(id: string) {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const reference = await findOwnedReference(["transactions"], id, user.uid);

  await db.runTransaction(async (txn) => {
    const snap = await txn.get(reference);
    if (!snap.exists) throw new Error("Transação não encontrada.");

    const type = String(snap.data()?.type ?? "");
    const amount = numericAmount(snap.data()?.amount);
    const accountId = String(snap.data()?.accountId ?? "");

    // Reverte o efeito da transação no saldo da conta
    if (accountId && (type === "income" || type === "expense")) {
      const accountRef = db.collection("accounts").doc(accountId);
      const accountSnap = await txn.get(accountRef);
      if (accountSnap.exists && (accountSnap.data()?.ownerId === user.uid || accountSnap.data()?.uid === user.uid)) {
        const currentBalance = numericAmount(accountSnap.data()?.balance);
        const revert = type === "income" ? -amount : amount;
        txn.update(accountRef, { balance: Number((currentBalance + revert).toFixed(2)), updatedAt: timestamp() });
      }
    }

    txn.delete(reference);
  });

  revalidatePath("/");
  return { id, deleted: true };
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

export async function deleteAllTransactions() {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  
  const txnsSnap = await db.collection("transactions").where("ownerId", "==", user.uid).get();
  const accsSnap = await db.collection("accounts").where("ownerId", "==", user.uid).get();

  const operations: { ref: any, data?: any, type: "update" | "delete" }[] = [];
  
  // Zera os saldos
  accsSnap.docs.forEach(doc => operations.push({ ref: doc.ref, data: { balance: 0, updatedAt: timestamp() }, type: "update" }));
  // Deleta transações
  txnsSnap.docs.forEach(doc => operations.push({ ref: doc.ref, type: "delete" }));
  
  const BATCH_SIZE = 400;
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = operations.slice(i, i + BATCH_SIZE);
    for (const op of chunk) {
      if (op.type === "update") batch.update(op.ref, op.data);
      else batch.delete(op.ref);
    }
    await batch.commit();
  }
  
  revalidatePath("/");
  return { success: true, count: txnsSnap.size };
}
