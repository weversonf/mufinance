"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FullTransaction } from "@/data/seed"

type EditableTransaction = FullTransaction & { accountId?: string; sourceType?: "account" | "credit-card"; sourceId?: string }

export function EditTransactionDialog({ transaction, accountId, open, onOpenChange, onSaved }: { transaction: EditableTransaction | null; accountId: string; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> | void }) {
  const [payee, setPayee] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [amount, setAmount] = useState("0")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [status, setStatus] = useState<"planned" | "completed">("completed")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!transaction) return
    setPayee(transaction.merchant)
    setCategory(transaction.category)
    setDate(transaction.date)
    setAmount(String(Math.abs(transaction.amount)).replace(",", "."))
    setType(transaction.type === "income" ? "income" : "expense")
    setStatus(transaction.status === "pending" ? "planned" : "completed")
    setNotes(transaction.notes || "")
    setError("")
  }, [transaction])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!transaction) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/finance/transactions/${transaction.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, payee, category, accountId: transaction.accountId || accountId, amount: Number(amount), type, status, sourceType: transaction.sourceType || "account", sourceId: transaction.sourceId, notes: notes || undefined }) })
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

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Editar transação</DialogTitle><DialogDescription>Atualize o lançamento e salve a alteração no Firestore.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Descrição<Input value={payee} onChange={(event) => setPayee(event.target.value)} required /></label>
        <label className="grid gap-1.5 text-sm font-medium">Categoria<Input value={category} onChange={(event) => setCategory(event.target.value)} required /></label>
        <label className="grid gap-1.5 text-sm font-medium">Valor<Input type="number" step="0.01" min="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
        <label className="grid gap-1.5 text-sm font-medium">Data<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label className="grid gap-1.5 text-sm font-medium">Tipo<select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="expense">Despesa</option><option value="income">Entrada</option></select></label>
        <label className="grid gap-1.5 text-sm font-medium">Status<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="completed">Concluída</option><option value="planned">Planejada</option></select></label>
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Observações<Input value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
