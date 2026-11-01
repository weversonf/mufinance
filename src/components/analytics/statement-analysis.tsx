"use client"

import { useMemo, useState } from "react"
import { useFinanceData } from "@/components/finance/finance-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function StatementAnalysis() {
  const { snapshot } = useFinanceData()
  const [view, setView] = useState<"monthly" | "yearly">("monthly")
  const [year, setYear] = useState(new Date().getFullYear())
  const [status, setStatus] = useState<"all" | "planned" | "completed">("all")
  const data = useMemo(() => {
    const periods = view === "monthly"
      ? Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
      : Array.from({ length: 5 }, (_, i) => String(year - 4 + i))
    const income = new Map<string, number[]>()
    const expense = new Map<string, number[]>()
    const incomeTotals = periods.map(() => 0)
    const expenseTotals = periods.map(() => 0)
    for (const tx of snapshot?.transactions ?? []) {
      if (tx.isSystemEntry === true || (tx.type !== "income" && tx.type !== "expense")) continue
      if (status === "planned" && tx.status !== "planned" && tx.status !== "pending") continue
      if (status === "completed" && tx.status !== "completed") continue
      // Transferências entre contas não são receitas ou despesas reais.
      if (tx.destinationAccountId || tx.sourceType === "internalTransfer") continue
      const date = String(tx.date ?? "")
      const index = periods.indexOf(view === "monthly" ? date.slice(0, 7) : date.slice(0, 4))
      if (index < 0) continue
      const amount = Math.abs(Number(tx.amount) || 0)
      const name = String(tx.category || "Sem categoria")
      const rows = tx.type === "income" ? income : expense
      const totals = tx.type === "income" ? incomeTotals : expenseTotals
      const values = rows.get(name) ?? periods.map(() => 0)
      values[index] += amount
      totals[index] += amount
      rows.set(name, values)
    }
    const balance = periods.map((_, i) => incomeTotals[i] - expenseTotals[i])
    let accumulated = 0
    const cumulative = balance.map((value) => accumulated += value)
    return { periods, income, expense, incomeTotals, expenseTotals, balance, cumulative }
  }, [snapshot, view, year, status])

  function row(label: string, values: number[], style = "") {
    return <tr key={label} className={style}><th scope="row" className="sticky left-0 bg-card px-3 py-2 text-left font-medium">{label}</th>{values.map((value, index) => <td key={data.periods[index]} className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{value === 0 ? "—" : money(value)}</td>)}</tr>
  }

  return <Card>
    <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
      <CardTitle>Extrato analítico</CardTitle>
      <div className="flex items-center gap-2">
        <select aria-label="Situação dos lançamentos" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-9 rounded-md border bg-background px-2 text-sm"><option value="all">Todos</option><option value="planned">Planejado</option><option value="completed">Efetivado</option></select>
        <select aria-label="Período da análise" value={view} onChange={(event) => setView(event.target.value as "monthly" | "yearly")} className="h-9 rounded-md border bg-background px-2 text-sm"><option value="monthly">Mensal</option><option value="yearly">Anual</option></select>
        <label className="text-sm">Ano <input aria-label="Ano da análise" className="h-9 w-20 rounded-md border bg-background px-2" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label>
      </div>
    </CardHeader>
    <CardContent>
      <p className="mb-3 text-xs text-muted-foreground">Soma dos lançamentos por categoria e mês de competência. Selecione planejado, efetivado ou ambos. O acumulado começa em zero e não representa o saldo das contas.</p>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-b"><th className="sticky left-0 min-w-40 bg-card px-3 py-2 text-left">Categoria</th>{data.periods.map((period) => <th key={period} className="min-w-28 px-3 py-2 text-right">{view === "monthly" ? new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(new Date(year, Number(period.slice(5)) - 1, 1)) : period}</th>)}</tr></thead><tbody>
        {row("Receitas", data.incomeTotals, "border-b bg-emerald-500/10 font-semibold")}
        {[...data.income.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR")).map(([name, values]) => row(name, values))}
        {row("Despesas", data.expenseTotals, "border-y bg-red-500/10 font-semibold")}
        {[...data.expense.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR")).map(([name, values]) => row(name, values))}
        {row("Balanço", data.balance, "border-y bg-amber-500/10 font-semibold")}
        {row("Acumulado no período", data.cumulative, "bg-blue-500/10 font-semibold")}
      </tbody></table></div>
    </CardContent>
  </Card>
}
