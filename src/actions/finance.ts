"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser, requireSessionUser } from "../lib/auth/session";
import { sql } from "../lib/neon/db";
import {
  accountInputSchema,
  budgetInputSchema,
  categoryInputSchema,
  goalInputSchema,
  transactionInputSchema,
} from "../lib/finance/schemas";

export async function getFinanceSnapshot() {
  const user = await getSessionUser();
  if (!user) return null;

  // Todos os dados financeiros do snapshot vêm do banco novo.
  const [accounts, transactions, categories, creditCards, goals, budgets, transferRecords, notifications] = await Promise.all([
    getNeonAccounts(user.uid),
    getNeonTransactions(user.uid),
    getNeonCategories(user.uid),
    getNeonCreditCards(user.uid),
    getNeonGoals(user.uid),
    getNeonBudgets(user.uid),
    getNeonTransferRecords(user.uid),
    getNeonNotifications(user.uid),
  ]);

  return {
    uid: user.uid,
    accounts,
    creditCards,
    transactions,
    categories,
    goals,
    budgets,
    transferRecords,
    notifications,
  };
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

function mapAccount(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    institution: row.institution ?? null,
    type: String(row.type ?? "checking"),
    balance: Number(row.balance ?? 0),
    currency: String(row.currency ?? "BRL"),
    color: row.color ?? null,
    icon: row.icon ?? null,
    accountNumber: row.account_number ?? null,
    internalWallet: Boolean(row.internal_wallet),
    locked: Boolean(row.locked),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNeonAccounts(ownerUid: string) {
  const rows = await sql`
    SELECT id, name, institution, type, balance, currency, color, icon,
           account_number, internal_wallet, locked, created_at, updated_at
    FROM mufinance.accounts
    WHERE owner_uid = ${ownerUid}
    ORDER BY created_at ASC, name ASC
  `;
  return rows.map((row) => mapAccount(row as Record<string, unknown>));
}

async function getNeonAccount(id: string, ownerUid: string) {
  const rows = await sql`
    SELECT id, name, institution, type, balance, currency, color, icon,
           account_number, internal_wallet, locked, created_at, updated_at
    FROM mufinance.accounts
    WHERE id = ${id} AND owner_uid = ${ownerUid}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Registro não encontrado para este usuário.");
  return mapAccount(rows[0] as Record<string, unknown>);
}

function mapTransaction(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_uid),
    accountId: row.account_id ?? null,
    destinationAccountId: row.destination_account_id ?? null,
    date: String(row.date ?? ""),
    payee: String(row.payee ?? ""),
    category: String(row.category ?? "Outros"),
    categoryId: row.category_id ?? null,
    amount: Number(row.amount ?? 0),
    type: String(row.type ?? "expense"),
    status: String(row.status ?? "completed"),
    notes: row.notes ?? null,
    sourceType: row.source_type ?? null,
    sourceId: row.source_id ?? null,
    invoiceId: row.invoice_id ?? null,
    installmentNumber: row.installment_number ?? null,
    installmentTotal: row.installment_total ?? null,
    installmentGroupId: row.installment_group_id ?? null,
    isSystemEntry: Boolean(row.is_system_entry),
    importSource: row.import_source ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNeonTransactions(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, account_id, destination_account_id, date, payee,
           category, category_id, amount, type, status, notes, source_type,
           source_id, invoice_id, installment_number, installment_total,
           installment_group_id, is_system_entry, import_source, created_at, updated_at
    FROM mufinance.transactions
    WHERE owner_uid = ${ownerUid}
    ORDER BY date DESC, created_at DESC
  `;
  return rows.map((row) => mapTransaction(row as Record<string, unknown>));
}

async function getNeonTransaction(id: string, ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, account_id, destination_account_id, date, payee,
           category, category_id, amount, type, status, notes, source_type,
           source_id, invoice_id, installment_number, installment_total,
           installment_group_id, is_system_entry, import_source, created_at, updated_at
    FROM mufinance.transactions
    WHERE id = ${id} AND owner_uid = ${ownerUid}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Transação não encontrada.");
  return mapTransaction(rows[0] as Record<string, unknown>);
}

function mapCategory(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_uid),
    name: String(row.name ?? ""),
    type: String(row.type ?? "expense"),
    tone: String(row.tone ?? "blue"),
    active: Boolean(row.active),
    isDefault: Boolean(row.is_default),
    usage: Number(row.usage ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNeonCategories(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, name, type, tone, active, is_default, usage, created_at, updated_at
    FROM mufinance.categories
    WHERE owner_uid = ${ownerUid}
    ORDER BY type ASC, name ASC
  `;
  return rows.map((row) => mapCategory(row as Record<string, unknown>));
}

function mapCreditCard(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_uid),
    name: String(row.name ?? "Cartão"),
    last4: String(row.last4 ?? ""),
    brand: String(row.brand ?? "Visa"),
    color: String(row.color ?? "ocean"),
    limit: Number(row.credit_limit ?? 0),
    balance: String(row.balance ?? "R$ 0,00"),
    closingDay: row.closing_day ?? null,
    dueDay: row.due_day ?? null,
    dueDate: row.due_date ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNeonCreditCards(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, name, last4, brand, color, credit_limit, balance,
           closing_day, due_day, due_date, created_at, updated_at
    FROM mufinance.credit_cards
    WHERE owner_uid = ${ownerUid}
    ORDER BY created_at ASC, name ASC
  `;
  return rows.map((row) => mapCreditCard(row as Record<string, unknown>));
}

async function getNeonCreditCard(id: string, ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, name, last4, brand, color, credit_limit, balance,
           closing_day, due_day, due_date, created_at, updated_at
    FROM mufinance.credit_cards
    WHERE id = ${id} AND owner_uid = ${ownerUid}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Cartão não encontrado.");
  return mapCreditCard(rows[0] as Record<string, unknown>);
}

function mapGoal(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_uid),
    name: String(row.name ?? "Meta"),
    targetAmount: Number(row.target_amount ?? 0),
    currentAmount: Number(row.current_amount ?? 0),
    dueDate: row.due_date ?? null,
    color: String(row.color ?? "mint"),
    iconName: String(row.icon_name ?? "target"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNeonGoals(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, name, target_amount, current_amount, due_date, color,
           icon_name, created_at, updated_at
    FROM mufinance.goals
    WHERE owner_uid = ${ownerUid}
    ORDER BY created_at ASC, name ASC
  `;
  return rows.map((row) => mapGoal(row as Record<string, unknown>));
}

function mapBudget(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_uid),
    month: String(row.month),
    categoryId: String(row.category_id),
    limitAmount: Number(row.limit_amount ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNeonBudgets(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, month, category_id, limit_amount, created_at, updated_at
    FROM mufinance.budgets
    WHERE owner_uid = ${ownerUid}
    ORDER BY month DESC, category_id ASC
  `;
  return rows.map((row) => mapBudget(row as Record<string, unknown>));
}

function mapTransferRecord(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_uid),
    direction: String(row.direction),
    transferId: String(row.transfer_id),
    amount: Number(row.amount ?? 0),
    contactName: row.contact_name ?? null,
    contactUsername: row.contact_username ?? null,
    contactAvatar: row.contact_avatar ?? null,
    note: row.note ?? null,
    status: String(row.status ?? "completed"),
    createdAt: row.created_at,
  };
}

async function getNeonTransferRecords(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, direction, transfer_id, amount, contact_name,
           contact_username, contact_avatar, note, status, created_at
    FROM mufinance.transfer_records
    WHERE owner_uid = ${ownerUid}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => mapTransferRecord(row as Record<string, unknown>));
}

function mapNotification(row: Record<string, unknown>) {
  const meta = (row.metadata as Record<string, unknown>) ?? {};
  const createdAt = row.created_at ? new Date(String(row.created_at)) : new Date();
  const timeFormatted = createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
    createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return {
    id: String(row.id),
    type: (row.type as any) ?? "request",
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    time: timeFormatted,
    read: Boolean(row.read),
    icon: String(row.icon ?? "hand-coins"),
    status: (row.status as any) ?? "pending",
    metadata: {
      senderUid: meta.senderUid ? String(meta.senderUid) : undefined,
      senderUsername: meta.senderUsername ? String(meta.senderUsername) : undefined,
      senderName: meta.senderName ? String(meta.senderName) : undefined,
      amount: meta.amount ? Number(meta.amount) : undefined,
      category: meta.category ? String(meta.category) : undefined,
      payee: meta.payee ? String(meta.payee) : undefined,
      date: meta.date ? String(meta.date) : undefined,
      notes: meta.notes ? String(meta.notes) : undefined,
    },
    actionable: row.status === "pending" ? {
      accept: "Aceitar",
      decline: "Recusar",
      amount: meta.amount ? `R$ ${Number(meta.amount).toFixed(2).replace(".", ",")}` : undefined,
      from: meta.senderUsername ? `@${meta.senderUsername}` : (meta.senderName ? String(meta.senderName) : undefined),
    } : undefined,
  };
}

async function getNeonNotifications(ownerUid: string) {
  const rows = await sql`
    SELECT id, owner_uid, type, title, description, read, icon, metadata, status, created_at
    FROM mufinance.notifications
    WHERE owner_uid = ${ownerUid}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows.map((row) => mapNotification(row as Record<string, unknown>));
}

function accountDelta(type: string, amount: number) {
  if (type === "income") return amount;
  if (type === "expense") return -amount;
  return 0;
}

function transactionColumns(data: ReturnType<typeof transactionInputSchema.parse>) {
  return {
    date: data.date,
    payee: data.payee,
    category: data.category,
    accountId: data.accountId,
    destinationAccountId: data.destinationAccountId ?? null,
    amount: data.amount,
    type: data.type,
    status: data.status,
    sourceType: data.sourceType,
    sourceId: data.sourceId ?? null,
    invoiceId: data.invoiceId ?? null,
    notes: data.notes ?? null,
    installmentNumber: data.installmentNumber ?? null,
    installmentTotal: data.installmentTotal ?? null,
    installmentGroupId: data.installmentGroupId ?? null,
  };
}

export async function updateAccount(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = accountInputSchema.parse(input);
  const { createAdjustment, ...cleanData } = data;
  const current = await getNeonAccount(id, user.uid);
  const currentBalance = numericAmount(current.balance);
  const difference = Number((cleanData.balance - currentBalance).toFixed(2));
  const accountPayload = { ...cleanData, ownerId: user.uid };

  await sql`
    UPDATE mufinance.accounts
    SET name = ${cleanData.name}, type = ${cleanData.type}, balance = ${cleanData.balance},
        color = ${cleanData.color}, icon = ${cleanData.icon}, currency = ${cleanData.currency},
        updated_at = now()
    WHERE id = ${id} AND owner_uid = ${user.uid}
  `;

  if (difference !== 0 && createAdjustment !== false) {
    await sql`
      INSERT INTO mufinance.transactions
        (id, owner_uid, account_id, date, payee, category, amount, type, status,
         source_type, source_id, notes, is_system_entry)
      VALUES
        (${crypto.randomUUID()}, ${user.uid}, ${id}, CURRENT_DATE::text, 'Ajuste de saldo',
         'Ajuste', ${Math.abs(difference)}, ${difference > 0 ? "income" : "expense"},
         'completed', 'account', ${id},
         ${`Saldo ajustado de ${currentBalance.toFixed(2)} para ${cleanData.balance.toFixed(2)}.`}, true)
    `;
  }

  revalidatePath("/");
  return { id, ...accountPayload, adjustment: difference };
}

export async function createAccount(input: unknown) {
  const user = await requireSessionUser();
  const data = accountInputSchema.parse(input);
  const id = crypto.randomUUID();
  const payload = { ...data, ownerId: user.uid };
  await sql`
    INSERT INTO mufinance.accounts
      (id, owner_uid, name, type, balance, currency, color, icon)
    VALUES
      (${id}, ${user.uid}, ${data.name}, ${data.type}, ${data.balance}, ${data.currency}, ${data.color}, ${data.icon})
  `;
  revalidatePath("/");
  return { id, ...payload };
}

export async function createCreditCard(input: unknown) {
  const user = await requireSessionUser();
  const data = (await import("../lib/finance/schemas")).creditCardInputSchema.parse(input);
  const id = crypto.randomUUID();
  const payload = { ...data, balance: "R$ 0,00", dueDate: `vence em ${data.dueDay}`, ownerId: user.uid };
  await sql`
    INSERT INTO mufinance.credit_cards
      (id, owner_uid, name, last4, brand, color, credit_limit, balance, closing_day, due_day, due_date)
    VALUES
      (${id}, ${user.uid}, ${data.name}, ${data.last4}, ${data.brand}, ${data.color}, ${data.limit}, 'R$ 0,00', ${data.closingDay}, ${data.dueDay}, ${payload.dueDate})
  `;
  revalidatePath("/");
  return { id, ...payload };
}

export async function updateCreditCard(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = (await import("../lib/finance/schemas")).creditCardInputSchema.parse(input);
  const rows = await sql`
    UPDATE mufinance.credit_cards
    SET name = ${data.name}, last4 = ${data.last4}, brand = ${data.brand}, color = ${data.color},
        credit_limit = ${data.limit}, closing_day = ${data.closingDay}, due_day = ${data.dueDay},
        due_date = ${`vence em ${data.dueDay}`}, updated_at = now()
    WHERE id = ${id} AND owner_uid = ${user.uid}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("Cartão não encontrado.");
  revalidatePath("/");
  return { id, ...data };
}

export async function updateTransaction(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = transactionInputSchema.parse(input);
  const current = await getNeonTransaction(id, user.uid);
  const scope = typeof input === "object" && input !== null && "scope" in input ? input.scope : "one";
  if (scope === "series" || scope === "selected") {
    const group = current.installmentGroupId;
    if (scope === "series" && (typeof group !== "string" || !group.startsWith("fixed_"))) throw new Error("Esta transação não possui uma série fixa identificada.");
    const ids = scope === "selected" && typeof input === "object" && input !== null && "selectedIds" in input && Array.isArray(input.selectedIds) ? input.selectedIds : [];
    if (scope === "selected" && (ids.length < 1 || ids.length > 119 || !ids.every((value) => typeof value === "string" && value.length <= 120))) throw new Error("Selecione de 1 a 119 ocorrências válidas.");
    if (scope === "selected" && (current.installmentGroupId || current.destinationAccountId)) throw new Error("Não é possível agrupar esta transação.");
    if (data.accountId !== current.accountId || data.sourceType !== "account" || (current.sourceType && current.sourceType !== "account")) throw new Error("A edição da série não permite trocar a conta ou a origem.");
    const targetIds = JSON.stringify([id, ...ids]);
    const nextDelta = accountDelta(data.type, data.amount);
    await sql`
      WITH previous AS MATERIALIZED (
        SELECT id, account_id, amount, type
        FROM mufinance.transactions
        WHERE owner_uid = ${user.uid} AND (
          (${scope === "series"} AND installment_group_id = ${typeof group === "string" ? group : ""}) OR
          (${scope === "selected"} AND id IN (SELECT jsonb_array_elements_text(${targetIds}::jsonb))
           AND installment_group_id IS NULL AND destination_account_id IS NULL
           AND account_id = ${String(current.accountId ?? "")}
           AND payee = ${current.payee} AND category = ${current.category} AND type = ${current.type}
           AND (source_type = 'account' OR source_type IS NULL))
        )
        FOR UPDATE
      ), changed AS (
        UPDATE mufinance.transactions AS t
        SET payee = ${data.payee}, category = ${data.category}, amount = ${data.amount},
            type = ${data.type}, notes = ${data.notes ?? null},
            date = CASE WHEN t.id = ${id} THEN ${data.date} ELSE t.date END,
            status = CASE WHEN t.id = ${id} THEN ${data.status} ELSE t.status END,
            updated_at = now()
        FROM previous p WHERE t.id = p.id AND t.owner_uid = ${user.uid}
        RETURNING p.account_id, p.amount AS old_amount, p.type AS old_type
      ), deltas AS (
        SELECT account_id, sum(${nextDelta}::numeric - CASE old_type WHEN 'income' THEN old_amount WHEN 'expense' THEN -old_amount ELSE 0 END) AS delta
        FROM changed WHERE account_id IS NOT NULL GROUP BY account_id
      )
      UPDATE mufinance.accounts a SET balance = a.balance + d.delta, updated_at = now()
      FROM deltas d WHERE a.id = d.account_id AND a.owner_uid = ${user.uid}
    `;
    revalidatePath("/");
    return { id, ...data };
  }
  const oldAccountId = String(current.accountId ?? "");
  const columns = transactionColumns(data);
  const queries = [];

  const isOldCard = current.sourceType === "credit-card";
  const isNewCard = data.sourceType === "credit-card";

  if (!isOldCard && !isNewCard) {
    const newAccount = await getNeonAccount(data.accountId, user.uid);
    const oldDelta = accountDelta(String(current.type), Number(current.amount));
    const newDelta = accountDelta(data.type, data.amount);

    if (oldAccountId === data.accountId) {
      queries.push(sql`
        UPDATE mufinance.accounts
        SET balance = balance + ${newDelta - oldDelta}, updated_at = now()
        WHERE id = ${data.accountId} AND owner_uid = ${user.uid}
      `);
    } else {
      if (oldAccountId && oldDelta !== 0) {
        queries.push(sql`
          UPDATE mufinance.accounts
          SET balance = balance - ${oldDelta}, updated_at = now()
          WHERE id = ${oldAccountId} AND owner_uid = ${user.uid}
        `);
      }
      if (newDelta !== 0) {
        queries.push(sql`
          UPDATE mufinance.accounts
          SET balance = balance + ${newDelta}, updated_at = now()
          WHERE id = ${newAccount.id} AND owner_uid = ${user.uid}
        `);
      }
    }
  }
  queries.push(sql`
    UPDATE mufinance.transactions
    SET date = ${columns.date}, payee = ${columns.payee}, category = ${columns.category},
        account_id = ${columns.accountId}, destination_account_id = ${columns.destinationAccountId},
        amount = ${columns.amount}, type = ${columns.type}, status = ${columns.status},
        source_type = ${columns.sourceType}, source_id = ${columns.sourceId},
        invoice_id = ${columns.invoiceId}, notes = ${columns.notes},
        installment_number = ${columns.installmentNumber}, installment_total = ${columns.installmentTotal},
        installment_group_id = ${columns.installmentGroupId}, updated_at = now()
    WHERE id = ${id} AND owner_uid = ${user.uid}
  `);
  await sql.transaction(queries);

  revalidatePath("/");
  return { id, ...data };
}

export async function createTransaction(input: unknown) {
  const user = await requireSessionUser();
  const data = transactionInputSchema.parse(input);
  const columns = transactionColumns(data);
  const id = crypto.randomUUID();

  if (data.sourceType === "credit-card") {
    await getNeonCreditCard(data.accountId, user.uid);
    await sql`
      INSERT INTO mufinance.transactions
        (id, owner_uid, account_id, destination_account_id, date, payee, category, amount, type, status, source_type, source_id, invoice_id, notes, installment_number, installment_total, installment_group_id)
      VALUES (${id}, ${user.uid}, ${columns.accountId}, ${columns.destinationAccountId}, ${columns.date}, ${columns.payee}, ${columns.category}, ${columns.amount}, ${columns.type}, ${columns.status}, ${columns.sourceType}, ${columns.sourceId}, ${columns.invoiceId}, ${columns.notes}, ${columns.installmentNumber}, ${columns.installmentTotal}, ${columns.installmentGroupId})
    `;
    revalidatePath("/");
    return { id, ...data, ownerId: user.uid };
  }

  const account = await getNeonAccount(data.accountId, user.uid);

  if (data.type === "transfer" && data.destinationAccountId) {
    let destinationAccount;
    try {
      destinationAccount = await getNeonAccount(data.destinationAccountId, user.uid);
    } catch {
      // Pagamento de fatura: o destino é um cartão, não uma conta financeira.
      await getNeonCreditCard(data.destinationAccountId, user.uid);
      await sql.transaction([
        sql`UPDATE mufinance.accounts SET balance = balance - ${data.amount}, updated_at = now() WHERE id = ${account.id} AND owner_uid = ${user.uid}`,
        sql`INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, destination_account_id, date, payee, category, amount, type, status, source_type, source_id, invoice_id, notes, installment_number, installment_total, installment_group_id)
          VALUES (${id}, ${user.uid}, ${columns.accountId}, ${data.destinationAccountId}, ${columns.date}, ${columns.payee}, ${columns.category}, ${columns.amount}, 'expense', ${columns.status}, ${columns.sourceType}, ${columns.sourceId}, ${columns.invoiceId}, ${columns.notes}, ${columns.installmentNumber}, ${columns.installmentTotal}, ${columns.installmentGroupId})`,
      ]);
    }
    if (destinationAccount) {
      const destinationId = crypto.randomUUID();
      await sql.transaction([
        sql`UPDATE mufinance.accounts SET balance = balance - ${data.amount}, updated_at = now() WHERE id = ${account.id} AND owner_uid = ${user.uid}`,
        sql`UPDATE mufinance.accounts SET balance = balance + ${data.amount}, updated_at = now() WHERE id = ${destinationAccount.id} AND owner_uid = ${user.uid}`,
        sql`INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, destination_account_id, date, payee, category, amount, type, status, source_type, source_id, invoice_id, notes, installment_number, installment_total, installment_group_id)
          VALUES (${id}, ${user.uid}, ${columns.accountId}, ${destinationAccount.id}, ${columns.date}, ${columns.payee}, ${columns.category}, ${columns.amount}, 'expense', ${columns.status}, ${columns.sourceType}, ${columns.sourceId}, ${columns.invoiceId}, ${columns.notes}, ${columns.installmentNumber}, ${columns.installmentTotal}, ${columns.installmentGroupId})`,
        sql`INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, destination_account_id, date, payee, category, amount, type, status, source_type, source_id, invoice_id, notes, installment_number, installment_total, installment_group_id)
          VALUES (${destinationId}, ${user.uid}, ${destinationAccount.id}, ${account.id}, ${columns.date}, ${columns.payee}, ${columns.category}, ${columns.amount}, 'income', ${columns.status}, ${columns.sourceType}, ${columns.sourceId}, ${columns.invoiceId}, ${columns.notes}, ${columns.installmentNumber}, ${columns.installmentTotal}, ${columns.installmentGroupId})`,
      ]);
    }
  } else if (data.type === "income" || data.type === "expense") {
    const delta = accountDelta(data.type, data.amount);
    await sql.transaction([
      sql`UPDATE mufinance.accounts SET balance = balance + ${delta}, updated_at = now() WHERE id = ${account.id} AND owner_uid = ${user.uid}`,
      sql`INSERT INTO mufinance.transactions
        (id, owner_uid, account_id, destination_account_id, date, payee, category, amount, type, status, source_type, source_id, invoice_id, notes, installment_number, installment_total, installment_group_id)
        VALUES (${id}, ${user.uid}, ${columns.accountId}, ${columns.destinationAccountId}, ${columns.date}, ${columns.payee}, ${columns.category}, ${columns.amount}, ${columns.type}, ${columns.status}, ${columns.sourceType}, ${columns.sourceId}, ${columns.invoiceId}, ${columns.notes}, ${columns.installmentNumber}, ${columns.installmentTotal}, ${columns.installmentGroupId})`,
    ]);
  } else {
    await sql`
      INSERT INTO mufinance.transactions
        (id, owner_uid, account_id, destination_account_id, date, payee, category, amount, type, status, source_type, source_id, invoice_id, notes, installment_number, installment_total, installment_group_id)
      VALUES (${id}, ${user.uid}, ${columns.accountId}, ${columns.destinationAccountId}, ${columns.date}, ${columns.payee}, ${columns.category}, ${columns.amount}, ${columns.type}, ${columns.status}, ${columns.sourceType}, ${columns.sourceId}, ${columns.invoiceId}, ${columns.notes}, ${columns.installmentNumber}, ${columns.installmentTotal}, ${columns.installmentGroupId})
    `;
  }

  if (data.type === "expense" && data.taggedUsername) {
    const cleanUsername = data.taggedUsername.toLowerCase().replace(/^@+/, "").trim();
    if (cleanUsername) {
      try {
        const friendRows = await sql`
          SELECT uid, username, display_name
          FROM mufinance.profiles
          WHERE username = ${cleanUsername}
          LIMIT 1
        `;
        if (friendRows[0] && friendRows[0].uid !== user.uid) {
          const friendUid = String(friendRows[0].uid);
          const senderProfileRows = await sql`
            SELECT username, display_name FROM mufinance.profiles WHERE uid = ${user.uid} LIMIT 1
          `;
          const senderName = String(senderProfileRows[0]?.display_name ?? user.name ?? user.email?.split("@")[0] ?? "Um amigo");
          const senderUsername = String(senderProfileRows[0]?.username ?? "");
          const notifId = crypto.randomUUID();
          const shareVal = data.sharedAmount && data.sharedAmount > 0 ? data.sharedAmount : data.amount;

          await sql`
            INSERT INTO mufinance.notifications
              (id, owner_uid, type, title, description, read, icon, metadata, status)
            VALUES (
              ${notifId},
              ${friendUid},
              'request',
              ${senderUsername ? `@${senderUsername} marcou você numa despesa` : `${senderName} marcou você numa despesa`},
              ${`${senderName} pagou "${data.payee}" (${data.category}) no valor de R$ ${shareVal.toFixed(2).replace(".", ",")} e indicou como recebimento seu.`},
              false,
              'hand-coins',
              ${JSON.stringify({
                senderUid: user.uid,
                senderUsername,
                senderName,
                amount: shareVal,
                category: data.category,
                payee: data.payee,
                date: data.date,
                notes: data.notes ?? "",
              })},
              'pending'
            )
          `;
        }
      } catch (err) {
        console.error("Falha ao notificar amigo:", err);
      }
    }
  }

  revalidatePath("/");
  return { id, ...data, ownerId: user.uid };
}

export async function deleteTransaction(id: string) {
  const user = await requireSessionUser();
  const current = await getNeonTransaction(id, user.uid);
  const accountId = String(current.accountId ?? "");
  const delta = accountDelta(String(current.type), Number(current.amount));
  const queries = [];
  const isCard = current.sourceType === "credit-card";
  if (!isCard && accountId && delta !== 0) {
    queries.push(sql`
      UPDATE mufinance.accounts
      SET balance = balance - ${delta}, updated_at = now()
      WHERE id = ${accountId} AND owner_uid = ${user.uid}
    `);
  }
  queries.push(sql`DELETE FROM mufinance.transactions WHERE id = ${id} AND owner_uid = ${user.uid}`);
  await sql.transaction(queries);

  revalidatePath("/");
  return { id, deleted: true };
}

export async function createCategory(input: unknown) {
  const user = await requireSessionUser();
  const data = categoryInputSchema.parse(input);
  const id = crypto.randomUUID();
  const payload = { ...data, isDefault: false, ownerId: user.uid, usage: 0 };
  await sql`
    INSERT INTO mufinance.categories
      (id, owner_uid, name, type, tone, active, is_default, usage)
    VALUES
      (${id}, ${user.uid}, ${data.name}, ${data.type}, ${data.tone}, ${data.active}, false, 0)
  `;
  revalidatePath("/");
  return { id, ...payload };
}

export async function updateCategory(id: string, input: unknown) {
  const user = await requireSessionUser();
  const data = categoryInputSchema.parse(input);
  const rows = await sql`
    SELECT is_default, usage FROM mufinance.categories
    WHERE id = ${id} AND owner_uid = ${user.uid}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Categoria não encontrada.");
  await sql`
    UPDATE mufinance.categories
    SET name = ${data.name}, type = ${data.type}, tone = ${data.tone},
        active = ${data.active}, updated_at = now()
    WHERE id = ${id} AND owner_uid = ${user.uid}
  `;
  revalidatePath("/");
  return { id, ...data, isDefault: Boolean(rows[0].is_default), usage: Number(rows[0].usage ?? 0), ownerId: user.uid };
}

export async function deleteCategory(id: string) {
  const user = await requireSessionUser();
  const rows = await sql`
    SELECT is_default FROM mufinance.categories
    WHERE id = ${id} AND owner_uid = ${user.uid}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Categoria não encontrada.");
  if (Boolean(rows[0].is_default)) throw new Error("Categorias padrão não podem ser excluídas. Você pode apenas renomeá-las (ex: Casa → Aluguel).");
  await sql`DELETE FROM mufinance.categories WHERE id = ${id} AND owner_uid = ${user.uid}`;
  revalidatePath("/");
  return { id, deleted: true };
}

export async function seedDefaultCategories() {
  const user = await requireSessionUser();
  const { defaultFinanceCategories } = await import("@/lib/financeData");
  const existing = await sql`
    SELECT type, name FROM mufinance.categories WHERE owner_uid = ${user.uid}
  `;
  const existingNames = new Set(existing.map((row) => `${String(row.type)}:${String(row.name).trim().toLowerCase()}`));
  let created = 0;
  const queries = [];
  for (const cat of defaultFinanceCategories) {
    const key = `${cat.type}:${cat.name.trim().toLowerCase()}`;
    if (!existingNames.has(key)) {
      const id = `${user.uid}:${cat.id}`;
      queries.push(sql`
        INSERT INTO mufinance.categories
          (id, owner_uid, name, type, tone, active, is_default, usage)
        VALUES
          (${id}, ${user.uid}, ${cat.name}, ${cat.type}, ${cat.tone}, ${cat.active}, true, 0)
        ON CONFLICT (id) DO NOTHING
      `);
      created++;
    }
  }
  if (queries.length > 0) await sql.transaction(queries);
  revalidatePath("/");
  return { created };
}

export async function createGoal(input: unknown) {
  const user = await requireSessionUser();
  const data = goalInputSchema.parse(input);
  const id = crypto.randomUUID();
  const payload = { ...data, ownerId: user.uid };
  await sql`
    INSERT INTO mufinance.goals
      (id, owner_uid, name, target_amount, current_amount, due_date, color, icon_name)
    VALUES
      (${id}, ${user.uid}, ${data.name}, ${data.targetAmount}, ${data.currentAmount}, ${data.dueDate ?? null}, ${data.color}, 'target')
  `;
  revalidatePath("/");
  return { id, ...payload };
}

export async function upsertBudget(input: unknown) {
  const user = await requireSessionUser();
  const data = budgetInputSchema.parse(input);
  const id = `${user.uid}_${data.month}_${data.categoryId}`;
  const payload = { ...data, ownerId: user.uid };
  await sql`
    INSERT INTO mufinance.budgets
      (id, owner_uid, month, category_id, limit_amount)
    VALUES
      (${id}, ${user.uid}, ${data.month}, ${data.categoryId}, ${data.limitAmount})
    ON CONFLICT (owner_uid, month, category_id)
    DO UPDATE SET limit_amount = EXCLUDED.limit_amount, updated_at = now()
  `;
  revalidatePath("/");
  return { id, ...payload };
}

export async function deleteAccount(id: string) {
  const user = await requireSessionUser();
  const account = await getNeonAccount(id, user.uid);
  const name = account.name.trim().toLowerCase();
  if (name === "carteira") throw new Error("A conta Carteira não pode ser excluída. Ela é obrigatória.");
  const [{ count }] = await sql`
    SELECT count(*)::int AS count FROM mufinance.accounts WHERE owner_uid = ${user.uid}
  `;
  if (Number(count) <= 1) throw new Error("Não é possível excluir a última conta. Mantenha ao menos a Carteira.");

  const [{ count: transactionCount }] = await sql`
    SELECT count(*)::int AS count FROM mufinance.transactions
    WHERE owner_uid = ${user.uid} AND account_id = ${id}
  `;
  if (Number(transactionCount) > 0) throw new Error("Esta conta possui transações. Apague ou mova as transações antes de excluir.");

  await sql`DELETE FROM mufinance.accounts WHERE id = ${id} AND owner_uid = ${user.uid}`;
  revalidatePath("/");
  return { id, deleted: true };
}

export async function keepOnlyOneCheckingAccount() {
  const user = await requireSessionUser();
  const uid = user.uid;
  const all = await sql`
    SELECT id, name, type, created_at
    FROM mufinance.accounts
    WHERE owner_uid = ${uid}
    ORDER BY created_at ASC, id ASC
  `;
  // Carteira sempre permanece (wallet)
  const carteira = all.find((row) => String(row.name ?? "").trim().toLowerCase() === "carteira" || String(row.type ?? "") === "wallet");
  const checking = all.filter((row) => String(row.type ?? "") === "checking" || String(row.type ?? "").toLowerCase().includes("corrente"));
  // Se não houver checking com type exato, trata qualquer não-Carteira como corrente
  const candidates = checking.length > 0 ? checking : all.filter((row) => row.id !== carteira?.id);
  if (candidates.length <= 1) return { success: true, kept: candidates[0]?.id ?? carteira?.id ?? null, deleted: 0, message: "Já há apenas 1 conta corrente." };

  // Mantém a mais antiga (createdAt) como padrão
  const sorted = [...candidates].sort((a, b) => String(a.created_at ?? a.id).localeCompare(String(b.created_at ?? b.id)));
  const keep = sorted[0];
  const toDelete = sorted.slice(1);

  // Mantém as transações vinculadas apontando para a conta preservada.
  for (const account of toDelete) {
    await sql`
      UPDATE mufinance.transactions
      SET account_id = ${keep.id}, updated_at = now()
      WHERE owner_uid = ${uid} AND account_id = ${account.id}
    `;
    await sql`
      DELETE FROM mufinance.accounts
      WHERE owner_uid = ${uid} AND id = ${account.id}
    `;
  }
  revalidatePath("/");
  return { success: true, kept: keep.id, keptName: String(keep.name ?? ""), deleted: toDelete.length, deletedIds: toDelete.map((row) => row.id) };
}

export async function deleteAllTransactions() {
  const user = await requireSessionUser();
  const [{ count }] = await sql`
    SELECT count(*)::int AS count FROM mufinance.transactions WHERE owner_uid = ${user.uid}
  `;
  await sql.transaction([
    sql`UPDATE mufinance.accounts SET balance = 0, updated_at = now() WHERE owner_uid = ${user.uid}`,
    sql`DELETE FROM mufinance.transactions WHERE owner_uid = ${user.uid}`,
  ]);

  revalidatePath("/");
  return { success: true, count: Number(count) };
}

export async function deleteAllData() {
  const user = await requireSessionUser();
  const uid = user.uid;
  const accounts = await sql`
    SELECT id, name, type, created_at
    FROM mufinance.accounts
    WHERE owner_uid = ${uid}
    ORDER BY CASE WHEN lower(name) = 'carteira' OR type = 'wallet' THEN 0 ELSE 1 END, created_at ASC
    LIMIT 1
  `;
  const keepId = String(accounts[0]?.id ?? `wallet-${uid}`);
  await sql.transaction([
    sql`DELETE FROM mufinance.transactions WHERE owner_uid = ${uid}`,
    sql`DELETE FROM mufinance.transfer_records WHERE owner_uid = ${uid}`,
    sql`DELETE FROM mufinance.internal_transfers WHERE sender_uid = ${uid} OR recipient_uid = ${uid}`,
    sql`DELETE FROM mufinance.credit_cards WHERE owner_uid = ${uid}`,
    sql`DELETE FROM mufinance.categories WHERE owner_uid = ${uid}`,
    sql`DELETE FROM mufinance.goals WHERE owner_uid = ${uid}`,
    sql`DELETE FROM mufinance.budgets WHERE owner_uid = ${uid}`,
    sql`DELETE FROM mufinance.accounts WHERE owner_uid = ${uid} AND id <> ${keepId}`,
    sql`INSERT INTO mufinance.accounts (id, owner_uid, name, institution, type, balance, currency, color, icon, internal_wallet)
        VALUES (${keepId}, ${uid}, 'Carteira', 'MuFinance', 'wallet', 0, 'BRL', 'mint', 'wallet', true)
        ON CONFLICT (id) DO UPDATE SET name = 'Carteira', type = 'wallet', balance = 0, internal_wallet = true, updated_at = now()`,
  ]);

  revalidatePath("/");
  return { success: true, deleted: true, keptAccount: keepId };
}

export async function markNotificationAsRead(id: string) {
  const user = await requireSessionUser();
  await sql`
    UPDATE mufinance.notifications
    SET read = true, updated_at = now()
    WHERE id = ${id} AND owner_uid = ${user.uid}
  `;
  revalidatePath("/");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await requireSessionUser();
  await sql`
    UPDATE mufinance.notifications
    SET read = true, updated_at = now()
    WHERE owner_uid = ${user.uid}
  `;
  revalidatePath("/");
  return { success: true };
}

export async function dismissNotification(id: string) {
  const user = await requireSessionUser();
  await sql`
    DELETE FROM mufinance.notifications
    WHERE id = ${id} AND owner_uid = ${user.uid}
  `;
  revalidatePath("/");
  return { success: true };
}

export async function respondToSharedExpense(input: {
  notificationId: string;
  action: "accept" | "decline";
  targetAccountId?: string;
}) {
  const user = await requireSessionUser();
  const rows = await sql`
    SELECT id, owner_uid, metadata, status
    FROM mufinance.notifications
    WHERE id = ${input.notificationId} AND owner_uid = ${user.uid}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Notificação não encontrada.");
  const notif = rows[0] as Record<string, unknown>;
  if (notif.status !== "pending") throw new Error("Esta solicitação já foi respondida.");

  if (input.action === "decline") {
    await sql`
      UPDATE mufinance.notifications
      SET status = 'declined', read = true, updated_at = now()
      WHERE id = ${input.notificationId} AND owner_uid = ${user.uid}
    `;
    revalidatePath("/");
    return { success: true, status: "declined" as const };
  }

  // Se aceitou, cria a transação de RECEITA na conta do usuário
  const meta = (notif.metadata as Record<string, unknown>) ?? {};
  const amount = Number(meta.amount ?? 0);
  if (amount <= 0) throw new Error("Valor inválido na solicitação.");

  let accountId = input.targetAccountId;
  if (!accountId) {
    const accRows = await sql`
      SELECT id FROM mufinance.accounts
      WHERE owner_uid = ${user.uid}
      ORDER BY CASE WHEN internal_wallet THEN 0 ELSE 1 END, created_at ASC
      LIMIT 1
    `;
    if (!accRows[0]) throw new Error("Nenhuma conta disponível para receber o valor.");
    accountId = String(accRows[0].id);
  }

  const txId = crypto.randomUUID();
  const date = meta.date ? String(meta.date) : new Date().toISOString().slice(0, 10);
  const senderLabel = meta.senderUsername ? `@${meta.senderUsername}` : (meta.senderName ? String(meta.senderName) : "Amigo");
  const payee = `Recebido de ${senderLabel} (${String(meta.payee ?? "Despesa dividida")})`;
  const notes = meta.notes ? `Referente a: ${meta.notes}` : `Despesa compartilhada por ${senderLabel}`;

  await sql.transaction([
    sql`UPDATE mufinance.accounts SET balance = balance + ${amount}, updated_at = now() WHERE id = ${accountId} AND owner_uid = ${user.uid}`,
    sql`INSERT INTO mufinance.transactions
      (id, owner_uid, account_id, date, payee, category, amount, type, status, notes, source_type)
      VALUES (${txId}, ${user.uid}, ${accountId}, ${date}, ${payee}, 'Transferência', ${amount}, 'income', 'completed', ${notes}, 'account')`,
    sql`UPDATE mufinance.notifications
      SET status = 'accepted', read = true, updated_at = now()
      WHERE id = ${input.notificationId} AND owner_uid = ${user.uid}`,
  ]);

  revalidatePath("/");
  return { success: true, status: "accepted" as const, transactionId: txId };
}
