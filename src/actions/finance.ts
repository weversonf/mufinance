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

  const [accounts, creditCards, transactions, categories, goals, budgets, transferRecords] = await Promise.all([
    getOwnedDocuments(["accounts"], user.uid),
    getOwnedDocuments(["creditCards", "cards"], user.uid),
    getOwnedDocuments(["transactions"], user.uid),
    getOwnedDocuments(["categories"], user.uid),
    getOwnedDocuments(["goals"], user.uid),
    getOwnedDocuments(["budgets", "budget"], user.uid),
    getOwnedDocuments(["transferRecords"], user.uid),
  ]);

  return {
    uid: user.uid,
    accounts: accounts.map((item) => normalizeLegacyRecord("accounts", item)),
    creditCards: creditCards.map((item) => normalizeLegacyRecord("creditCards", item)),
    transactions: transactions.map((item) => normalizeLegacyRecord("transactions", item)),
    categories: categories.map((item) => normalizeLegacyRecord("categories", item)),
    goals: goals.map((item) => normalizeLegacyRecord("goals", item)),
    budgets: budgets.map((item) => normalizeLegacyRecord("budgets", item)),
    transferRecords,
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
  const payload = { ...data, isDefault: false, ownerId: user.uid, usage: 0, createdAt: timestamp(), updatedAt: timestamp() };
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
  // Categorias padrão podem ser renomeadas mas nunca virar não-padrão
  const existing = snapshot.data() ?? {};
  const merged = { ...data, isDefault: existing.isDefault ?? false, updatedAt: timestamp() };
  await reference.set(merged, { merge: true });
  revalidatePath("/");
  return { id, ...merged };
}

export async function deleteCategory(id: string) {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const reference = db.collection("categories").doc(id);
  const snapshot = await reference.get();
  if (!snapshot.exists || snapshot.data()?.ownerId !== user.uid) throw new Error("Categoria não encontrada.");
  if (snapshot.data()?.isDefault === true) throw new Error("Categorias padrão não podem ser excluídas. Você pode apenas renomeá-las (ex: Casa → Aluguel).");
  await reference.delete();
  revalidatePath("/");
  return { id, deleted: true };
}

export async function seedDefaultCategories() {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const { defaultFinanceCategories } = await import("@/lib/financeData");
  const existing = await db.collection("categories").where("ownerId", "==", user.uid).get();
  const existingNames = new Set(existing.docs.map((d) => `${String(d.data().type)}:${String(d.data().name).trim().toLowerCase()}`));
  let created = 0;
  const batch = db.batch();
  for (const cat of defaultFinanceCategories) {
    const key = `${cat.type}:${cat.name.trim().toLowerCase()}`;
    if (!existingNames.has(key)) {
      const ref = db.collection("categories").doc();
      batch.set(ref, { ...cat, isDefault: true, ownerId: user.uid, createdAt: timestamp(), updatedAt: timestamp() });
      created++;
    }
  }
  if (created > 0) await batch.commit();
  revalidatePath("/");
  return { created };
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

export async function deleteAccount(id: string) {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const ref = await findOwnedReference(["accounts"], id, user.uid);
  const snap = await ref.get();
  const data = snap.data() ?? {};
  const name = String(data?.name ?? "").trim().toLowerCase();
  if (name === "carteira") throw new Error("A conta Carteira não pode ser excluída. Ela é obrigatória.");
  // Impede deixar zero contas — deve restar ao menos 1 (Carteira)
  const [byOwner, byUid] = await Promise.all([
    db.collection("accounts").where("ownerId", "==", user.uid).get(),
    db.collection("accounts").where("uid", "==", user.uid).get(),
  ]);
  const unique = new Set([...byOwner.docs, ...byUid.docs].map((d) => d.id));
  if (unique.size <= 1) throw new Error("Não é possível excluir a última conta. Mantenha ao menos a Carteira.");

  // Se houver transações vinculadas, impede exclusão (ou move para Carteira)
  const txSnap = await db.collection("transactions").where("ownerId", "==", user.uid).where("accountId", "==", id).limit(1).get()
    .catch(async () => db.collection("transactions").where("accountId", "==", id).limit(1).get());
  if (!txSnap.empty) throw new Error("Esta conta possui transações. Apague ou mova as transações antes de excluir.");

  await ref.delete();
  revalidatePath("/");
  return { id, deleted: true };
}

export async function keepOnlyOneCheckingAccount() {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const uid = user.uid;
  const [byOwner, byUid] = await Promise.all([
    db.collection("accounts").where("ownerId", "==", uid).get(),
    db.collection("accounts").where("uid", "==", uid).get(),
  ]);
  const map = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  for (const d of [...byOwner.docs, ...byUid.docs]) map.set(d.id, d);
  const all = [...map.values()];
  // Carteira sempre permanece (wallet)
  const carteira = all.find((d) => String(d.data()?.name ?? "").trim().toLowerCase() === "carteira" || String(d.data()?.type ?? "") === "wallet");
  const checking = all.filter((d) => String(d.data()?.type ?? "") === "checking" || String(d.data()?.type ?? "").toLowerCase().includes("corrente"));
  // Se não houver checking com type exato, trata qualquer não-Carteira como corrente
  const candidates = checking.length > 0 ? checking : all.filter((d) => d.id !== carteira?.id);
  if (candidates.length <= 1) return { success: true, kept: candidates[0]?.id ?? carteira?.id ?? null, deleted: 0, message: "Já há apenas 1 conta corrente." };

  // Mantém a mais antiga (createdAt) como padrão
  const sorted = [...candidates].sort((a, b) => String(a.data()?.createdAt ?? a.id).localeCompare(String(b.data()?.createdAt ?? b.id)));
  const keep = sorted[0];
  const toDelete = sorted.slice(1);

  // Verifica se alguma das que serão excluídas tem transações — move para a mantida
  for (const doc of toDelete) {
    const txByOwner = await db.collection("transactions").where("ownerId", "==", uid).where("accountId", "==", doc.id).get().catch(() => null);
    const txByUid = await db.collection("transactions").where("uid", "==", uid).where("accountId", "==", doc.id).get().catch(() => null);
    const txs = [...(txByOwner?.docs ?? []), ...(txByUid?.docs ?? [])];
    if (txs.length > 0) {
      const batch = db.batch();
      for (const tx of txs.slice(0, 400)) batch.update(tx.ref, { accountId: keep.id, updatedAt: timestamp() });
      await batch.commit();
    }
  }

  const batch = db.batch();
  for (const doc of toDelete) batch.delete(doc.ref);
  await batch.commit();
  revalidatePath("/");
  return { success: true, kept: keep.id, keptName: String(keep.data()?.name ?? ""), deleted: toDelete.length, deletedIds: toDelete.map((d) => d.id) };
}

export async function deleteAllTransactions() {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  
  const txnsByOwnerId = await db.collection("transactions").where("ownerId", "==", user.uid).get();
  const txnsByUid = await db.collection("transactions").where("uid", "==", user.uid).get();
  const txnsByUserId = await db.collection("transactions").where("userId", "==", user.uid).get();
  
  const accsByOwnerId = await db.collection("accounts").where("ownerId", "==", user.uid).get();
  const accsByUid = await db.collection("accounts").where("uid", "==", user.uid).get();
  const accsByUserId = await db.collection("accounts").where("userId", "==", user.uid).get();

  const operations: Array<{ ref: FirebaseFirestore.DocumentReference, data?: Record<string, unknown>, type: "update" | "delete" }> = [];
  
  const allAccounts = [...accsByOwnerId.docs, ...accsByUid.docs, ...accsByUserId.docs];
  const allTransactions = [...txnsByOwnerId.docs, ...txnsByUid.docs, ...txnsByUserId.docs];
  
  // Zera os saldos - use um Map para evitar duplicatas (se o documento tiver ambos)
  const uniqueAccounts = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  allAccounts.forEach(doc => uniqueAccounts.set(doc.id, doc));
  
  const uniqueTransactions = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  allTransactions.forEach(doc => uniqueTransactions.set(doc.id, doc));

  uniqueAccounts.forEach(doc => operations.push({ ref: doc.ref, data: { balance: 0, updatedAt: timestamp() }, type: "update" }));
  uniqueTransactions.forEach(doc => operations.push({ ref: doc.ref, type: "delete" }));
  
  const BATCH_SIZE = 400;
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = operations.slice(i, i + BATCH_SIZE);
    for (const op of chunk) {
      if (op.type === "update") batch.update(op.ref, op.data ?? {});
      else batch.delete(op.ref);
    }
    await batch.commit();
  }
  
  revalidatePath("/");
  return { success: true, count: uniqueTransactions.size };
}

export async function deleteAllData() {
  const user = await requireSessionUser();
  const db = getAdminFirestore();
  const uid = user.uid;

  // Coleções que podem ser apagadas totalmente
  const wipeCollections = ["transactions", "creditCards", "cards", "categories", "goals", "budgets", "budget"];
  const allDocs: Array<{ ref: FirebaseFirestore.DocumentReference }> = [];
  const seen = new Set<string>();

  for (const col of wipeCollections) {
    const [byOwner, byUid, byUserId] = await Promise.all([
      db.collection(col).where("ownerId", "==", uid).get().catch(() => null),
      db.collection(col).where("uid", "==", uid).get().catch(() => null),
      db.collection(col).where("userId", "==", uid).get().catch(() => null),
    ]);
    for (const doc of [...(byOwner?.docs ?? []), ...(byUid?.docs ?? []), ...(byUserId?.docs ?? [])]) {
      const key = `${col}/${doc.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        allDocs.push({ ref: doc.ref });
      }
    }
  }

  // Contas: regra de negócio — deve permanecer exatamente 1 conta padrão "Carteira" com saldo 0
  // As demais são excluídas. A padrão é escolhida por nome "Carteira" (case-insensitive) ou a mais antiga.
  const [accByOwner, accByUid, accByUserId] = await Promise.all([
    db.collection("accounts").where("ownerId", "==", uid).get().catch(() => null),
    db.collection("accounts").where("uid", "==", uid).get().catch(() => null),
    db.collection("accounts").where("userId", "==", uid).get().catch(() => null),
  ]);
  const accMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  for (const doc of [...(accByOwner?.docs ?? []), ...(accByUid?.docs ?? []), ...(accByUserId?.docs ?? [])]) accMap.set(doc.id, doc);
  const accounts = [...accMap.values()];

  let keepRef: FirebaseFirestore.DocumentReference | null = null;
  if (accounts.length > 0) {
    const carteira = accounts.find((d) => String(d.data()?.name ?? "").trim().toLowerCase() === "carteira");
    const chosen = carteira ?? [...accounts].sort((a, b) => String(a.data()?.createdAt ?? "").localeCompare(String(b.data()?.createdAt ?? "")))[0];
    keepRef = chosen.ref;
    for (const doc of accounts) {
      if (doc.id !== chosen.id) {
        const key = `accounts/${doc.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          allDocs.push({ ref: doc.ref });
        }
      }
    }
  }

  // Estado legado em users/{uid}/finance/*
  const legacyRefs = [
    db.doc(`users/${uid}/finance/state`),
    db.doc(`users/${uid}/finance/meta`),
  ];
  for (const ref of legacyRefs) {
    const snap = await ref.get().catch(() => null);
    if (snap?.exists) allDocs.push({ ref });
  }

  const BATCH_SIZE = 400;
  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const doc of allDocs.slice(i, i + BATCH_SIZE)) batch.delete(doc.ref);
    await batch.commit();
  }

  // Garante que a Carteira exista e esteja zerada
  if (keepRef) {
    await keepRef.set({ name: "Carteira", type: "wallet", balance: 0, currency: "BRL", ownerId: uid, updatedAt: timestamp() }, { merge: true });
  } else {
    const ref = db.collection("accounts").doc();
    await ref.set({ name: "Carteira", type: "wallet", balance: 0, currency: "BRL", color: "mint", icon: "wallet", ownerId: uid, createdAt: timestamp(), updatedAt: timestamp() });
  }

  revalidatePath("/");
  return { success: true, deleted: allDocs.length, keptAccount: keepRef?.id ?? "created" };
}
