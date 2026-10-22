"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinanceData } from "@/components/finance/finance-provider"
import { cn } from "@/lib/utils"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function SpendingCalendar() {
  const { dailySpending } = useFinanceData()
  const [now] = useState(() => new Date())
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const { weeks, maxValor } = useMemo(() => {
    const map = new Map(dailySpending.map((d) => [d.date, d.amount]))
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const startPad = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: { day: number | null; amount: number; date: string }[] = []

    for (let i = 0; i < startPad; i++) cells.push({ day: null, amount: 0, date: "" })
    let max = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const amount = map.get(dateStr) ?? 0
      if (amount > max) max = amount
      cells.push({ day: d, amount, date: dateStr })
    }

    const weeks: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    const last = weeks[weeks.length - 1]
    if (last) {
      while (last.length < 7) last.push({ day: null, amount: 0, date: "" })
    }

    return { weeks, maxValor: max }
  }, [dailySpending, now])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Calendário de Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {DAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        {/* Weeks */}
        <div className="mt-1 grid gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((cell, ci) => {
                if (cell.day === null) {
                  return <div key={ci} />
                }
                const intensity =
                  cell.amount === 0
                    ? 0
                    : Math.min(Math.round((cell.amount / maxValor) * 4), 4)
                const isToday = cell.date === todayKey
                return (
                  <div
                    key={ci}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg py-1.5 text-center transition-colors",
                      intensity === 0 && "bg-transparent",
                      intensity === 1 && "bg-primary/10",
                      intensity === 2 && "bg-primary/20",
                      intensity === 3 && "bg-primary/35",
                      intensity === 4 && "bg-primary/50",
                      isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    )}
                  >
                    <span className="text-[11px] font-medium">{cell.day}</span>
                    {cell.amount > 0 && (
                      <span className="hidden text-[9px] tabular-nums text-muted-foreground sm:inline">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(cell.amount)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
