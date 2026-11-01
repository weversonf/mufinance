"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "../lib/auth/session";
import { sql } from "../lib/neon/db";
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

function guessCategory(payee: string, originalCategory?: string): string {
  if (originalCategory && originalCategory.trim().toLowerCase() !== "outros") return originalCategory.trim().slice(0, 80);
  
  const text = payee.toLowerCase();
  
  const foodKeywords = ["ifood", "uber eats", "rappi", "mcdonalds", "burger king", "restaurante", "padaria", "supermercado", "mercado", "carrefour", "pão de açúcar", "atacadao", "assai", "extra"];
  if (foodKeywords.some(k => text.includes(k))) return "Alimentação";

  const transportKeywords = ["uber", "99", "cabify", "posto", "gasolina", "estacionamento", "pedágio", "concessionaria", "oficina"];
  if (transportKeywords.some(k => text.includes(k))) return "Transporte";
  
  const homeKeywords = ["conta de luz", "enel", "sabesp", "copasa", "energia", "água", "internet", "claro", "vivo", "tim", "aluguel", "condominio"];
  if (homeKeywords.some(k => text.includes(k))) return "Moradia";
  
  const healthKeywords = ["farmácia", "drogaria", "pague menos", "drogasil", "raia", "hospital", "clínica", "médico", "dentista", "unimed", "amil"];
  if (healthKeywords.some(k => text.includes(k))) return "Saúde";

  const entertainmentKeywords = ["netflix", "spotify", "amazon prime", "hbo", "disney", "cinema", "ingresso", "sympla"];
  if (entertainmentKeywords.some(k => text.includes(k))) return "Lazer";

  const educationKeywords = ["faculdade", "universidade", "escola", "colegio", "curso", "udemy", "alura"];
  if (educationKeywords.some(k => text.includes(k))) return "Educação";

  return "Outros";
}


/**
 * Retorna o valor numérico preservando o sinal (negativo = débito).
 * O Math.abs() só é aplicado na gravação, não aqui.
 */
function normalizeAmountRaw(value: unknown): number {
  if (typeof value === "number") return value;
  const text = String(value ?? "").trim().replace(/R\$\s?/gi, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Detecta o tipo da transação a partir da coluna "type" (se disponível) ou pelo sinal do valor.
 * Valores negativos → expense; positivos → income; neutro sem contexto → expense.
 */
function normalizeType(value: unknown, rawAmount: number): TransactionInput["type"] {
  const text = String(value ?? "").toLocaleLowerCase("pt-BR");
  if (text.includes("transfer") || text.includes("transf")) return "transfer";
  if (text.includes("income") || text.includes("receit") || text.includes("entrada") || text.includes("crédit")) return "income";
  if (text.includes("expense") || text.includes("despesa") || text.includes("débito") || text.includes("debit")) return "expense";
  // Se não há campo "type", usar o sinal do valor bruto (negativo = saída)
  if (rawAmount > 0) return "income";
  return "expense";
}

function normalizeDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const br = text.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
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

  const errors: string[] = [];
  let imported = 0;
  const statements = [];

  for (const [index, row] of rows.entries()) {
      const rawAmount = normalizeAmountRaw(row.amount);
      const amount = Math.abs(rawAmount); // sempre positivo para armazenar
      const txType = normalizeType(row.type, rawAmount);
      const date = normalizeDate(row.date);
      const payee = String(row.payee ?? row.description ?? "Lançamento importado").trim().slice(0, 120);
      const accountId = String(row.accountId ?? row.account ?? "").trim().slice(0, 120);

      if (!accountId) {
        errors.push(`Linha ${index + 1}: accountId obrigatório.`);
        continue;
      }
      const candidate = {
        date,
        payee,
        category: guessCategory(payee, row.category),
        accountId,
        amount,
        type: txType,
        status: "completed" as const,
        sourceType: "account" as const,
        notes: String(row.notes ?? "Importado por CSV/OFX").trim().slice(0, 1000),
      };


      const parsed = transactionInputSchema.safeParse(candidate);
      if (!parsed.success) {
        errors.push(`Linha ${index + 1}: dados incompletos ou inválidos.`);
        continue;
      }

      // Usa hash determinístico como ID: reimportar é idempotente
      const id = importHash(user.uid, date, payee, amount, accountId);
      const [accountRows, existingRows] = await Promise.all([
        sql`SELECT id FROM mufinance.accounts WHERE id = ${accountId} AND owner_uid = ${user.uid} LIMIT 1`,
        sql`SELECT id FROM mufinance.transactions WHERE id = ${id} AND owner_uid = ${user.uid} LIMIT 1`,
      ]);
      if (!accountRows[0]) {
        errors.push(`Linha ${index + 1}: conta não encontrada.`);
        continue;
      }
      if (existingRows[0]) continue;

      const delta = txType === "income" ? amount : txType === "expense" ? -amount : 0;
      if (delta !== 0) {
        statements.push(sql`
          UPDATE mufinance.accounts
          SET balance = balance + ${delta}, updated_at = now()
          WHERE id = ${accountId} AND owner_uid = ${user.uid}
        `);
      }
      statements.push(sql`
        INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, date, payee, category, amount, type, status, notes, source_type, import_source)
        VALUES
          (${id}, ${user.uid}, ${accountId}, ${parsed.data.date}, ${parsed.data.payee}, ${parsed.data.category}, ${parsed.data.amount}, ${parsed.data.type}, ${parsed.data.status}, ${parsed.data.notes ?? null}, ${parsed.data.sourceType}, 'csv-or-ofx')
        ON CONFLICT (id) DO NOTHING
      `);
      imported += 1;
  }

  for (let i = 0; i < statements.length; i += 100) {
    await sql.transaction(statements.slice(i, i + 100));
  }

  revalidatePath("/");
  return { imported, errors };
}
