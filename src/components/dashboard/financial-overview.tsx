"use client"

import { useMemo, useState } from "react"
import { useFinanceData } from "@/components/finance/finance-provider"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, type DotProps } from "recharts"

function SquareDot({ cx, cy, fill, opacity = 1, size = 6 }: DotProps & { size?: number; opacity?: number }) {
  if (cx == null || cy == null) return null
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      fill={fill}
      fillOpacity={opacity}
      rx={1}
    />
  )
}

const chartConfig = {
  currentYear: {
    label: "Período selecionado",
    color: "var(--color-primary)",
  },
  lastYear: {
    label: "Mesmo período anterior",
    color: "var(--color-muted-foreground)",
  },
} satisfies ChartConfig

// Map month names to month indices (0-based)
const monthIndex: Record<string, number> = {
  jan: 0, january: 0, janeiro: 0,
  feb: 1, february: 1, fevereiro: 1,
  mar: 2, march: 2, março: 2, marco: 2,
  apr: 3, april: 3, abril: 3,
  may: 4, maio: 4,
  jun: 5, june: 5, junho: 5,
  jul: 6, july: 6, julho: 6,
  aug: 7, august: 7, agosto: 7,
  sep: 8, sept: 8, september: 8, setembro: 8,
  oct: 9, october: 9, outubro: 9,
  nov: 10, november: 10, novembro: 10,
  dec: 11, december: 11, dezembro: 11,
}

const ptMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

type Period = "current" | "previous" | "quarter-forward" | "quarter-backward"

const periodOptions = [
  { value: "current", label: "Mês atual" },
  { value: "previous", label: "Mês passado" },
  { value: "quarter-forward", label: "Trimestre +" },
  { value: "quarter-backward", label: "Trimestre -" },
] as const

const periodOffsets: Record<Period, number[]> = {
  current: [0],
  previous: [-1],
  "quarter-forward": [0, 1, 2],
  "quarter-backward": [-2, -1, 0],
}

export function FinancialOverview() {
  const { financialOverview } = useFinanceData()
  const [period, setPeriod] = useState<Period>("current")
  const [today] = useState(() => new Date())

  const filteredData = useMemo(() => {
    const sourceByMonth = new Map(financialOverview.map((item) => [
      monthIndex[item.month.trim().toLowerCase().replace(".", "")],
      item,
    ]))
    const referenceYear = today.getFullYear()

    return periodOffsets[period].map((offset) => {
      const target = new Date(referenceYear, today.getMonth() + offset, 1)
      const source = sourceByMonth.get(target.getMonth())
      let currentYear = 0
      let lastYear = 0

      if (source) {
        if (target.getFullYear() === referenceYear) {
          currentYear = source.currentYear
          lastYear = source.lastYear
        } else if (target.getFullYear() === referenceYear + 1) {
          lastYear = source.currentYear
        } else if (target.getFullYear() === referenceYear - 1) {
          currentYear = source.lastYear
        }
      }

      return {
        month: `${ptMonths[target.getMonth()]}/${String(target.getFullYear()).slice(-2)}`,
        currentYear,
        lastYear,
      }
    })
  }, [financialOverview, period, today])

  const totals = useMemo(() => {
    const current = filteredData.reduce((s, d) => s + d.currentYear, 0)
    const last = filteredData.reduce((s, d) => s + d.lastYear, 0)
    return { current, last }
  }, [filteredData])

  const hasData = useMemo(
    () => filteredData.some((d) => d.currentYear !== 0 || d.lastYear !== 0),
    [filteredData],
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            Visão financeira
          </CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              Período {""}
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totals.current)}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              Mesmo período anterior {""}
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totals.last)}
              </span>
            </span>
          </div>
        </div>
        <Select
          items={periodOptions.map((option) => ({ ...option }))}
          value={period}
          onValueChange={(value) => value && setPeriod(value as Period)}
        >
          <SelectTrigger className="h-8 w-full text-xs sm:w-[160px]" aria-label="Período da visão financeira">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="flex h-[180px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/80 bg-muted/20 text-center sm:h-[220px]">
            <p className="text-sm font-medium">Sem movimentações no período</p>
            <p className="text-xs text-muted-foreground">
              Adicione lançamentos para ver a evolução.
            </p>
          </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full sm:h-[260px]">
          <AreaChart
            data={filteredData}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="fillAtual" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              stroke="var(--color-muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              stroke="var(--color-muted-foreground)"
              tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL" }).format(v)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => label}
                  formatter={(value) =>
                    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
                  }
                />
              }
            />
            <Area
              dataKey="lastYear"
              type="linear"
              stroke="var(--color-muted-foreground)"
              strokeOpacity={0.3}
              strokeWidth={1.5}
              fill="transparent"
              dot={<SquareDot fill="var(--color-muted-foreground)" opacity={0.3} size={5} />}
            />
            <Area
              dataKey="currentYear"
              type="linear"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#fillAtual)"
              dot={<SquareDot fill="var(--color-primary)" size={6} />}
              activeDot={<SquareDot fill="var(--color-primary)" size={9} />}
            />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
