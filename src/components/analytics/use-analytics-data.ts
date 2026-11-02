"use client"

import * as React from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import { useAnalyticsMonth } from "@/components/analytics/analytics-month"
import type { AiInsight, CategoryBreakdown, MonthComparison, RecurringCharge } from "@/data/seed"

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const raw = String(value ?? "").trim().replace(/[^0-9,.-]/g, "")
  if (!raw) return 0
  const lastComma = raw.lastIndexOf(",")
  const lastDot = raw.lastIndexOf(".")
  let normalized = raw
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "")
  } else if (lastComma >= 0) {
    normalized = raw.replace(/,/g, ".")
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}`
}

function monthKeyOf(value: unknown) {
  return String(value ?? "").slice(0, 7)
}

function isFinancial(transaction: Record<string, unknown>) {
  return transaction.isSystemEntry !== true && (transaction.type === "income" || transaction.type === "expense")
}

function amountOf(transaction: Record<string, unknown>) {
  return Math.abs(toNumber(transaction.amount))
}

function categoryOf(transaction: Record<string, unknown>) {
  return String(transaction.category ?? "Sem categoria")
}

const CATEGORY_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export type AnalyticsSummary = {
  income: number
  expense: number
  net: number
  plannedExpense: number
  plannedIncome: number
  transactionCount: number
}

export type AnalyticsData = {
  month: string
  monthTransactions: Array<Record<string, unknown> & { id: string }>
  previousMonthTransactions: Array<Record<string, unknown> & { id: string }>
  categoryBreakdowns: CategoryBreakdown[]
  monthComparisons: MonthComparison[]
  dailySpending: Array<{ date: string; amount: number }>
  dailyTotals: Array<{ date: string; income: number; expense: number; balance: number }>
  recurringCharges: RecurringCharge[]
  aiInsights: AiInsight[]
  summary: AnalyticsSummary
  previousSummary: AnalyticsSummary
}

function summarize(transactions: Array<Record<string, unknown> & { id: string }>): AnalyticsSummary {
  let income = 0
  let expense = 0
  let plannedExpense = 0
  let plannedIncome = 0

  for (const transaction of transactions) {
    const amount = amountOf(transaction)
    const planned = transaction.status === "planned" || transaction.status === "pending"
    if (transaction.type === "income") {
      income += amount
      if (planned) plannedIncome += amount
    } else if (transaction.type === "expense") {
      expense += amount
      if (planned) plannedExpense += amount
    }
  }

  return {
    income,
    expense,
    net: income - expense,
    plannedExpense,
    plannedIncome,
    transactionCount: transactions.length,
  }
}

export function useAnalyticsData(): AnalyticsData {
  const { snapshot } = useFinanceData()
  const { month } = useAnalyticsMonth()

  return React.useMemo(() => {
    const allTransactions = (snapshot?.transactions ?? []).filter(isFinancial)
    const [selectedYear, selectedMonth] = month.split("-").map(Number)
    const previousDate = new Date(selectedYear, (selectedMonth ?? 1) - 2, 1)
    const previousMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`

    const monthTransactions = allTransactions.filter((transaction) => monthKeyOf(transaction.date) === month)
    const previousMonthTransactions = allTransactions.filter(
      (transaction) => monthKeyOf(transaction.date) === previousMonth
    )

    const expensesByCategory = new Map<string, number>()
    for (const transaction of monthTransactions) {
      if (transaction.type !== "expense") continue
      const category = categoryOf(transaction)
      expensesByCategory.set(category, (expensesByCategory.get(category) ?? 0) + amountOf(transaction))
    }

    const categoryBreakdowns: CategoryBreakdown[] = [...expensesByCategory.entries()]
      .sort(([, left], [, right]) => right - left)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        subcategories: [],
      }))

    const previousByCategory = new Map<string, number>()
    for (const transaction of previousMonthTransactions) {
      if (transaction.type !== "expense") continue
      const category = categoryOf(transaction)
      previousByCategory.set(category, (previousByCategory.get(category) ?? 0) + amountOf(transaction))
    }

    const comparisonCategories = new Set([
      ...expensesByCategory.keys(),
      ...previousByCategory.keys(),
    ])
    const monthComparisons: MonthComparison[] = [...comparisonCategories]
      .map((category) => ({
        category,
        thisMonth: expensesByCategory.get(category) ?? 0,
        lastMonth: previousByCategory.get(category) ?? 0,
      }))
      .sort((left, right) => (right.thisMonth + right.lastMonth) - (left.thisMonth + left.lastMonth))
      .slice(0, 8)

    const dailyMap = new Map<string, number>()
    for (const transaction of monthTransactions) {
      if (transaction.type !== "expense") continue
      const date = String(transaction.date ?? "").slice(0, 10)
      if (!date) continue
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + amountOf(transaction))
    }
    const dailySpending = [...dailyMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, amount]) => ({ date, amount }))

    const dailyTotalsMap = new Map<string, { income: number; expense: number }>()
    for (const transaction of monthTransactions) {
      const date = String(transaction.date ?? "").slice(0, 10)
      if (!date) continue
      const entry = dailyTotalsMap.get(date) ?? { income: 0, expense: 0 }
      if (transaction.type === "income") entry.income += amountOf(transaction)
      else if (transaction.type === "expense") entry.expense += amountOf(transaction)
      dailyTotalsMap.set(date, entry)
    }
    const dailyTotals = [...dailyTotalsMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, value]) => ({
        date,
        income: value.income,
        expense: value.expense,
        balance: value.income - value.expense,
      }))

    // Detecta recorrências por favorecido com ocorrência em 2+ meses e valores estáveis.
    const recurringGroups = new Map<string, {
      merchant: string
      category: string
      months: Set<string>
      dates: string[]
      amounts: number[]
    }>()

    for (const transaction of allTransactions) {
      if (transaction.type !== "expense") continue
      const merchant = String(transaction.payee ?? "").trim()
      if (!merchant) continue
      const key = merchant.toLowerCase()
      const group = recurringGroups.get(key) ?? {
        merchant,
        category: categoryOf(transaction),
        months: new Set<string>(),
        dates: [],
        amounts: [],
      }
      group.months.add(monthKeyOf(transaction.date))
      group.dates.push(String(transaction.date ?? "").slice(0, 10))
      group.amounts.push(amountOf(transaction))
      recurringGroups.set(key, group)
    }

    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    const recurringCharges: RecurringCharge[] = [...recurringGroups.values()]
      .filter((group) => {
        if (group.months.size < 2) return false
        const average = group.amounts.reduce((sum, value) => sum + value, 0) / group.amounts.length
        if (average <= 0) return false
        const spread = (Math.max(...group.amounts) - Math.min(...group.amounts)) / average
        return spread <= 0.25
      })
      .map((group) => {
        const sortedDates = [...group.dates].sort()
        const next = sortedDates.find((date) => date >= today) ?? sortedDates[sortedDates.length - 1]
        const average = group.amounts.reduce((sum, value) => sum + value, 0) / group.amounts.length
        return {
          id: group.merchant.toLowerCase().replace(/\s+/g, "-"),
          merchant: group.merchant,
          logo: "/icon.svg",
          amount: average,
          frequency: "monthly" as const,
          nextDate: formatDate(next),
          status: "unset" as const,
          category: group.category,
        }
      })
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 6)

    const summary = summarize(monthTransactions)
    const previousSummary = summarize(previousMonthTransactions)

    const insights: AiInsight[] = []
    if (summary.transactionCount > 0) {
      if (previousSummary.expense > 0) {
        const change = ((summary.expense - previousSummary.expense) / previousSummary.expense) * 100
        if (Math.abs(change) >= 1) {
          insights.push({
            id: "expense-change",
            text: `Seus gastos estão ${Math.abs(change).toFixed(0)}% ${change >= 0 ? "maiores" : "menores"} que no mês anterior (${formatBRL(summary.expense)} contra ${formatBRL(previousSummary.expense)}).`,
            trend: change >= 0 ? "up" : "down",
            percentChange: Math.round(Math.abs(change)),
            category: "Despesas",
          })
        }
      }

      const topCategory = categoryBreakdowns[0]
      if (topCategory) {
        const share = summary.expense > 0 ? (topCategory.amount / summary.expense) * 100 : 0
        insights.push({
          id: "top-category",
          text: `${topCategory.category} é a maior categoria do mês, com ${formatBRL(topCategory.amount)} (${share.toFixed(0)}% das despesas).`,
          trend: "neutral",
          percentChange: Math.round(share),
          category: topCategory.category,
        })
      }

      insights.push({
        id: "net-result",
        text: summary.net >= 0
          ? `O mês fecha positivo em ${formatBRL(summary.net)}, com ${formatBRL(summary.income)} de entradas e ${formatBRL(summary.expense)} de saídas.`
          : `O mês está negativo em ${formatBRL(Math.abs(summary.net))}: as saídas superam as entradas em ${formatBRL(summary.expense - summary.income)}.`,
        trend: summary.net >= 0 ? "down" : "up",
        percentChange: summary.income > 0 ? Math.round(Math.abs((summary.net / summary.income) * 100)) : 0,
        category: "Saldo do mês",
      })

      if (summary.plannedExpense > 0) {
        insights.push({
          id: "planned-expense",
          text: `${formatBRL(summary.plannedExpense)} das despesas do mês ainda estão planejadas. Ao confirmar os pagamentos, o saldo pode mudar.`,
          trend: "neutral",
          percentChange: summary.expense > 0 ? Math.round((summary.plannedExpense / summary.expense) * 100) : 0,
          category: "Planejamento",
        })
      }
    }

    return {
      month,
      monthTransactions,
      previousMonthTransactions,
      categoryBreakdowns,
      monthComparisons,
      dailySpending,
      dailyTotals,
      recurringCharges,
      aiInsights: insights,
      summary,
      previousSummary,
    }
  }, [snapshot?.transactions, month])
}
