"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { BankAccount } from "@/data/seed"

type AccountType = "checking" | "savings" | "digital" | "investment" | "crypto" | "wallet"

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  digital: "Digital",
  investment: "Investimentos",
  crypto: "Criptomoedas",
  wallet: "Carteira",
}

export function EditAccountDialog({ account, open, onOpenChange, onSaved }: { account: BankAccount | null; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> | void }) {
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("checking")
  const [balance, setBalance] = useState("0")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const currentBalance = account?.balance ?? 0
  const targetBalance = Number(balance.replace(",", "."))
  const difference = Number.isFinite(targetBalance) ? targetBalance - currentBalance : 0

  useEffect(() => {
    if (!account) return
    setName(account.name)
    const t = account.type as AccountType
    setType(Object.keys(ACCOUNT_TYPE_LABELS).includes(t) ? t : "checking")
    setBalance(String(account.balance ?? 0).replace(",", "."))
    setError("")
  }, [account])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!account) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/finance/accounts/${account.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, type, balance: Number(balance), color: account.color || "mint", icon: "bank", currency: "BRL" }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar a conta.")
      await onSaved()
      onOpenChange(false)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível salvar a conta.")
    } finally {
      setSaving(false)
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Editar conta</DialogTitle><DialogDescription>Atualize os dados desta conta. A alteração será salva no Firestore.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="grid gap-1.5 text-sm font-medium">Nome<Input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Tipo de conta
          <select value={type} onChange={(event) => setType(event.target.value as AccountType)} className="h-9 rounded-md border bg-background px-3 text-sm">
            {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Saldo atual<Input type="number" step="0.01" value={balance} onChange={(event) => setBalance(event.target.value)} required /></label>
        {difference !== 0 && <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Este ajuste criará uma {difference < 0 ? "despesa" : "entrada"} de <strong className="text-foreground">R$ {Math.abs(difference).toFixed(2).replace(".", ",")}</strong>, categorizada como <strong className="text-foreground">Ajuste</strong>.</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
