"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2Icon, LoaderCircleIcon, SearchIcon, SendIcon } from "lucide-react"
import { createInternalTransfer, findUserByUsername } from "@/actions/profiles"
import { useFinanceData } from "@/components/finance/finance-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { localDateISO } from "@/lib/date"
import type { TransferRecord } from "@/data/seed"

type SendState = "idle" | "sending" | "success"
type Recipient = { username: string; displayName: string; photoURL: string; isSelf: boolean }

export function QuickSend({ onSend }: { onSend?: (record: TransferRecord) => void }) {
  const { contacts, bankAccounts, refresh, isDemoMode } = useFinanceData()
  const [username, setUsername] = useState("")
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const selectedAccountId = accountId || bankAccounts[0]?.id || ""
  const numericAmount = Number.parseFloat(amount.replace(",", "."))
  const canSend = Boolean(recipient && !recipient.isSelf && selectedAccountId) && Number.isFinite(numericAmount) && numericAmount > 0

  const demoUsers = useMemo(() => contacts.slice(0, 5).map((contact) => ({
    username: contact.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/)[0],
    displayName: contact.name,
    photoURL: contact.avatar,
    isSelf: false,
  })), [contacts])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  function selectRecipient(nextRecipient: Recipient) {
    setUsername(nextRecipient.username)
    setRecipient(nextRecipient)
    setError("")
  }

  async function handleSearch() {
    const normalized = username.trim().toLowerCase().replace(/^@+/, "")
    if (normalized.length < 3) {
      setError("Digite pelo menos 3 caracteres.")
      return
    }
    setSearching(true)
    setError("")
    setRecipient(null)
    try {
      const found = isDemoMode
        ? demoUsers.find((item) => item.username === normalized) ?? null
        : await findUserByUsername(normalized)
      if (!found) throw new Error("@usuário não encontrado.")
      if (found.isSelf) throw new Error("Você não pode transferir para si mesmo.")
      setRecipient(found)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível localizar o usuário.")
    } finally {
      setSearching(false)
    }
  }

  async function handleSend() {
    if (sendState !== "idle" || !canSend || !recipient) return
    setSendState("sending")
    setError("")
    try {
      if (isDemoMode) {
        onSend?.({
          id: `demo-transfer-${recipient.username}-${localDateISO()}`,
          type: "sent",
          contactName: recipient.displayName,
          contactAvatar: recipient.photoURL,
          amount: numericAmount,
          date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
          status: "completed",
          note: note || undefined,
        })
      } else {
        await createInternalTransfer({
          recipientUsername: recipient.username,
          sourceAccountId: selectedAccountId,
          amount: numericAmount,
          note,
          idempotencyKey: crypto.randomUUID(),
        })
        await refresh()
      }
      setSendState("success")
      timeoutRef.current = setTimeout(() => {
        setSendState("idle")
        setUsername("")
        setRecipient(null)
        setAmount("")
        setNote("")
      }, 2000)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível concluir a transferência.")
      setSendState("idle")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Transferir para @usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {sendState === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-2 py-5"
            >
              <CheckCircle2Icon className="size-10 text-emerald-500" />
              <p className="text-sm font-semibold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numericAmount)} enviado!
              </p>
              <p className="text-xs text-muted-foreground">Para @{recipient?.username}</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,0.8fr)]">
                <div className="space-y-1.5">
                  <label htmlFor="transfer-username" className="text-xs font-medium text-muted-foreground">Destinatário</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                      <Input
                        id="transfer-username"
                        value={username}
                        onChange={(event) => {
                          setUsername(event.target.value.toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9._]/g, ""))
                          setRecipient(null)
                        }}
                        onKeyDown={(event) => { if (event.key === "Enter") void handleSearch() }}
                        placeholder="usuario"
                        className="pl-8"
                        disabled={sendState === "sending"}
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={handleSearch} disabled={searching || username.length < 3} aria-label="Buscar usuário">
                      {searching ? <LoaderCircleIcon className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
                    </Button>
                  </div>
                </div>

                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  Conta de origem
                  <select
                    value={selectedAccountId}
                    onChange={(event) => setAccountId(event.target.value)}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground"
                    disabled={sendState === "sending" || bankAccounts.length === 0}
                  >
                    {bankAccounts.length === 0 && <option value="">Nenhuma conta disponível</option>}
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name} — {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(account.balance)}</option>
                    ))}
                  </select>
                </label>
              </div>

              {isDemoMode && demoUsers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Experimentar:</span>
                  {demoUsers.slice(0, 4).map((item) => (
                    <button key={item.username} type="button" onClick={() => selectRecipient(item)} className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted">
                      @{item.username}
                    </button>
                  ))}
                </div>
              )}

              {recipient && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <Avatar className="size-9">
                    <AvatarImage src={recipient.photoURL} alt={recipient.displayName} />
                    <AvatarFallback>{recipient.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{recipient.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{recipient.username}</p>
                  </div>
                  <CheckCircle2Icon className="ml-auto size-5 text-emerald-500" aria-label="Usuário verificado" />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-[minmax(140px,0.5fr)_1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <label htmlFor="transfer-amount" className="text-xs font-medium text-muted-foreground">Valor</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                    <Input id="transfer-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" className="pl-9" disabled={sendState === "sending"} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="transfer-note" className="text-xs font-medium text-muted-foreground">Observação <span className="font-normal">(opcional)</span></label>
                  <Input id="transfer-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} placeholder="Motivo da transferência" disabled={sendState === "sending"} />
                </div>
                <Button onClick={handleSend} disabled={sendState === "sending" || !canSend} className="gap-2">
                  {sendState === "sending" ? <LoaderCircleIcon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                  {sendState === "sending" ? "Enviando..." : "Enviar"}
                </Button>
              </div>

              {!isDemoMode && bankAccounts.length === 0 && <p className="text-xs text-muted-foreground">Crie seu @usuário no Perfil para ativar o Saldo MuFinance.</p>}
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
