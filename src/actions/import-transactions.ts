"use server";

import { revalidatePath } from "next/cache";
import { getAdminFirestore } from "../lib/firebase/admin";
import { requireSessionUser } from "../lib/auth/session";
import { transactionInputSchema, type TransactionInput } from "../lib/finance/schemas";
import { createHash } from "crypto";

export type ImportTransactionRow = {
  date?: string;
  payee?: string;
  description?: string;
  category?: string;
  accountId?: string;
  account?: string;
  amount?: number | string;
  type?: string;
  notes?: string;
};

function timestamp() {
  return new Date().toISOString();
}

function normalizeAmount(value: unknown) {
  if (typeof value === "number") return value;
  const text = String(value ?? "").trim().replace(/R\$\s?/gi, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function normalizeType(value: unknown, amount: number): TransactionInput["type"] {
  const text = String(value ?? "").toLocaleLowerCase("pt-BR");
  if (text.includes("transfer") || text.includes("transf")) return "transfer";
  if (text.includes("income") || text.includes("receit") || text.includes("entrada") || text.includes("crédit")) return "income";
  return amount < 0 ? "expense" : "expense";
}

function normalizeDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const br = text.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return new Date().toISOString().slice(0, 10);
}

/**
 * Gera um ID determinístico para a transação com base nos campos que a identificam unicamente.
 * Isso torna a importação idempotente: reimportar o mesmo extrato não cria duplicatas.
 */
function importHash(ownerId: string, date: string, payee: string, amount: number, accountId: string): string {
  const raw = `${ownerId}|${date}|${payee.toLowerCase().trim()}|${amount.toFixed(2)}|${accountId}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 40);
}

export async function importTransactions(rows: ImportTransactionRow[]) {
  const user = await requireSessionUser();
  if (!Array.isArray(rows) || rows.length === 0) return { imported: 0, errors: ["Nenhum lançamento encontrado."] };
  if (rows.length > 500) throw new Error("Importe no máximo 500 lançamentos por vez.");

  const db = getAdminFirestore();
  const batch = db.batch();
  const errors: string[] = [];
  let imported = 0;

  rows.forEach((row, index) => {
    const amount = normalizeAmount(row.amount);
    const date = normalizeDate(row.date);
    const payee = String(row.payee ?? row.description ?? "Lançamento importado").trim().slice(0, 120);
    const accountId = String(row.accountId ?? row.account ?? "Conta principal").trim().slice(0, 120);
    const candidate = {
      date,
      payee,
      category: String(row.category ?? "Outros").trim().slice(0, 80),
      accountId,
      amount,
      type: normalizeType(row.type, amount),
      status: "completed" as const,
      sourceType: "account" as const,
      notes: String(row.notes ?? "Importado por CSV/OFX").trim().slice(0, 1000),
    };
    const parsed = transactionInputSchema.safeParse(candidate);
    if (!parsed.success) {
      errors.push(`Linha ${index + 1}: dados incompletos ou inválidos.`);
      return;
    }
    // Usa hash determinístico como ID: reimportar o mesmo extrato é idempotente.
    const docId = importHash(user.uid, date, payee, amount, accountId);
    const reference = db.collection("transactions").doc(docId);
    batch.set(reference, { ...parsed.data, ownerId: user.uid, importSource: "csv-or-ofx", createdAt: timestamp(), updatedAt: timestamp() }, { merge: false });
    imported += 1;
  });

  if (imported > 0) await batch.commit();
  revalidatePath("/");
  return { imported, errors };
}
