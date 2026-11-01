"use client"

import * as React from "react"

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function shiftMonthKey(key: string, delta: number) {
  const [year, month] = key.split("-").map(Number)
  const date = new Date(year, (month ?? 1) - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function formatMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number)
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(year, (month ?? 1) - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

type AnalyticsMonthContextValue = {
  month: string
  currentMonth: string
  setMonth: (month: string) => void
  previousMonth: () => void
  nextMonth: () => void
  resetToCurrentMonth: () => void
}

const AnalyticsMonthContext = React.createContext<AnalyticsMonthContextValue | null>(null)

export function AnalyticsMonthProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonth] = React.useState(currentMonthKey)
  const currentMonth = currentMonthKey()

  const value = React.useMemo<AnalyticsMonthContextValue>(
    () => ({
      month,
      currentMonth,
      setMonth,
      previousMonth: () => setMonth((current) => shiftMonthKey(current, -1)),
      nextMonth: () => setMonth((current) => shiftMonthKey(current, 1)),
      resetToCurrentMonth: () => setMonth(currentMonth),
    }),
    [month, currentMonth]
  )

  return (
    <AnalyticsMonthContext.Provider value={value}>
      {children}
    </AnalyticsMonthContext.Provider>
  )
}

export function useAnalyticsMonth() {
  const context = React.useContext(AnalyticsMonthContext)
  if (!context) throw new Error("useAnalyticsMonth precisa estar dentro de AnalyticsMonthProvider")
  return context
}
