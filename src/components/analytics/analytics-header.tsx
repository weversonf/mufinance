"use client"

import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon, TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatMonthKey, useAnalyticsMonth } from "@/components/analytics/analytics-month"
import { useAnalyticsData } from "@/components/analytics/use-analytics-data"
import { cn } from "@/lib/utils"

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function AnalyticsHeader() {
  const { month, currentMonth, previousMonth, nextMonth, resetToCurrentMonth } = useAnalyticsMonth()
  const { summary } = useAnalyticsData()

  const cards = [
    {
      label: "Receitas",
      value: summary.income,
      icon: TrendingUpIcon,
      className: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Despesas",
      value: summary.expense,
      icon: TrendingDownIcon,
      className: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Saldo do mês",
      value: summary.net,
      icon: WalletIcon,
      className: summary.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
    },
  ]

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Análises</p>
            <h1 className="text-xl font-semibold tracking-tight">{formatMonthKey(month)}</h1>
            <p className="text-xs text-muted-foreground">
              Todos os gráficos usam o mês selecionado.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={previousMonth} aria-label="Mês anterior">
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={resetToCurrentMonth}
              disabled={month === currentMonth}
            >
              <RotateCcwIcon className="size-3.5" />
              Mês atual
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Próximo mês">
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <card.icon className={cn("size-3.5", card.className)} />
                {card.label}
              </div>
              <p className={cn("mt-1 truncate text-sm font-semibold tabular-nums sm:text-base", card.className)}>
                {formatBRL(card.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
