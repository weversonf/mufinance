"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFinanceData } from "@/components/finance/finance-provider"
import { cn } from "@/lib/utils"

function localDateISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

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

  const availableCategories = (snapshot?.categories ?? []).filter((c) => String(c.type) === type) as Array<Record<string, unknown> & { id: string; name: string }>
  // Se ainda não houver categorias carregadas, mostra fallback Mobills-like mínimo
  const fallbackCategories = type === "income"
    ? ["Salário","Freelance","Investimentos","Reembolso","Vendas","Bônus","Presente","Aluguel Recebido","Outras receitas"]
    : ["Alimentação","Casa","Mercado","Transporte","Saúde","Educação","Lazer","Compras","Serviços","Assinaturas","Impostos e Taxas","Dívidas e Empréstimos","Roupas","Cuidados Pessoais","Família e Filhos","Presentes e Doações","Viagem","Bares e Restaurantes","Outros"]

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
    }
  }, [open, bankAccounts])

  const inputClass = "h-11 sm:h-9"
  const selectClass = "h-11 w-full rounded-md border bg-background px-3 text-sm sm:h-9"

  function handleTypeChange(next: "income" | "expense" | "transfer") {
    setType(next)
    if (next !== "transfer") {
      const nextCategories = (snapshot?.categories ?? []).filter((c) => String(c.type) === next)
      const first = nextCategories[0]?.name
      setCategory(first ? String(first) : next === "income" ? "Salário" : "Casa")
      setDestinationAccountId("")
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
      
      const promises = []
      const isCreditCard = cardsData.some(c => c.id === accountId)
      const installmentGroupId = isInstallment ? `inst_${Date.now()}_${Math.random().toString(36).slice(2,8)}` : undefined

      if (isInstallment) {
        if (currentInstallment < 1 || currentInstallment > installments) throw new Error(`Parcela atual deve ser entre 1 e ${installments}.`)
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
            amount: numericAmount,
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
            notes: notes || undefined
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
      onOpenChange(false)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível salvar a transação.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 p-0 pb-0 before:mt-2 sm:max-w-[720px]">
        <DialogHeader className="px-5 pb-3 pr-12 pt-2">
          <DialogTitle>Nova transação</DialogTitle>
          <DialogDescription>Adicione um novo lançamento manual.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-3 gap-y-3 px-5 pt-2 sm:gap-x-4 sm:gap-y-4">
          <label className="col-span-2 grid gap-1.5 text-sm font-medium">
            Descrição
            <Input value={payee} onChange={(event) => setPayee(event.target.value)} required placeholder="Ex: Mercado, Salário..." className={inputClass} />
          </label>

          <div className="col-span-2 grid gap-1.5">
            <span className="text-sm font-medium">Tipo</span>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Tipo de transação">
              {([
                { value: "expense", label: "Despesa" },
                { value: "income", label: "Entrada" },
                { value: "transfer", label: "Transferência" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                  aria-pressed={type === option.value}
                  className={cn(
                    "h-9 rounded-md px-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:text-sm",
                    type === option.value
                      ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-1.5 text-sm font-medium">
            Valor
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input type="number" inputMode="decimal" step="0.01" min="0.01" value={amount} onChange={(event) => setValor(event.target.value)} required placeholder="0,00" className={cn(inputClass, "pl-9")} />
            </div>
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Data
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className={inputClass} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Conta {type === "transfer" ? "de origem" : ""}
            <select value={accountId} onChange={(event) => setAccountId(event.target.value)} required className={selectClass}>
              <option value="" disabled>Selecione...</option>
              <optgroup label="Contas Bancárias">
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(acc.balance)})</option>
                ))}
              </optgroup>
              <optgroup label="Cartões de Crédito">
                {cardsData.map(card => (
                  <option key={card.id} value={card.id}>{card.name} (Crédito)</option>
                ))}
              </optgroup>
            </select>
          </label>

          {type === "transfer" ? (
            <label className="grid gap-1.5 text-sm font-medium">
              Conta de destino
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
            <label className="grid gap-1.5 text-sm font-medium">
              Categoria
              <select value={category} onChange={(event) => setCategory(event.target.value)} required className={selectClass}>
                {availableCategories.length > 0 ? availableCategories.map((cat) => (
                  <option key={String(cat.id)} value={String(cat.name)}>{String(cat.name)}{cat.isDefault ? " • padrão" : ""}</option>
                )) : fallbackCategories.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          )}

          <label className="grid gap-1.5 text-sm font-medium">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className={selectClass}>
              <option value="completed">Concluída</option>
              <option value="planned">Planejada</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Repetição
            <select value={recurrence} onChange={(event) => setRecurrence(event.target.value as typeof recurrence)} className={selectClass}>
              <option value="unica">Única</option>
              <option value="fixa">Fixa (mensal)</option>
              <option value="parcelada">Parcelada</option>
            </select>
          </label>

          {recurrence === "fixa" && (
            <label className="col-span-2 grid gap-1.5 text-sm font-medium">
              Gerar para quantos meses?
              <Input type="number" min="2" max="120" value={months} onChange={(e) => setMonths(Number(e.target.value))} className={inputClass} />
            </label>
          )}

          {recurrence === "parcelada" && (
            <div className="col-span-2 grid gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-medium">
                  Total de parcelas
                  <Input type="number" min="2" max="120" value={installments} onChange={(e) => {
                    const v = Number(e.target.value)
                    setInstallments(v)
                    if (currentInstallment > v) setCurrentInstallment(v)
                  }} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Estou na parcela
                  <Input type="number" min="1" max={installments} value={currentInstallment} onChange={(e) => setCurrentInstallment(Number(e.target.value))} className={inputClass} />
                </label>
              </div>
              {currentInstallment > 1 && (
                <label className="flex items-center gap-2 rounded-md border bg-background p-2 text-sm">
                  <input type="checkbox" checked={pastEffective} onChange={(e) => setPastEffective(e.target.checked)} className="accent-primary" />
                  <span>Parcelas anteriores ({currentInstallment - 1}) já estão efetivadas?</span>
                </label>
              )}
              <span className="text-[11px] leading-snug text-muted-foreground">
                O valor informado é o de cada parcela. Parcelas anteriores seguem a opção acima; as futuras ficam pendentes.
              </span>
            </div>
          )}

          <label className="col-span-2 grid gap-1.5 text-sm font-medium">
            <span>Observações <span className="text-xs font-normal text-muted-foreground">(opcional)</span></span>
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} />
          </label>

          {error && <p className="col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <DialogFooter className="sticky bottom-0 z-10 col-span-2 -mx-5 mb-0 mt-1 flex-row justify-end gap-2 rounded-none border-t bg-popover px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 flex-1 sm:h-9 sm:flex-none">Cancelar</Button>
            <Button type="submit" disabled={saving} className="h-10 flex-1 sm:h-9 sm:flex-none">
              {saving ? "Salvando..." : type === "income" ? "Adicionar entrada" : type === "transfer" ? "Transferir" : "Adicionar despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
