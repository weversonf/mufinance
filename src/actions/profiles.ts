"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionUser, requireSessionUser } from "@/lib/auth/session"
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin"

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
  const snapshot = await getAdminFirestore().collection("profiles").doc(user.uid).get()
  const profile = snapshot.data()
  return {
    displayName: String(profile?.displayName ?? user.name ?? user.email?.split("@")[0] ?? ""),
    username: String(profile?.username ?? ""),
    email: String(user.email ?? ""),
    photoURL: String(profile?.photoURL ?? user.picture ?? ""),
  }
}

export async function saveMyProfile(input: unknown) {
  const user = await requireSessionUser()
  const data = profileSchema.parse(input)
  const db = getAdminFirestore()
  const profileRef = db.collection("profiles").doc(user.uid)
  const usernameRef = db.collection("usernames").doc(data.username)
  const walletRef = db.collection("accounts").doc(`wallet-${user.uid}`)
  const updatedAt = nowISO()

  await db.runTransaction(async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef)
    const previousUsername = String(profileSnapshot.data()?.username ?? "")
    const previousUsernameRef = previousUsername && previousUsername !== data.username
      ? db.collection("usernames").doc(previousUsername)
      : null
    const usernameSnapshot = await transaction.get(usernameRef)
    const previousUsernameSnapshot = previousUsernameRef ? await transaction.get(previousUsernameRef) : null
    const walletSnapshot = await transaction.get(walletRef)

    if (usernameSnapshot.exists && usernameSnapshot.data()?.uid !== user.uid) {
      throw new Error("Este @usuário já está em uso.")
    }

    if (previousUsernameRef && previousUsernameSnapshot?.data()?.uid === user.uid) {
      transaction.delete(previousUsernameRef)
    }

    const publicProfile = {
      uid: user.uid,
      username: data.username,
      displayName: data.displayName,
      photoURL: String(user.picture ?? ""),
      updatedAt,
    }
    transaction.set(usernameRef, publicProfile)
    transaction.set(profileRef, {
      ...publicProfile,
      ownerId: user.uid,
      email: String(user.email ?? ""),
    }, { merge: true })

    if (!walletSnapshot.exists) {
      transaction.set(walletRef, {
        ownerId: user.uid,
        name: "Saldo MuFinance",
        institution: "MuFinance",
        type: "wallet",
        balance: 0,
        currency: "BRL",
        color: "bg-primary",
        icon: "wallet",
        internalWallet: true,
        createdAt: updatedAt,
        updatedAt,
      })
    }
  })

  await getAdminAuth().updateUser(user.uid, { displayName: data.displayName })
  revalidatePath("/")
  return { displayName: data.displayName, username: data.username }
}

export async function findUserByUsername(input: unknown) {
  const user = await requireSessionUser()
  const username = usernameSchema.parse(input)
  const snapshot = await getAdminFirestore().collection("usernames").doc(username).get()
  if (!snapshot.exists) return null
  const data = snapshot.data()!
  return {
    username,
    displayName: String(data.displayName ?? `@${username}`),
    photoURL: String(data.photoURL ?? ""),
    isSelf: data.uid === user.uid,
  }
}

export async function createInternalTransfer(input: unknown) {
  const sender = await requireSessionUser()
  const data = transferSchema.parse(input)
  const db = getAdminFirestore()
  const usernameRef = db.collection("usernames").doc(data.recipientUsername)
  const senderAccountRef = db.collection("accounts").doc(data.sourceAccountId)
  const transferRef = db.collection("internalTransfers").doc(`${sender.uid}_${data.idempotencyKey}`)
  const senderProfileRef = db.collection("profiles").doc(sender.uid)
  const transferId = transferRef.id
  const createdAt = nowISO()

  const result = await db.runTransaction(async (transaction) => {
    const [recipientUsernameSnapshot, senderAccountSnapshot, existingTransfer, senderProfileSnapshot] = await transaction.getAll(usernameRef, senderAccountRef, transferRef, senderProfileRef)

    if (existingTransfer.exists) return existingTransfer.data()!
    if (!recipientUsernameSnapshot.exists) throw new Error("@usuário não encontrado.")

    const recipientData = recipientUsernameSnapshot.data()!
    const recipientUid = String(recipientData.uid ?? "")
    if (!recipientUid || recipientUid === sender.uid) throw new Error("Você não pode transferir para si mesmo.")
    if (!senderAccountSnapshot.exists || senderAccountSnapshot.data()?.ownerId !== sender.uid) {
      throw new Error("Conta de origem não encontrada.")
    }

    const recipientWalletRef = db.collection("accounts").doc(`wallet-${recipientUid}`)
    const recipientWalletSnapshot = await transaction.get(recipientWalletRef)
    if (!recipientWalletSnapshot.exists || recipientWalletSnapshot.data()?.ownerId !== recipientUid) {
      throw new Error("O destinatário ainda não ativou o saldo MuFinance.")
    }

    const senderBalance = numericAmount(senderAccountSnapshot.data()?.balance)
    const recipientBalance = numericAmount(recipientWalletSnapshot.data()?.balance)
    if (senderBalance < data.amount) throw new Error("Saldo insuficiente para esta transferência.")

    const senderName = String(senderProfileSnapshot.data()?.displayName ?? sender.name ?? sender.email?.split("@")[0] ?? "Usuário")
    const senderUsername = String(senderProfileSnapshot.data()?.username ?? "")
    const recipientName = String(recipientData.displayName ?? `@${data.recipientUsername}`)
    const date = createdAt.slice(0, 10)
    const common = {
      transferId,
      amount: Number(data.amount.toFixed(2)),
      note: data.note,
      senderUid: sender.uid,
      senderUsername,
      senderName,
      recipientUid,
      recipientUsername: data.recipientUsername,
      recipientName,
      createdAt,
      status: "completed",
    }

    transaction.update(senderAccountRef, {
      balance: Number((senderBalance - data.amount).toFixed(2)),
      updatedAt: createdAt,
    })
    transaction.update(recipientWalletRef, {
      balance: Number((recipientBalance + data.amount).toFixed(2)),
      updatedAt: createdAt,
    })
    transaction.set(transferRef, common)
    transaction.set(db.collection("transferRecords").doc(`${transferId}-sent`), {
      ...common,
      ownerId: sender.uid,
      direction: "sent",
      contactName: recipientName,
      contactUsername: data.recipientUsername,
    })
    transaction.set(db.collection("transferRecords").doc(`${transferId}-received`), {
      ...common,
      ownerId: recipientUid,
      direction: "received",
      contactName: senderName,
      contactUsername: senderUsername,
    })
    transaction.set(db.collection("transactions").doc(`${transferId}-out`), {
      ownerId: sender.uid,
      accountId: data.sourceAccountId,
      date,
      payee: `Transferência para @${data.recipientUsername}`,
      category: "Transferência",
      amount: data.amount,
      type: "expense",
      status: "completed",
      notes: data.note,
      sourceType: "internalTransfer",
      sourceId: transferId,
      createdAt,
      updatedAt: createdAt,
    })
    transaction.set(db.collection("transactions").doc(`${transferId}-in`), {
      ownerId: recipientUid,
      accountId: recipientWalletRef.id,
      date,
      payee: senderUsername ? `Recebido de @${senderUsername}` : `Recebido de ${senderName}`,
      category: "Transferência",
      amount: data.amount,
      type: "income",
      status: "completed",
      notes: data.note,
      sourceType: "internalTransfer",
      sourceId: transferId,
      createdAt,
      updatedAt: createdAt,
    })

    return common
  })

  revalidatePath("/")
  return {
    id: transferId,
    type: "sent" as const,
    contactName: String(result.recipientName ?? `@${data.recipientUsername}`),
    contactAvatar: "",
    amount: data.amount,
    date: createdAt,
    status: "completed" as const,
    note: data.note || undefined,
  }
}
