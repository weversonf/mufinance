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
  const [adjustmentMode, setAdjustmentMode] = useState<"transaction" | "initial">("transaction")
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
    setAdjustmentMode("transaction")
    setError("")
  }, [account])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!account) return
    setSaving(true)
    setError("")
    try {
      const payload = {
        name,
        type,
        balance: targetBalance,
        color: account.color || "mint",
        icon: "bank",
        currency: "BRL",
        createAdjustment: difference !== 0 && adjustmentMode === "transaction"
      }
      const response = await fetch(`/api/finance/accounts/${account.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar a conta.")
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
        
        {difference !== 0 && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Como registrar essa alteração de saldo?</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="adjustmentMode" checked={adjustmentMode === "transaction"} onChange={() => setAdjustmentMode("transaction")} className="accent-primary" />
                <span>Lançar como transação de ajuste</span>
              </label>
              {adjustmentMode === "transaction" && (
                <p className="ml-6 text-xs text-muted-foreground">Será criada uma {difference < 0 ? "despesa" : "entrada"} de <strong className="text-foreground">R$ {Math.abs(difference).toFixed(2).replace(".", ",")}</strong>.</p>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="adjustmentMode" checked={adjustmentMode === "initial"} onChange={() => setAdjustmentMode("initial")} className="accent-primary" />
                <span>Apenas alterar saldo (sem transação)</span>
              </label>
              {adjustmentMode === "initial" && (
                <p className="ml-6 text-xs text-muted-foreground">O saldo será alterado para <strong className="text-foreground">R$ {targetBalance.toFixed(2).replace(".", ",")}</strong> silenciosamente.</p>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
