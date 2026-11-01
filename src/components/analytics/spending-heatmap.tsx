"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EmptyState } from "@/components/empty-state"
import { formatMonthKey, useAnalyticsMonth } from "@/components/analytics/analytics-month"
import { useAnalyticsData } from "@/components/analytics/use-analytics-data"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function intensityClass(amount: number, max: number) {
  if (amount === 0) return "bg-muted/40"
  const ratio = amount / max
  if (ratio < 0.2) return "bg-primary/10"
  if (ratio < 0.4) return "bg-primary/25"
  if (ratio < 0.65) return "bg-primary/45"
  return "bg-primary/70"
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function SpendingHeatmap() {
  const { month } = useAnalyticsMonth()
  const { dailySpending } = useAnalyticsData()

  const calendar = React.useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number)
    const firstDay = new Date(year, (monthNumber ?? 1) - 1, 1)
    const daysInMonth = new Date(year, monthNumber ?? 1, 0).getDate()
    const startWeekday = firstDay.getDay()
    const lookup = new Map(dailySpending.map((day) => [day.date, day.amount]))
    const max = Math.max(0, ...dailySpending.map((day) => day.amount))
    const total = dailySpending.reduce((sum, day) => sum + day.amount, 0)

    const cells: Array<{ day: number; date: string; amount: number } | null> = []
    for (let index = 0; index < startWeekday; index++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month}-${String(day).padStart(2, "0")}`
      cells.push({ day, date, amount: lookup.get(date) ?? 0 })
    }

    return { cells, max, total }
  }, [month, dailySpending])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Atividade de gastos</CardTitle>
            <CardDescription>
              <span className="font-medium tabular-nums text-foreground">{formatBRL(calendar.total)}</span>{" "}
              em gastos em {formatMonthKey(month).toLowerCase()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Menos</span>
            <span className="inline-block size-3 rounded-sm bg-muted/40" />
            <span className="inline-block size-3 rounded-sm bg-primary/10" />
            <span className="inline-block size-3 rounded-sm bg-primary/25" />
            <span className="inline-block size-3 rounded-sm bg-primary/45" />
            <span className="inline-block size-3 rounded-sm bg-primary/70" />
            <span>Mais</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dailySpending.length === 0 ? (
          <EmptyState
            variant="analytics"
            title="Sem gastos neste mês"
            description="Sua atividade de gastos aparecerá aqui após registrar transações no mês selecionado."
            className="py-8"
          />
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>
            <TooltipProvider delay={0}>
              <div className="grid grid-cols-7 gap-1.5">
                {calendar.cells.map((cell, index) => {
                  if (!cell) return <div key={`empty-${index}`} className="aspect-square rounded-md" />
                  return (
                    <Tooltip key={cell.date}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            aria-label={`${cell.day} de ${formatMonthKey(month)}: ${formatBRL(cell.amount)}`}
                            className={cn(
                              "flex aspect-square items-center justify-center rounded-md text-[10px] font-medium transition-colors hover:ring-2 hover:ring-foreground/20",
                              intensityClass(cell.amount, calendar.max),
                              cell.amount > 0 ? "text-foreground" : "text-muted-foreground/60"
                            )}
                          />
                        }
                      >
                        {cell.day}
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="tabular-nums">{formatBRL(cell.amount)}</span>{" "}
                        em{" "}
                        {new Date(`${cell.date}T12:00:00`).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
