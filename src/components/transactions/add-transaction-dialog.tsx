"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFinanceData } from "@/components/finance/finance-provider"
import { cn } from "@/lib/utils"
import { localDateISO } from "@/lib/date"
import { AmountCalculator } from "@/components/transactions/amount-calculator"
import { DateField } from "@/components/transactions/date-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowDownLeftIcon, ArrowUpRightIcon, ArrowLeftRightIcon, WalletCardsIcon, TagIcon, CircleDollarSignIcon, ClockIcon, RepeatIcon, InfoIcon } from "lucide-react"

const fieldLabel = "grid gap-1.5 text-xs font-medium text-muted-foreground"
const inputClass = "h-11 sm:h-10"
const selectClass = "h-11 w-full rounded-lg border bg-background px-3 text-sm sm:h-10"

export function AddTransactionDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> | void }) {
  const { bankAccounts, cardsData, snapshot } = useFinanceData()
  const [payee, setPayee] = useState("")
  const [category, setCategory] = useState("Geral")
  const [date, setDate] = useState(() => localDateISO())
  const [amount, setValor] = useState("")
  const [type, setType] = useState<"income" | "expense" | "transfer">("expense")
  const [accountId, setAccountId] = useState("")
  const [destinationAccountId, setDestinationAccountId] = useState("")
  const [status, setStatus] = useState<"planned" | "completed">("completed")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const [recurrence, setRecurrence] = useState<"unica" | "parcelada" | "fixa">("unica")
  const [installments, setInstallments] = useState(4)
  const [currentInstallment, setCurrentInstallment] = useState(1)
  const [pastEffective, setPastEffective] = useState(true)
  const [months, setMonths] = useState(12)
  const [installmentValueMode, setInstallmentValueMode] = useState<"total" | "each">("each")

  const availableCategories = (snapshot?.categories ?? []).filter((c) => String(c.type) === type) as Array<Record<string, unknown> & { id: string; name: string }>
  const fallbackCategories = type === "income"
    ? ["Salário","Freelance","Investimentos","Reembolso","Vendas","Bônus","Presente","Aluguel Recebido","Outras receitas"]
    : ["Alimentação","Casa","Mercado","Transporte","Saúde","Educação","Lazer","Compras","Serviços","Assinaturas","Impostos e Taxas","Dívidas e Empréstimos","Roupas","Cuidados Pessoais","Família e Filhos","Presentes e Doações","Viagem","Bares e Restaurantes","Outros"]

  const brl = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  const selectedAccount = bankAccounts.find((account) => account.id === accountId)
  const selectedCard = cardsData.find((card) => card.id === accountId)
  const balanceInfo = selectedAccount
    ? `Saldo atual: ${brl(selectedAccount.balance)}`
    : selectedCard
      ? `Fatura atual: ${brl(selectedCard.monthlySpend)} de ${brl(selectedCard.monthlyLimit)}`
      : "Selecione uma conta para ver o saldo."

  useEffect(() => {
    if (open) {
      setPayee("")
      setCategory("Casa")
      setDate(localDateISO())
      setValor("")
      setType("expense")
      setAccountId(bankAccounts[0]?.id || "")
      setDestinationAccountId("")
      setStatus("completed")
      setNotes("")
      setError("")
      setRecurrence("unica")
      setInstallments(4)
      setCurrentInstallment(1)
      setPastEffective(true)
      setMonths(12)
      setInstallmentValueMode("each")
    }
  }, [open, bankAccounts])

  function handleTypeChange(next: "income" | "expense" | "transfer") {
    setType(next)
    if (next !== "transfer") {
      const nextCategories = (snapshot?.categories ?? []).filter((c) => String(c.type) === next)
      const first = nextCategories[0]?.name
      setCategory(first ? String(first) : next === "income" ? "Salário" : "Casa")
      setDestinationAccountId("")
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === "another"
    setSaving(true)
    setError("")
    try {
      const numericAmount = Number(amount.replace(",", "."))
      if (isNaN(numericAmount) || numericAmount <= 0) throw new Error("Valor inválido.")
      if (!accountId) throw new Error("Selecione uma conta.")
      if (type === "transfer" && (!destinationAccountId || accountId === destinationAccountId)) throw new Error("Selecione uma conta de destino diferente da origem.")

      const isInstallment = recurrence === "parcelada"
      const isFixed = recurrence === "fixa"
      const count = isInstallment ? installments : isFixed ? months : 1
      if ((isInstallment || isFixed) && (!Number.isInteger(count) || count < 2 || count > 120)) throw new Error("Escolha uma quantidade entre 2 e 120.")

      const promises = []
      const isCreditCard = cardsData.some(c => c.id === accountId)
      const installmentGroupId = isInstallment || isFixed ? `${isFixed ? "fixed" : "inst"}_${crypto.randomUUID()}` : undefined

      if (isInstallment) {
        if (currentInstallment < 1 || currentInstallment > installments) throw new Error(`Parcela atual deve ser entre 1 e ${installments}.`)
        const cents = Math.round(numericAmount * 100)
        if (installmentValueMode === "total" && cents < count) throw new Error("O valor total deve permitir pelo menos R$ 0,01 por parcela.")
        const baseDate = new Date(date + "T00:00:00")
        for (let i = 0; i < count; i++) {
          const offset = i - (currentInstallment - 1)
          const d = new Date(baseDate)
          d.setMonth(d.getMonth() + offset)
          const formattedDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          const title = `${payee} (${i + 1}/${count})`
          let parcelStatus: "planned" | "completed"
          if (i < currentInstallment - 1) parcelStatus = pastEffective ? "completed" : "planned"
          else if (i === currentInstallment - 1) parcelStatus = status
          else parcelStatus = "planned"

          const payload = {
            date: formattedDate,
            payee: title,
            category,
            accountId,
            destinationAccountId: type === "transfer" ? destinationAccountId : undefined,
            amount: installmentValueMode === "total" ? (Math.floor(cents / count) + (i < cents % count ? 1 : 0)) / 100 : numericAmount,
            type,
            status: parcelStatus,
            sourceType: isCreditCard ? "credit-card" : "account",
            notes: notes || undefined,
            installmentNumber: i + 1,
            installmentTotal: count,
            installmentGroupId,
          }
          promises.push(fetch(`/api/finance/transactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }))
        }
      } else {
        const currentDate = new Date(date)
        for (let i = 0; i < count; i++) {
          const year = currentDate.getUTCFullYear()
          const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
          const day = String(currentDate.getUTCDate()).padStart(2, '0')
          const formattedDate = `${year}-${month}-${day}`
          const title = payee
          const payload = {
            date: formattedDate,
            payee: title,
            category,
            accountId,
            destinationAccountId: type === "transfer" ? destinationAccountId : undefined,
            amount: numericAmount,
            type,
            status: i === 0 ? status : "planned",
            sourceType: isCreditCard ? "credit-card" : "account",
            notes: notes || undefined,
            installmentGroupId,
          }
          promises.push(fetch(`/api/finance/transactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }))
          currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
        }
      }

      const responses = await Promise.all(promises)
      for (const res of responses) {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Não foi possível salvar todas as transações.")
        }
      }

      await onSaved()
      if (addAnother) {
        setPayee("")
        setCategory("Casa")
        setDate(localDateISO())
        setValor("")
        setType("expense")
        setAccountId(bankAccounts[0]?.id || "")
        setDestinationAccountId("")
        setStatus("completed")
        setNotes("")
        setRecurrence("unica")
        setInstallments(4)
        setCurrentInstallment(1)
        setPastEffective(true)
        setMonths(12)
        setInstallmentValueMode("each")
      } else {
        onOpenChange(false)
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível salvar a transação.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-h-[92dvh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:gap-5 sm:p-6">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-lg">Nova transação</DialogTitle>
          <DialogDescription>Registre um novo lançamento.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-6 sm:gap-x-4 sm:gap-y-5">
          <label className={cn(fieldLabel, "col-span-2 sm:col-span-6")}>
            Descrição
            <Input value={payee} onChange={(event) => setPayee(event.target.value)} required placeholder="Ex: Mercado, Salário..." className={inputClass} />
          </label>

          {type === "transfer" ? (
            <label className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
              <span className="flex items-center gap-1.5"><WalletCardsIcon className="size-3.5" />Conta de destino</span>
              <select value={destinationAccountId} onChange={(event) => setDestinationAccountId(event.target.value)} required className={selectClass}>
                <option value="" disabled>Selecione...</option>
                <optgroup label="Contas Bancárias">
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>{acc.name}</option>
                  ))}
                </optgroup>
              </select>
            </label>
          ) : (
            <label className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
              <span className="flex items-center gap-1.5"><TagIcon className="size-3.5" />Categoria</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} required className={selectClass}>
                {availableCategories.length > 0 ? availableCategories.map((cat) => (
                  <option key={String(cat.id)} value={String(cat.name)}>{String(cat.name)}{cat.isDefault ? " • padrão" : ""}</option>
                )) : fallbackCategories.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          )}

          <label className={cn(fieldLabel, "col-span-1 sm:col-span-2")}>
            <span className="flex items-center gap-1.5"><CircleDollarSignIcon className="size-3.5" />Valor</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input type="number" inputMode="decimal" step="0.01" min="0.01" value={amount} onChange={(event) => setValor(event.target.value)} required placeholder="0,00" className={cn(inputClass, "pl-9 pr-10")} />
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
                "flex h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-10",
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
            <div className="flex items-center gap-1.5">
              <WalletCardsIcon className="size-3.5" />
              <label htmlFor="transaction-account">Conta {type === "transfer" ? "de origem" : ""}</label>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Ver saldo atual da conta"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  }
                >
                  <InfoIcon className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>{balanceInfo}</TooltipContent>
              </Tooltip>
            </div>
            <select id="transaction-account" value={accountId} onChange={(event) => setAccountId(event.target.value)} required className={selectClass}>
              <option value="" disabled>Selecione...</option>
              <optgroup label="Contas Bancárias">
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </optgroup>
              <optgroup label="Cartões de Crédito">
                {cardsData.map(card => (
                  <option key={card.id} value={card.id}>{card.name} (Crédito)</option>
                ))}
              </optgroup>
            </select>
          </div>

          <label className={cn(fieldLabel, "col-span-2 sm:col-span-2")}>
            <span className="flex items-center gap-1.5"><RepeatIcon className="size-3.5" />Repetição</span>
            <select value={recurrence} onChange={(event) => setRecurrence(event.target.value as typeof recurrence)} className={selectClass}>
              <option value="unica">Única</option>
              <option value="fixa">Fixa (mensal)</option>
              <option value="parcelada">Parcelada</option>
            </select>
          </label>

          <div className={cn(fieldLabel, "col-span-2 sm:col-span-6")}>
            Tipo
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Tipo de transação">
              {([
                { value: "expense", label: "Despesa", icon: ArrowUpRightIcon },
                { value: "income", label: "Entrada", icon: ArrowDownLeftIcon },
                { value: "transfer", label: "Transferência", icon: ArrowLeftRightIcon },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                  aria-pressed={type === option.value}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    type === option.value ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <option.icon className="size-4 shrink-0" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {recurrence === "fixa" && (
            <div className="col-span-2 flex flex-wrap items-end justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3 sm:col-span-6">
              <div className="min-w-0">
                <p className="text-sm font-medium">Recorrência mensal</p>
                <p className="text-xs text-muted-foreground">O valor será lançado a cada mês.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Repetir por
                <Input type="number" min="2" max="120" required value={months} onChange={(e) => setMonths(Number(e.target.value))} className="h-10 w-20" />
                meses
              </label>
            </div>
          )}

          {recurrence === "parcelada" && (
            <div className="col-span-2 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:col-span-6">
              <div className="grid gap-2">
                <span className="text-xs font-medium text-muted-foreground">Como informar o valor?</span>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Como informar o valor">
                  {([
                    { value: "total", label: "Valor total" },
                    { value: "each", label: "Valor da parcela" },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setInstallmentValueMode(option.value)}
                      aria-pressed={installmentValueMode === option.value}
                      className={cn(
                        "h-9 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        installmentValueMode === option.value ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className={fieldLabel}>
                  Total de parcelas
                  <Input type="number" min="2" max="120" value={installments} onChange={(e) => {
                    const v = Number(e.target.value)
                    setInstallments(v)
                    if (currentInstallment > v) setCurrentInstallment(v)
                  }} className={inputClass} />
                </label>
                <label className={fieldLabel}>
                  Estou na parcela
                  <Input type="number" min="1" max={installments} value={currentInstallment} onChange={(e) => setCurrentInstallment(Number(e.target.value))} className={inputClass} />
                </label>
              </div>

              {currentInstallment > 1 && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={pastEffective} onChange={(e) => setPastEffective(e.target.checked)} className="accent-primary" />
                  <span>Parcelas anteriores ({currentInstallment - 1}) já estão efetivadas</span>
                </label>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                {installmentValueMode === "total" ? "O total será dividido entre as parcelas; a diferença de centavos será distribuída." : "O valor informado será aplicado em cada parcela."} As futuras ficam planejadas.
              </p>
            </div>
          )}

          <label className={cn(fieldLabel, "col-span-2 sm:col-span-6")}>
            Observações
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opcional" className={inputClass} />
          </label>

          {error && <p className="col-span-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-6">{error}</p>}

          <DialogFooter className="col-span-2 mt-1 sm:col-span-6 sm:-mx-6 sm:-mb-6">
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)} className="h-11 sm:h-10">Cancelar</Button>
            <Button type="submit" name="action" value="another" variant="outline" disabled={saving} className="h-11 sm:h-10">Lançar e adicionar outra</Button>
            <Button type="submit" name="action" value="close" disabled={saving} className="h-11 sm:h-10">{saving ? "Salvando..." : "Lançar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
