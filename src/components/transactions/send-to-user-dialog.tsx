"use client"

import { useEffect, useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFinanceData } from "@/components/finance/finance-provider"
import { createInternalTransfer, listAllUsers } from "@/actions/profiles"
import { AtSignIcon, SendIcon, CheckCircle2Icon, Loader2Icon, WalletIcon } from "lucide-react"

type SendUser = {
  uid: string
  username: string
  displayName: string
  photoURL: string
  email: string
  isSelf: boolean
}

export function SendToUserDialog({
  transaction,
  open,
  onOpenChange,
  onCompleted,
}: {
  transaction: {
    id: string
    merchant: string
    amount: number
    date: string
    accountId?: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleted: () => Promise<void> | void
}) {
  const { bankAccounts, refresh } = useFinanceData()
  const [users, setUsers] = useState<SendUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [selectedUser, setSelectedUser] = useState<SendUser | null>(null)
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const parsedAmount = Math.abs(transaction?.amount ?? 0)
  const selectedAccountId = accountId || transaction?.accountId || bankAccounts[0]?.id || ""

  useEffect(() => {
    if (open && transaction) {
      setAmount(parsedAmount ? String(parsedAmount).replace(",", ".") : "")
      setAccountId(transaction.accountId || bankAccounts[0]?.id || "")
      setUsernameInput("")
      setSelectedUser(null)
      setError("")
      setSuccess(false)
      setSending(false)

      setLoadingUsers(true)
      listAllUsers()
        .then((data) => setUsers(data as SendUser[]))
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false))
    }
  }, [open, transaction, bankAccounts])

  // Filtragem ao digitar no campo
  const filteredUsers = useMemo(() => {
    const raw = usernameInput.trim().toLowerCase().replace(/^@+/, "")
    if (!usernameInput) {
      // Se não digitou nada ou acabou de focar, mostra todos (exceto ele mesmo)
      return users.filter((u) => !u.isSelf)
    }
    return users.filter(
      (u) =>
        !u.isSelf &&
        (u.username.toLowerCase().includes(raw) ||
          u.displayName.toLowerCase().includes(raw) ||
          u.email.toLowerCase().includes(raw))
    )
  }, [users, usernameInput])

  async function handleSend() {
    if (!transaction || !selectedUser) {
      setError("Selecione um usuário para enviar.")
      return
    }
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError("Informe um valor válido.")
      return
    }
    if (!selectedAccountId) {
      setError("Selecione uma conta de origem.")
      return
    }

    setSending(true)
    setError("")
    try {
      await createInternalTransfer({
        recipientUsername: selectedUser.username,
        sourceAccountId: selectedAccountId,
        amount: numAmount,
        note: `Referente a: ${transaction.merchant}`,
        idempotencyKey: crypto.randomUUID(),
        originalTransactionId: transaction.id,
      })

      setSuccess(true)
      await refresh()
      await onCompleted()
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar transferência.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SendIcon className="size-5 text-primary" />
            Enviar dinheiro para outro usuário
          </DialogTitle>
          <DialogDescription>
            Conclua o pagamento referente a <strong>"{transaction?.merchant}"</strong> enviando diretamente para a conta MuFinance dele.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2Icon className="size-8" />
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">Transferência realizada com sucesso!</p>
            <p className="text-xs text-muted-foreground">O valor foi creditado e a despesa marcada como concluída.</p>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            {/* Conta de Origem */}
            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <WalletIcon className="size-3.5" />
                Conta de saída
              </span>
              <select
                value={selectedAccountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Saldo: R$ {acc.balance.toFixed(2).replace(".", ",")}
                  </option>
                ))}
              </select>
            </label>

            {/* Valor */}
            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
              <span>Valor a enviar (R$)</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 font-semibold"
                placeholder="0,00"
              />
            </label>

            {/* Usuário Destinatário */}
            <div className="grid gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <AtSignIcon className="size-3.5 text-primary" />
                Destinatário (digite @ para filtrar ou escolha abaixo)
              </span>

              {selectedUser ? (
                <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarImage src={selectedUser.photoURL} />
                      <AvatarFallback className="text-xs font-bold uppercase">
                        {selectedUser.username.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedUser.displayName}</p>
                      <p className="text-xs text-primary font-medium">@{selectedUser.username}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSelectedUser(null)
                      setUsernameInput("")
                    }}
                  >
                    Trocar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Digite @ ou o nome do usuário..."
                    className="h-10"
                    autoFocus
                  />

                  {/* Lista de Usuários do Sistema */}
                  <div className="max-h-44 overflow-y-auto rounded-lg border bg-muted/20 p-1 divide-y divide-border/40">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                        <Loader2Icon className="size-3.5 animate-spin" /> Carregando usuários...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <p className="py-3 text-center text-xs text-muted-foreground">
                        Nenhum outro usuário encontrado.
                      </p>
                    ) : (
                      filteredUsers.map((u) => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u)
                            setUsernameInput(`@${u.username}`)
                          }}
                          className="flex w-full items-center gap-2.5 p-2 text-left rounded-md hover:bg-background transition-colors"
                        >
                          <Avatar className="size-7">
                            <AvatarImage src={u.photoURL} />
                            <AvatarFallback className="text-[10px] font-bold uppercase">
                              {u.username.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{u.displayName}</p>
                            <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-primary">Selecionar</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">{error}</p>
            )}
          </div>
        )}

        <DialogFooter className="mt-2">
          {!success && (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSend}
                disabled={sending || !selectedUser}
                className="gap-1.5"
              >
                {sending ? <Loader2Icon className="size-3.5 animate-spin" /> : <SendIcon className="size-3.5" />}
                {sending ? "Enviando..." : "Confirmar e Enviar"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
