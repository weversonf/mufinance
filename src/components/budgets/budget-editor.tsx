"use client"

import { useState } from "react"
import { seedDefaultCategories, upsertBudget } from "@/actions/finance"
import { useFinanceData } from "@/components/finance/finance-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function BudgetEditor() {
  const { snapshot, refresh } = useFinanceData()
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const categories = (snapshot?.categories ?? []).filter((category) => category.type === "expense" && category.active !== false)

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      await upsertBudget({ month, categoryId, limitAmount: Number(amount) })
      await refresh()
      setAmount("")
    } catch {
      setError("Não foi possível salvar o orçamento. Verifique sua sessão e tente novamente.")
    } finally { setBusy(false) }
  }

  async function seed() {
    setBusy(true)
    setError("")
    try { await seedDefaultCategories(); await refresh() }
    catch { setError("Não foi possível carregar as categorias.") }
    finally { setBusy(false) }
  }

  return <Card>
    <CardHeader><CardTitle className="text-base">Definir orçamento do mês</CardTitle></CardHeader>
    <CardContent>
      {categories.length === 0 ? <Button type="button" onClick={seed} disabled={busy}>Carregar categorias padrão</Button> :
        <form onSubmit={save} className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">Categoria
            <select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-9 min-w-48 rounded-md border bg-background px-3">
              <option value="">Selecione</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{String(category.name)}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Limite em R$
            <Input required type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <Button disabled={busy} type="submit">Salvar limite</Button>
        </form>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </CardContent>
  </Card>
}
