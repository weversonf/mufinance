"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionUser, requireSessionUser } from "@/lib/auth/session"
import { getAdminAuth } from "@/lib/firebase/admin"
import { sql } from "@/lib/neon/db"

const usernameSchema = z.string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/^@+/, ""))
  .pipe(z.string()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres.")
    .max(24, "O nome de usuário deve ter no máximo 24 caracteres.")
    .regex(/^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/, "Use apenas letras minúsculas, números, ponto ou sublinhado."))

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Informe seu nome.").max(80),
  username: usernameSchema,
})

const transferSchema = z.object({
  recipientUsername: usernameSchema,
  sourceAccountId: z.string().trim().min(1, "Selecione uma conta de origem."),
  amount: z.coerce.number().positive("Informe um valor maior que zero.").max(1_000_000),
  note: z.string().trim().max(140).optional().default(""),
  idempotencyKey: z.string().trim().min(8).max(100).regex(/^[a-zA-Z0-9_-]+$/),
})

function nowISO() {
  return new Date().toISOString()
}

function numericAmount(value: unknown) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

export async function getMyProfile() {
  const user = await getSessionUser()
  if (!user) return null
  const rows = await sql`
    SELECT username, display_name, photo_url, email
    FROM mufinance.profiles
    WHERE uid = ${user.uid}
    LIMIT 1
  `
  const profile = rows[0] as Record<string, unknown> | undefined
  return {
    displayName: String(profile?.display_name ?? user.name ?? user.email?.split("@")[0] ?? ""),
    username: String(profile?.username ?? ""),
    email: String(user.email ?? ""),
    photoURL: String(profile?.photo_url ?? user.picture ?? ""),
  }
}

export async function saveMyProfile(input: unknown) {
  const user = await requireSessionUser()
  const data = profileSchema.parse(input)
  const existing = await sql`
    SELECT uid FROM mufinance.profiles
    WHERE username = ${data.username} AND uid <> ${user.uid}
    LIMIT 1
  `
  if (existing[0]) throw new Error("Este @usuário já está em uso.")

  await sql.transaction([
    sql`
      INSERT INTO mufinance.profiles (uid, username, display_name, photo_url, email)
      VALUES (${user.uid}, ${data.username}, ${data.displayName}, ${String(user.picture ?? "")}, ${String(user.email ?? "")})
      ON CONFLICT (uid) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        photo_url = EXCLUDED.photo_url,
        email = EXCLUDED.email,
        updated_at = now()
    `,
    sql`
      INSERT INTO mufinance.accounts
        (id, owner_uid, name, institution, type, balance, currency, color, icon, internal_wallet)
      VALUES
        (${`wallet-${user.uid}`}, ${user.uid}, 'Saldo MuFinance', 'MuFinance', 'wallet', 0, 'BRL', 'bg-primary', 'wallet', true)
      ON CONFLICT (id) DO NOTHING
    `,
  ])

  await getAdminAuth().updateUser(user.uid, { displayName: data.displayName })
  revalidatePath("/")
  return { displayName: data.displayName, username: data.username }
}

export async function findUserByUsername(input: unknown) {
  const user = await requireSessionUser()
  const username = usernameSchema.parse(input)
  const rows = await sql`
    SELECT uid, username, display_name, photo_url
    FROM mufinance.profiles
    WHERE username = ${username}
    LIMIT 1
  `
  if (!rows[0]) return null
  const data = rows[0] as Record<string, unknown>
  return {
    username,
    displayName: String(data.display_name ?? `@${username}`),
    photoURL: String(data.photo_url ?? ""),
    isSelf: data.uid === user.uid,
  }
}

export async function createInternalTransfer(input: unknown) {
  const sender = await requireSessionUser()
  const data = transferSchema.parse(input)
  const transferId = `${sender.uid}_${data.idempotencyKey}`
  const createdAt = nowISO()
  const existing = await sql`SELECT id FROM mufinance.internal_transfers WHERE id = ${transferId} LIMIT 1`
  if (existing[0]) {
    return { id: transferId, type: "sent" as const, contactName: `@${data.recipientUsername}`, contactAvatar: "", amount: data.amount, date: createdAt, status: "completed" as const, note: data.note || undefined }
  }

  const [recipientRows, senderAccountRows, recipientWalletRows, senderProfileRows] = await Promise.all([
    sql`SELECT uid, display_name, photo_url FROM mufinance.profiles WHERE username = ${data.recipientUsername} LIMIT 1`,
    sql`SELECT id, balance FROM mufinance.accounts WHERE id = ${data.sourceAccountId} AND owner_uid = ${sender.uid} LIMIT 1`,
    sql`SELECT id, balance FROM mufinance.accounts WHERE id = ${'wallet-' + String((await sql`SELECT uid FROM mufinance.profiles WHERE username = ${data.recipientUsername} LIMIT 1`)[0]?.uid ?? '')} LIMIT 1`,
    sql`SELECT username, display_name FROM mufinance.profiles WHERE uid = ${sender.uid} LIMIT 1`,
  ])
  if (!recipientRows[0]) throw new Error("@usuário não encontrado.")
  const recipientUid = String(recipientRows[0].uid)
  if (!recipientUid || recipientUid === sender.uid) throw new Error("Você não pode transferir para si mesmo.")
  if (!senderAccountRows[0]) throw new Error("Conta de origem não encontrada.")
  if (!recipientWalletRows[0]) throw new Error("O destinatário ainda não ativou o saldo MuFinance.")
  if (numericAmount(senderAccountRows[0].balance) < data.amount) throw new Error("Saldo insuficiente para esta transferência.")

  const senderName = String(senderProfileRows[0]?.display_name ?? sender.name ?? sender.email?.split("@")[0] ?? "Usuário")
  const senderUsername = String(senderProfileRows[0]?.username ?? "")
  const recipientName = String(recipientRows[0].display_name ?? `@${data.recipientUsername}`)
  const date = createdAt.slice(0, 10)
  await sql.transaction([
    sql`UPDATE mufinance.accounts SET balance = balance - ${data.amount}, updated_at = now() WHERE id = ${data.sourceAccountId} AND owner_uid = ${sender.uid}`,
    sql`UPDATE mufinance.accounts SET balance = balance + ${data.amount}, updated_at = now() WHERE id = ${recipientWalletRows[0].id} AND owner_uid = ${recipientUid}`,
    sql`INSERT INTO mufinance.internal_transfers (id, sender_uid, sender_username, sender_name, recipient_uid, recipient_username, recipient_name, amount, note, status)
        VALUES (${transferId}, ${sender.uid}, ${senderUsername}, ${senderName}, ${recipientUid}, ${data.recipientUsername}, ${recipientName}, ${data.amount}, ${data.note}, 'completed')`,
    sql`INSERT INTO mufinance.transfer_records (id, owner_uid, direction, transfer_id, amount, contact_name, contact_username, contact_avatar, note, status)
        VALUES (${transferId + '-sent'}, ${sender.uid}, 'sent', ${transferId}, ${data.amount}, ${recipientName}, ${data.recipientUsername}, ${recipientRows[0].photo_url ?? ''}, ${data.note}, 'completed')`,
    sql`INSERT INTO mufinance.transfer_records (id, owner_uid, direction, transfer_id, amount, contact_name, contact_username, contact_avatar, note, status)
        VALUES (${transferId + '-received'}, ${recipientUid}, 'received', ${transferId}, ${data.amount}, ${senderName}, ${senderUsername}, '', ${data.note}, 'completed')`,
    sql`INSERT INTO mufinance.transactions (id, owner_uid, account_id, date, payee, category, amount, type, status, notes, source_type, source_id)
        VALUES (${transferId + '-out'}, ${sender.uid}, ${data.sourceAccountId}, ${date}, ${`Transferência para @${data.recipientUsername}`}, 'Transferência', ${data.amount}, 'expense', 'completed', ${data.note}, 'internalTransfer', ${transferId})`,
    sql`INSERT INTO mufinance.transactions (id, owner_uid, account_id, date, payee, category, amount, type, status, notes, source_type, source_id)
        VALUES (${transferId + '-in'}, ${recipientUid}, ${recipientWalletRows[0].id}, ${date}, ${senderUsername ? `Recebido de @${senderUsername}` : `Recebido de ${senderName}`}, 'Transferência', ${data.amount}, 'income', 'completed', ${data.note}, 'internalTransfer', ${transferId})`,
  ])

  revalidatePath("/")
  return {
    id: transferId,
    type: "sent" as const,
    contactName: recipientName,
    contactAvatar: "",
    amount: data.amount,
    date: createdAt,
    status: "completed" as const,
    note: data.note || undefined,
  }
}
