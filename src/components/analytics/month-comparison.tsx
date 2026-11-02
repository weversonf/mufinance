"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useAnalyticsData } from "@/components/analytics/use-analytics-data"
import { formatMonthKey, useAnalyticsMonth } from "@/components/analytics/analytics-month"

const chartConfig = {
  thisMonth: {
    label: "Este mês",
    color: "var(--color-primary)",
  },
  lastMonth: {
    label: "Mês anterior",
    color: "var(--color-muted-foreground)",
  },
} satisfies ChartConfig

function ChangeLabel(props: Record<string, unknown> & { monthComparisons?: Array<{ thisMonth: number; lastMonth: number }> }) {
  const { x, y, width, height, index, monthComparisons = [] } = props as {
    x: number
    y: number
    width: number
    height: number
    index: number
    monthComparisons?: Array<{ thisMonth: number; lastMonth: number }>
  }
  const row = monthComparisons[index]
  if (!row || row.lastMonth === 0) return null
  const pct = Math.round(((row.thisMonth - row.lastMonth) / row.lastMonth) * 100)
  if (pct === 0) return null
  const isUp = pct > 0
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      textAnchor="start"
      dominantBaseline="middle"
      className={`text-[10px] font-medium tabular-nums ${isUp ? "fill-rose-500" : "fill-emerald-500"}`}
    >
      {isUp ? "+" : ""}
      {pct}%
    </text>
  )
}

export function MonthComparison() {
  const { monthComparisons } = useAnalyticsData()
  const { month } = useAnalyticsMonth()
  const totals = useMemo(() => {
    const thisMonth = monthComparisons.reduce((s, r) => s + r.thisMonth, 0)
    const lastMonth = monthComparisons.reduce((s, r) => s + r.lastMonth, 0)
    return { thisMonth, lastMonth }
  }, [monthComparisons])

  if (monthComparisons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo Mensal</CardTitle>
          <CardDescription>{formatMonthKey(month)} · comparação com o mês anterior</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <p className="text-sm font-medium text-foreground">Sem dados comparativos neste mês</p>
          <p className="text-xs mt-1">Conforme você acumular lançamentos nos meses, a comparação será calculada automaticamente.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Este mês vs. mês anterior</CardTitle>
            <CardDescription>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" />
                  {formatMonthKey(month)}{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totals.thisMonth)}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  Mês anterior{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totals.lastMonth)}
                  </span>
                </span>
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: Math.max(220, monthComparisons.length * 48 + 24) }}
        >
          <BarChart
            data={monthComparisons}
            layout="vertical"
            margin={{ top: 4, right: 56, bottom: 0, left: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--color-border)"
              strokeOpacity={0.5}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={8}
              stroke="var(--color-muted-foreground)"
              tickFormatter={(v: number) => `R$ ${v}`}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={8}
              width={96}
              stroke="var(--color-muted-foreground)"
              tickFormatter={(v: string) =>
                v.length > 13 ? v.slice(0, 12) + "…" : v
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
                  }
                />
              }
            />
            <Bar
              dataKey="lastMonth"
              fill="var(--color-muted-foreground)"
              fillOpacity={0.3}
              radius={[0, 4, 4, 0]}
              barSize={14}
              isAnimationActive={false}
            />
            <Bar
              dataKey="thisMonth"
              fill="var(--color-primary)"
              radius={[0, 4, 4, 0]}
              barSize={14}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="thisMonth"
                content={<ChangeLabel monthComparisons={monthComparisons} />}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
