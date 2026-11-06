"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FullTransaction } from "@/data/seed"
import { CheckIcon, CopyIcon, TagIcon, CircleDollarSignIcon, ArrowDownLeftIcon, ArrowUpRightIcon, ClockIcon, SendIcon, WalletIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AmountCalculator } from "@/components/transactions/amount-calculator"
import { DateField } from "@/components/transactions/date-field"
import { SendToUserDialog } from "@/components/transactions/send-to-user-dialog"
import { useFinanceData } from "@/components/finance/finance-provider"
import { cn } from "@/lib/utils"

type EditableTransaction = Omit<FullTransaction, "status"> & { status: FullTransaction["status"] | "planned"; accountId?: string | null; sourceType?: "account" | "credit-card" | null; sourceId?: string | null; installmentGroupId?: string | null; installmentNumber?: number | null; installmentTotal?: number | null; invoiceId?: string | null; destinationAccountId?: string | null }

const fieldLabel = "grid gap-1.5 text-xs font-medium text-muted-foreground"
const inputClass = "h-11 sm:h-10"
const selectClass = "h-11 w-full rounded-lg border bg-background px-3 text-sm sm:h-10"

export function EditTransactionDialog({ transaction, accountId, allTransactions, open, onOpenChange, onSaved }: { transaction: EditableTransaction | null; accountId: string; allTransactions: Array<Record<string, unknown> & { id: string }>; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> | void }) {
  const { bankAccounts, cardsData, snapshot } = useFinanceData()
  const [payee, setPayee] = useState("")
  const [category, setCategory] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [date, setDate] = useState("")
  const [amount, setValor] = useState("0")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [status, setStatus] = useState<"planned" | "completed">("completed")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [scope, setScope] = useState<"one" | "series" | "selected">("one")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const candidates = !transaction?.installmentGroupId ? allTransactions.filter((item) => item.id !== transaction?.id && !item.installmentGroupId && item.payee === transaction?.merchant && item.category === transaction?.category && item.accountId === transaction?.accountId && item.type === transaction?.type && !item.destinationAccountId && (item.sourceType === "account" || !item.sourceType)) : []

  useEffect(() => {
    if (!transaction) return
    setPayee(transaction.merchant)
    setCategory(transaction.category)
    setSelectedAccountId(transaction.accountId || accountId || bankAccounts[0]?.id || "")
    setDate(transaction.date)
    setValor(String(Math.abs(transaction.amount)).replace(",", "."))
    setType(transaction.type === "income" ? "income" : "expense")
    setStatus(transaction.status === "pending" || String(transaction.status) === "planned" ? "planned" : "completed")
    setNotes(transaction.notes || "")
    setError("")
    setScope("one")
    setSelectedIds([])
    setCopied(false)
  }, [transaction, accountId, bankAccounts])

  const availableCategories = (snapshot?.categories ?? []).filter((c) => String(c.type) === type) as Array<Record<string, unknown> & { id: string; name: string }>
  const fallbackCategories = type === "income"
    ? ["Salário","Freelance","Investimentos","Reembolso","Vendas","Bônus","Presente","Aluguel Recebido","Outras receitas"]
    : ["Alimentação","Casa","Mercado","Transporte","Saúde","Educação","Lazer","Compras","Serviços","Assinaturas","Impostos e Taxas","Dívidas e Empréstimos","Roupas","Cuidados Pessoais","Família e Filhos","Presentes e Doações","Viagem","Bares e Restaurantes","Outros"]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!transaction) return
    setSaving(true)
    setError("")
    try {
      if (scope === "selected" && selectedIds.length === 0) throw new Error("Selecione ao menos outra transação para alterar.")
      const finalAccountId = selectedAccountId || transaction.accountId || accountId
      const isCard = cardsData.some((c) => c.id === finalAccountId)
      const response = await fetch(`/api/finance/transactions/${transaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          payee,
          category,
          accountId: finalAccountId,
          amount: Number(amount),
          type,
          status,
          sourceType: isCard ? "credit-card" : "account",
          sourceId: transaction.sourceId ?? undefined,
          invoiceId: transaction.invoiceId ?? undefined,
          destinationAccountId: transaction.destinationAccountId ?? undefined,
          installmentGroupId: transaction.installmentGroupId ?? undefined,
          installmentNumber: transaction.installmentNumber ?? undefined,
          installmentTotal: transaction.installmentTotal ?? undefined,
          notes: notes || undefined,
          scope,
          selectedIds,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar a transação.")
      await onSaved()
      onOpenChange(false)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível salvar a transação.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!transaction || !window.confirm(`Excluir a transação "${transaction.merchant}"? Esta ação não pode ser desfeita.`)) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/finance/transactions/${transaction.id}`, { method: "DELETE" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Não foi possível excluir a transação.")
      await onSaved()
      onOpenChange(false)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível excluir a transação.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:gap-5 sm:p-6">
        <DialogHeader className="gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <DialogTitle className="text-lg">Editar transação</DialogTitle>
            {transaction && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(transaction.id)
                          setCopied(true)
                        } catch {
                          setError("Não foi possível copiar o ID. Tente novamente.")
                        }
                      }}
                      aria-label="Copiar ID da transação"
                      className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  }
                >
                  <span className="truncate">ID {transaction.id}</span>
                  {copied ? <CheckIcon className="size-3.5 shrink-0" /> : <CopyIcon className="size-3.5 shrink-0" />}
                </TooltipTrigger>
                <TooltipContent className="break-all">{copied ? "ID copiado" : "Copiar ID completo"}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <DialogDescription>Atualize os dados do lançamento.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-6 sm:gap-x-4 sm:gap-y-5">
          {/* Ação rápida: Enviar para outro usuário */}
          {type === "expense" && (
            <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:col-span-6">
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <SendIcon className="size-3.5 text-primary" />
                  Enviar dinheiro para outro usuário (@)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Transformar este lançamento num envio real para a carteira de outro usuário MuFinance.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 h-8 text-xs font-semibold"
                onClick={() => setSendOpen(true)}
              >
                <SendIcon className="size-3" />
                Pagar / Transferir para @usuário
              </Button>
            </div>
          )}

          <label className={cn(fieldLabel, "col-span-2 sm:col-span-6")}>
            Descrição
            <Input value={payee} onChange={(event) => setPayee(event.target.value)} required className={inputClass} />
          </label>

          <label className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
            <span className="flex items-center gap-1.5"><TagIcon className="size-3.5" />Categoria</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className={selectClass}
            >
              {availableCategories.length > 0 ? (
                availableCategories.map((cat) => (
                  <option key={String(cat.id)} value={String(cat.name)}>
                    {String(cat.name)}
                  </option>
                ))
              ) : (
                fallbackCategories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))
              )}
              {/* Preserva a categoria atual caso seja personalizada */}
              {category && !availableCategories.some((c) => c.name === category) && !fallbackCategories.includes(category) && (
                <option value={category}>{category}</option>
              )}
            </select>
          </label>

          <label className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
            <span className="flex items-center gap-1.5"><WalletIcon className="size-3.5" />Conta / Cartão</span>
            <select
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              required
              className={selectClass}
            >
              <optgroup label="Contas Bancárias">
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (R$ {acc.balance.toFixed(2).replace(".", ",")})
                  </option>
                ))}
              </optgroup>
              {cardsData.length > 0 && (
                <optgroup label="Cartões de Crédito">
                  {cardsData.map((card) => (
                    <option key={card.id} value={card.id}>
                      Cartão •••• {card.last4} ({card.name})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>

          <label className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
            <span className="flex items-center gap-1.5"><CircleDollarSignIcon className="size-3.5" />Valor</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input type="number" step="0.01" min="0.01" value={amount} onChange={(event) => setValor(event.target.value)} required className={cn(inputClass, "pl-9 pr-10")} />
              <AmountCalculator value={amount} onApply={setValor} />
            </div>
          </label>

          <div className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
            Data
            <DateField value={date} onChange={setDate} />
          </div>

          <div className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
            <span className="flex items-center gap-1.5"><ClockIcon className="size-3.5" />Status</span>
            <button
              type="button"
              onClick={() => setStatus(status === "completed" ? "planned" : "completed")}
              aria-pressed={status === "planned"}
              className={cn(
                "flex h-11 items-center justify-center gap-1.5 rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-10",
                status === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              )}
            >
              <span className={cn("size-1.5 rounded-full", status === "completed" ? "bg-emerald-500" : "bg-amber-500")} />
              {status === "completed" ? "Concluída" : "Planejada"}
            </button>
          </div>

          <div className={cn(fieldLabel, "col-span-2 sm:col-span-2")}>
            Tipo
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Tipo da transação">
              {([
                { value: "expense", label: "Despesa", icon: ArrowUpRightIcon },
                { value: "income", label: "Entrada", icon: ArrowDownLeftIcon },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={type === option.value}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    type === option.value ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <option.icon className="size-4" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className={cn(fieldLabel, "col-span-2 sm:col-span-2")}>
            Observações
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opcional" className={inputClass} />
          </label>

          {transaction?.installmentGroupId?.startsWith("fixed_") && (
            <fieldset className="col-span-2 grid gap-2 rounded-xl border bg-muted/20 px-4 py-3 text-sm sm:col-span-6">
              <legend className="px-1 text-xs font-medium text-muted-foreground">Aplicar alterações a</legend>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex items-center gap-2"><input type="radio" name="scope" checked={scope === "one"} onChange={() => setScope("one")} className="accent-primary" /> Apenas esta</label>
                <label className="flex items-center gap-2"><input type="radio" name="scope" checked={scope === "series"} onChange={() => setScope("series")} className="accent-primary" /> Toda a série fixa</label>
              </div>
              <p className="text-xs text-muted-foreground">As datas e os status das outras ocorrências serão preservados.</p>
            </fieldset>
          )}

          {candidates.length > 0 && (
            <fieldset className="col-span-2 grid gap-2 rounded-xl border bg-muted/20 px-4 py-3 text-sm sm:col-span-6">
              <legend className="px-1 text-xs font-medium text-muted-foreground">Aplicar alterações a</legend>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex items-center gap-2"><input type="radio" name="scope" checked={scope === "one"} onChange={() => setScope("one")} className="accent-primary" /> Apenas esta</label>
                <label className="flex items-center gap-2"><input type="radio" name="scope" checked={scope === "selected"} onChange={() => setScope("selected")} className="accent-primary" /> Outras ocorrências</label>
              </div>
              {scope === "selected" && (
                <>
                  <p className="text-xs text-muted-foreground">Os lançamentos antigos não têm série identificada. Marque apenas os que pertencem à mesma recorrência. Datas e status serão preservados.</p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border bg-background p-2">
                    {candidates.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 py-1">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((ids) => event.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id))} className="accent-primary" />
                        <span>{String(item.date ?? "").split("-").reverse().join("/")} — {Number(item.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </label>
                    ))}
                  </div>
                  <button type="button" className="w-fit text-left text-xs underline" onClick={() => setSelectedIds(candidates.map((item) => item.id))}>Selecionar todas as ocorrências listadas</button>
                </>
              )}
            </fieldset>
          )}

          {error && <p className="col-span-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-6">{error}</p>}

          <DialogFooter className="col-span-2 mt-1 sm:col-span-6 sm:-mx-6 sm:-mb-6">
            <Button type="button" variant="destructive" className="sm:mr-auto" onClick={handleDelete} disabled={saving}>Excluir transação</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Aguarde..." : "Salvar alterações"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <SendToUserDialog
        transaction={transaction}
        open={sendOpen}
        onOpenChange={setSendOpen}
        onCompleted={async () => {
          await onSaved()
          onOpenChange(false)
        }}
      />
    </Dialog>
  )
}
