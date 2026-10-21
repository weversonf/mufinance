"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import * as seed from "@/data/seed"
import type {
  AccountCard,
  BankAccount,
  BudgetCategory,
  CardData,
  CategoryBreakdown,
  FinancialOverviewPoint,
  FullTransaction,
  MoneyMovementPoint,
  SavingsGoal,
  Transaction,
} from "@/data/seed"
import type { Contact, HealthFactor, Holding, Notification, RecurringCharge, TransferRecord, WatchlistItem, CryptoCoin, CryptoTransaction, PortfolioHistoryPoint, MonthComparison, AiInsight, FaqItem, SupportTicket } from "@/data/seed"

// The reference UI reads stable data contracts. This provider keeps those contracts
// while sourcing every value from the authenticated MuFinance snapshot.
export type FinanceSnapshot = {
  uid: string
  accounts: Array<Record<string, unknown> & { id: string }>
  creditCards: Array<Record<string, unknown> & { id: string }>
  transactions: Array<Record<string, unknown> & { id: string }>
  categories: Array<Record<string, unknown> & { id: string }>
  goals: Array<Record<string, unknown> & { id: string }>
  budgets: Array<Record<string, unknown> & { id: string }>
}

type FinanceDataValue = {
  snapshot: FinanceSnapshot | null
  loading: boolean
  error: string
  refresh: () => Promise<void>
  isDemoMode: boolean
  setDemoMode: (val: boolean) => void
  contacts: Contact[]
  accountCards: AccountCard[]
  walletBalance: { amount: number; changePercent: number; changeDirection: "up" | "down" }
  spendingLimit: { budget: number; spent: number; remaining: number; currency: string; periodStart: string; periodEnd: string }
  financialOverview: FinancialOverviewPoint[]
  moneyMovementByPeriod: { "7d": MoneyMovementPoint[]; "30d": MoneyMovementPoint[]; "90d": MoneyMovementPoint[] }
  recentTransactions: Transaction[]
  fullTransactions: FullTransaction[]
  cardsData: CardData[]
  categoryBreakdowns: CategoryBreakdown[]
  budgetCategories: BudgetCategory[]
  savingsGoals: SavingsGoal[]
  bankAccounts: BankAccount[]
  transferRecords: TransferRecord[]
  notifications: Notification[]
  cryptoCoins: CryptoCoin[]
  cryptoTransactions: CryptoTransaction[]
  financialHealthScore: { overall: number; trend: "up" | "down"; trendDelta: number; factors: HealthFactor[] }
  holdings: Holding[]
  watchlistItems: WatchlistItem[]
  portfolioHistory: PortfolioHistoryPoint[]
  monthComparisons: MonthComparison[]
  aiInsights: AiInsight[]
  recurringCharges: RecurringCharge[]
  faqItems: FaqItem[]
  supportTickets: SupportTicket[]
  dailySpending: Array<{ date: string; amount: number }>
  spendingHeatmapData: Array<{ date: string; amount: number }>
  cryptoPriceHistory: Array<{ time: string; btc: number; eth: number }>
  systemStatus: Array<{ name: string; status: "operational" | "degraded" }>
}

const FinanceDataContext = createContext<FinanceDataValue | null>(null)

function numberValue(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const raw = String(value ?? "").trim().replace(/[^0-9,.-]/g, "")
  if (!raw) return 0

  const lastComma = raw.lastIndexOf(",")
  const lastDot = raw.lastIndexOf(".")
  let normalized = raw
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot
      ? raw.replace(/\./g, "").replace(",", ".")
      : raw.replace(/,/g, "")
  } else if (lastComma >= 0) {
    normalized = raw.replace(/,/g, ".")
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function dateValue(value: unknown) {
  const text = String(value ?? "").trim()
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  // Parse como UTC puro para evitar que datas próximas à meia-noite
  // caiam no mês errado por causa do timezone local do navegador.
  const parsed = dateOnly
    ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
    : new Date(text)
  return Number.isNaN(parsed.valueOf()) ? null : parsed
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date)
}

function signedTransaction(transaction: Record<string, unknown>) {
  const amount = Math.abs(numberValue(transaction.amount))
  if (transaction.type === "income") return amount
  if (transaction.type === "expense") return -amount
  return 0
}

function buildData(snapshot: FinanceSnapshot | null, isDemoMode: boolean = false): Omit<FinanceDataValue, "snapshot" | "loading" | "error" | "refresh" | "isDemoMode" | "setDemoMode"> {
  const accounts = snapshot?.accounts ?? []
  const cards = snapshot?.creditCards ?? []
  const transactions = snapshot?.transactions ?? []
  const categories = snapshot?.categories ?? []
  const budgets = snapshot?.budgets ?? []
  const goals = snapshot?.goals ?? []
  const visibleAccounts = accounts.filter((account) => account.locked !== true && account.blindage !== true && account.blind !== true)
  const balance = visibleAccounts.reduce((sum, account) => sum + numberValue(account.balance), 0)
  // Exclui lançamentos automáticos do sistema (ex: ajustes de saldo) dos cálculos de analytics.
  // Eles continuam visíveis na lista completa de transações mas não distorcem gráficos e orçamentos.
  const analyticsTransactions = transactions.filter((t) => t.isSystemEntry !== true)
  const sortedTransactions = [...transactions].sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))

  const now = new Date()
  const currentMonth = monthKey(now)

  const recentTransactions: Transaction[] = sortedTransactions.slice(0, 7).map((transaction) => ({
    id: transaction.id,
    merchant: String(transaction.payee ?? "Lançamento"),
    transactionId: transaction.id,
    amount: signedTransaction(transaction),
    date: String(transaction.date ?? ""),
    logo: "/icon.svg",
    category: String(transaction.category ?? "Sem categoria"),
  }))

  const fullTransactions: FullTransaction[] = sortedTransactions.map((transaction) => ({
    id: transaction.id,
    merchant: String(transaction.payee ?? "Lançamento"),
    transactionId: transaction.id,
    amount: signedTransaction(transaction),
    date: String(transaction.date ?? ""),
    logo: "/icon.svg",
    category: String(transaction.category ?? "Sem categoria"),
    status: transaction.status === "pending" ? "pending" : "completed",
    type: transaction.type === "income" ? "income" : "expense",
    notes: typeof transaction.notes === "string" ? transaction.notes : undefined,
  }))

  const monthly = new Map<number, { date: Date; currentYear: number; lastYear: number }>()
  for (const transaction of analyticsTransactions) {
    const date = dateValue(transaction.date)
    const year = date?.getUTCFullYear()
    if (!date || transaction.type !== "income" || (year !== now.getFullYear() && year !== now.getFullYear() - 1)) continue
    const month = date.getUTCMonth()
    const current = monthly.get(month) ?? { date: new Date(now.getFullYear(), month, 1), currentYear: 0, lastYear: 0 }
    if (year === now.getFullYear()) current.currentYear += Math.abs(numberValue(transaction.amount))
    else current.lastYear += Math.abs(numberValue(transaction.amount))
    monthly.set(month, current)
  }
  const financialOverview = [...monthly.values()]
    .sort((a, b) => a.date.valueOf() - b.date.valueOf())
    .map((item) => ({ month: monthLabel(item.date), currentYear: item.currentYear, lastYear: item.lastYear }))

  function movement(days: number, bucket: "day" | "week" | "month") {
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - days)
    const grouped = new Map<string, MoneyMovementPoint>()
    for (const transaction of analyticsTransactions) {
      const date = dateValue(transaction.date)
      if (!date || date < cutoff) continue
      let key = dateKey(date)
      let label = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date)
      if (bucket === "week") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = dateKey(weekStart)
        label = new Intl.DateTimeFormat("pt-BR", { month: "short", day: "numeric" }).format(weekStart)
      } else if (bucket === "month") {
        key = monthKey(date)
        label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date)
      }
      const item = grouped.get(key) ?? { label, moneyIn: 0, moneyOut: 0 }
      if (transaction.type === "income") item.moneyIn += Math.abs(numberValue(transaction.amount))
      if (transaction.type === "expense") item.moneyOut += Math.abs(numberValue(transaction.amount))
      grouped.set(key, item)
    }
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, item]) => item)
  }
  const moneyMovementByPeriod = { "7d": movement(7, "day"), "30d": movement(30, "week"), "90d": movement(90, "month") }

  const expensesByCategory = new Map<string, number>()
  for (const transaction of analyticsTransactions) {
    if (transaction.type !== "expense") continue
    const category = String(transaction.category ?? "Sem categoria")
    expensesByCategory.set(category, (expensesByCategory.get(category) ?? 0) + Math.abs(numberValue(transaction.amount)))
  }
  const categoryBreakdowns: CategoryBreakdown[] = [...expensesByCategory.entries()].map(([category, amount], index) => ({ category, amount, color: `var(--color-chart-${(index % 5) + 1})`, subcategories: [] }))

  const dailyValors = new Map<string, number>()
  for (const transaction of analyticsTransactions) {
    const date = dateValue(transaction.date)
    if (!date || date.getUTCFullYear() !== now.getFullYear() || transaction.type !== "expense") continue
    const key = dateKey(date)
    dailyValors.set(key, (dailyValors.get(key) ?? 0) + Math.abs(numberValue(transaction.amount)))
  }
  const dailySpending = [...dailyValors.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, amount]) => ({ date, amount }))

  const monthBudgets = budgets.filter((budget) => String(budget.month ?? "") === currentMonth)
  const spentByCategory = new Map<string, number>()
  for (const transaction of analyticsTransactions) {
    if (transaction.type === "expense" && String(transaction.date ?? "").startsWith(currentMonth)) {
      const key = String(transaction.categoryId ?? transaction.category ?? "")
      spentByCategory.set(key, (spentByCategory.get(key) ?? 0) + Math.abs(numberValue(transaction.amount)))
    }
  }

  const categoryMap = new Map(categories.map((category) => [category.id, String(category.name ?? category.id)]))
  const budgetCategories: BudgetCategory[] = monthBudgets.map((budget, index) => ({ id: budget.id, category: categoryMap.get(String(budget.categoryId)) ?? String(budget.categoryId ?? "Orçamento"), iconName: "wallet", budget: numberValue(budget.limitAmount), spent: spentByCategory.get(String(budget.categoryId)) ?? 0, color: `text-chart-${(index % 5) + 1}` }))
  const budget = budgetCategories.reduce((sum, item) => sum + item.budget, 0)
  const spent = budgetCategories.reduce((sum, item) => sum + item.spent, 0)

  const accountCards: AccountCard[] = visibleAccounts.map((account, index) => ({ id: account.id, label: String(account.name ?? "Conta"), balance: brl(numberValue(account.balance)), currency: "BRL", variant: index % 3 === 1 ? "dark" : index % 3 === 2 ? "primary" : "default" }))
  const accountTypeColorMap: Record<string, string> = { checking: "bg-blue-500", savings: "bg-emerald-500", digital: "bg-violet-500", investment: "bg-indigo-500", crypto: "bg-orange-500", wallet: "bg-slate-500" }
  const validAccountTypes = ["checking", "savings", "digital", "investment", "crypto", "wallet"]
  const bankAccounts: BankAccount[] = visibleAccounts.map((account, index) => ({ id: account.id, name: String(account.name ?? "Conta"), type: validAccountTypes.includes(String(account.type)) ? String(account.type) as BankAccount["type"] : "checking", institution: String(account.institution ?? "Conta manual"), institutionLogo: "/icon.svg", accountNumber: String(account.accountNumber ?? ""), balance: numberValue(account.balance), currency: "BRL", change: 0, changePercent: 0, lastActivity: "", color: accountTypeColorMap[String(account.type)] ?? ["bg-primary", "bg-emerald-500", "bg-violet-500", "bg-orange-500"][index % 4] }))
  const cardsData: CardData[] = cards.map((card) => {
    const cardSpend = transactions
      .filter(t => t.accountId === card.id && t.type === "expense" && String(t.date ?? "").startsWith(currentMonth))
      .reduce((sum, t) => sum + numberValue(t.amount), 0)

    return { 
      id: card.id, 
      name: String(card.name ?? "Cartão"), 
      type: "physical", 
      last4: String(card.last4 ?? ""), 
      cardNumber: `**** **** **** ${String(card.last4 ?? "")}`, 
      holder: "", 
      expiry: "", 
      cvv: "", 
      network: String(card.brand ?? "Visa").toLowerCase() === "mastercard" ? "mastercard" : "visa", 
      frozen: false, 
      dailyLimit: 0, 
      monthlySpend: cardSpend, 
      monthlyLimit: numberValue(card.limit), 
      color: "bg-primary text-primary-foreground" 
    }
  })
  const savingsGoals: SavingsGoal[] = goals.map((goal) => {
    const targetAmount = numberValue(goal.targetAmount)
    const currentAmount = numberValue(goal.currentAmount)
    const dueDateStr = String(goal.dueDate ?? "")
    
    let monthlyContribution = 0
    if (dueDateStr && targetAmount > currentAmount) {
      const dueDate = new Date(dueDateStr)
      const now = new Date()
      let monthsRemaining = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth())
      if (monthsRemaining < 1) monthsRemaining = 1
      monthlyContribution = (targetAmount - currentAmount) / monthsRemaining
    }

    return { 
      id: goal.id, 
      name: String(goal.name ?? "Meta"), 
      targetAmount, 
      currentAmount, 
      deadline: dueDateStr, 
      iconName: "target", 
      monthlyContribution 
    }
  })

  const default12Months: FinancialOverviewPoint[] = [
    { month: "Jan", currentYear: 0, lastYear: 0 },
    { month: "Fev", currentYear: 0, lastYear: 0 },
    { month: "Mar", currentYear: 0, lastYear: 0 },
    { month: "Abr", currentYear: 0, lastYear: 0 },
    { month: "Mai", currentYear: 0, lastYear: 0 },
    { month: "Jun", currentYear: 0, lastYear: 0 },
    { month: "Jul", currentYear: 0, lastYear: 0 },
    { month: "Ago", currentYear: 0, lastYear: 0 },
    { month: "Set", currentYear: 0, lastYear: 0 },
    { month: "Out", currentYear: 0, lastYear: 0 },
    { month: "Nov", currentYear: 0, lastYear: 0 },
    { month: "Dez", currentYear: 0, lastYear: 0 },
  ]
  const emptyMovement = { "7d": [] as MoneyMovementPoint[], "30d": [] as MoneyMovementPoint[], "90d": [] as MoneyMovementPoint[] }

  const hasRealAccounts = visibleAccounts.length > 0
  const hasRealTransactions = transactions.length > 0
  const hasRealCards = cards.length > 0
  const hasRealBudgets = budgetCategories.length > 0
  const hasRealGoals = savingsGoals.length > 0

  if (isDemoMode) {
    return {
      contacts: seed.contacts,
      accountCards: hasRealAccounts ? accountCards : seed.accountCards,
      walletBalance: hasRealAccounts
        ? { amount: balance, changePercent: 0, changeDirection: "up" as const }
        : seed.walletBalance,
      spendingLimit: hasRealBudgets
        ? { budget, spent, remaining: Math.max(0, budget - spent), currency: "BRL", periodStart: currentMonth, periodEnd: currentMonth }
        : { ...seed.spendingLimit, currency: "BRL" },
      financialOverview: (hasRealTransactions && financialOverview.length > 0)
        ? financialOverview
        : seed.financialOverview,
      moneyMovementByPeriod: hasRealTransactions
        ? moneyMovementByPeriod
        : seed.moneyMovementByPeriod,
      recentTransactions: hasRealTransactions ? recentTransactions : seed.recentTransactions,
      fullTransactions: hasRealTransactions ? fullTransactions : seed.fullTransactions,
      cardsData: hasRealCards ? cardsData : seed.cardsData,
      categoryBreakdowns: (hasRealTransactions && categoryBreakdowns.length > 0)
        ? categoryBreakdowns
        : seed.categoryBreakdowns,
      budgetCategories: hasRealBudgets ? budgetCategories : seed.budgetCategories,
      savingsGoals: hasRealGoals ? savingsGoals : seed.savingsGoals,
      bankAccounts: hasRealAccounts ? bankAccounts : seed.bankAccounts,
      transferRecords: seed.transferRecords,
      notifications: seed.notifications,
      cryptoCoins: seed.cryptoCoins,
      cryptoTransactions: seed.cryptoTransactions,
      financialHealthScore: (hasRealTransactions || hasRealAccounts)
        ? { overall: Math.min(100, Math.round((accounts.length > 0 ? 50 : 0) + (transactions.length > 0 ? 50 : 0))), trend: "up" as const, trendDelta: 0, factors: [] }
        : seed.financialHealthScore,
      holdings: seed.holdings,
      watchlistItems: seed.watchlistItems,
      portfolioHistory: seed.portfolioHistory,
      monthComparisons: seed.monthComparisons,
      aiInsights: seed.aiInsights,
      recurringCharges: seed.recurringCharges,
      faqItems: seed.faqItems,
      supportTickets: seed.supportTickets,
      dailySpending: (hasRealTransactions && dailySpending.length > 0) ? dailySpending : seed.dailySpending,
      spendingHeatmapData: (hasRealTransactions && dailySpending.length > 0) ? dailySpending : seed.dailySpending,
      cryptoPriceHistory: seed.cryptoPriceHistory || [],
      systemStatus: [
        { name: "Sistema Principal", status: "operational" as const },
        { name: "Banco Firestore", status: "operational" as const },
        { name: "Autenticação", status: "operational" as const },
        { name: "API de Cotações", status: "operational" as const },
      ],
    }
  }

  // Pure real clean mode
  return {
    contacts: [],
    accountCards,
    walletBalance: { amount: balance, changePercent: 0, changeDirection: "up" as const },
    spendingLimit: { budget, spent, remaining: Math.max(0, budget - spent), currency: "BRL", periodStart: currentMonth, periodEnd: currentMonth },
    financialOverview: financialOverview.length > 0 ? financialOverview : default12Months,
    moneyMovementByPeriod: hasRealTransactions ? moneyMovementByPeriod : emptyMovement,
    recentTransactions,
    fullTransactions,
    cardsData,
    categoryBreakdowns,
    budgetCategories,
    savingsGoals,
    bankAccounts,
    transferRecords: [],
    notifications: [],
    cryptoCoins: [],
    cryptoTransactions: [],
    financialHealthScore: {
      overall: Math.min(100, Math.round((accounts.length > 0 ? 50 : 0) + (transactions.length > 0 ? 50 : 0))),
      trend: "up" as const,
      trendDelta: 0,
      factors: []
    },
    holdings: [],
    watchlistItems: [],
    portfolioHistory: [],
    monthComparisons: [],
    aiInsights: [],
    recurringCharges: [],
    faqItems: seed.faqItems,
    supportTickets: [],
    dailySpending,
    spendingHeatmapData: dailySpending,
    cryptoPriceHistory: [],
    systemStatus: [
      { name: "Sistema Principal", status: "operational" as const },
      { name: "Banco Firestore", status: "operational" as const },
      { name: "Autenticação", status: "operational" as const },
      { name: "API de Cotações", status: "operational" as const },
    ],
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mufinance_demo_mode")
      if (stored === "true") setIsDemoMode(true)
    } catch {}
  }, [])

  const setDemoMode = useCallback((val: boolean) => {
    setIsDemoMode(val)
    try {
      localStorage.setItem("mufinance_demo_mode", String(val))
    } catch {}
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/finance/snapshot", { cache: "no-store" })
      if (response.status === 401) {
        setSnapshot(null)
        return
      }
      if (!response.ok) throw new Error("Não foi possível carregar seus dados financeiros.")
      setSnapshot(await response.json() as FinanceSnapshot)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível carregar seus dados financeiros.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  const mapped = useMemo(() => buildData(snapshot, isDemoMode), [snapshot, isDemoMode])
  const value = useMemo(
    () => ({ snapshot, loading, error, refresh, isDemoMode, setDemoMode, ...mapped }),
    [snapshot, loading, error, refresh, isDemoMode, setDemoMode, mapped]
  )
  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>
}

export function useFinanceData() {
  const value = useContext(FinanceDataContext)
  if (!value) throw new Error("useFinanceData deve ser usado dentro de FinanceProvider")
  return value
}
