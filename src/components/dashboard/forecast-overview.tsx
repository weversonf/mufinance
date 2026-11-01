"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, type DotProps } from "recharts"
import { useFinanceData } from "@/components/finance/finance-provider"
import { usePrivacy } from "@/components/privacy-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const config = {
  income: { label: "Entradas", color: "var(--color-primary)" },
  expense: { label: "Despesas", color: "var(--color-muted-foreground)" },
} satisfies ChartConfig

function SquareDot({ cx, cy, fill, opacity = 1, size = 6 }: DotProps & { size?: number; opacity?: number }) {
  if (cx == null || cy == null) return null
  return <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} fill={fill} fillOpacity={opacity} rx={1} />
}

export function ForecastOverview() {
  const { snapshot } = useFinanceData()
  const { privacyMode } = usePrivacy()
  const data = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() + index - 1, 1)
      return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, month: new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(date), income: 0, expense: 0 }
    })
    const byMonth = new Map(months.map((month) => [month.key, month]))
    for (const tx of snapshot?.transactions ?? []) {
      if (tx.isSystemEntry || tx.destinationAccountId || tx.sourceType === "internalTransfer") continue
      if (tx.status !== "completed" && tx.status !== "planned" && tx.status !== "pending") continue
      const month = byMonth.get(String(tx.date ?? "").slice(0, 7))
      if (!month) continue
      const amount = Math.abs(Number(tx.amount) || 0)
      if (tx.type === "income") month.income += amount
      if (tx.type === "expense") month.expense += amount
    }
    return months
  }, [snapshot])

  return <Card>
    <CardHeader><CardTitle className="text-base font-semibold">Visão financeira prevista</CardTitle><div className="flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Entradas</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted-foreground/40" />Despesas</span></div><p className="text-xs text-muted-foreground">Lançamentos planejados e efetivados por mês. Não inclui saldo inicial nem transferências entre contas.</p></CardHeader>
    <CardContent>{privacyMode ? <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">Valores ocultos pelo modo privacidade.</div> : <ChartContainer config={config} className="h-[200px] w-full sm:h-[260px]"><AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}><defs><linearGradient id="fillForecastIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" strokeOpacity={0.5} /><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} stroke="var(--color-muted-foreground)" /><YAxis tickLine={false} axisLine={false} fontSize={12} tickMargin={8} stroke="var(--color-muted-foreground)" tickFormatter={(value) => new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL" }).format(value)} /><ChartTooltip content={<ChartTooltipContent formatter={(value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))} />} /><Area dataKey="expense" type="linear" stroke="var(--color-muted-foreground)" strokeOpacity={0.3} strokeWidth={1.5} fill="transparent" dot={<SquareDot fill="var(--color-muted-foreground)" opacity={0.3} size={5} />} /><Area dataKey="income" type="linear" stroke="var(--color-primary)" strokeWidth={2} fill="url(#fillForecastIncome)" dot={<SquareDot fill="var(--color-primary)" size={6} />} activeDot={<SquareDot fill="var(--color-primary)" size={9} />} /></AreaChart></ChartContainer>}</CardContent>
  </Card>
}
