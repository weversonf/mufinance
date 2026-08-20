// Data contracts for the shadcn-fintech UI. Runtime values start empty until Firebase provides the user's data.

export type Contact = { id: string; name: string; avatar: string }
export const contacts: Contact[] = []

export type AccountCard = {
  id: string
  label: string
  balance: string
  currency: string
  variant: "default" | "dark" | "primary"
}
export const accountCards: AccountCard[] = []

export const walletBalance = { amount: 0, changePercent: 0, changeDirection: "up" as const }
export const spendingLimit = { budget: 0, spent: 0, remaining: 0, currency: "BRL", periodStart: "", periodEnd: "" }

export type FinancialOverviewPoint = { month: string; currentYear: number; lastYear: number }
export const financialOverview: FinancialOverviewPoint[] = []

export type MoneyMovementPoint = { label: string; moneyIn: number; moneyOut: number }
export const moneyMovement7d: MoneyMovementPoint[] = []
export const moneyMovement30d: MoneyMovementPoint[] = []
export const moneyMovement90d: MoneyMovementPoint[] = []
export const moneyMovementByPeriod = { "7d": moneyMovement7d, "30d": moneyMovement30d, "90d": moneyMovement90d } as const

export const logo = (_domain: string) => "/icon.svg"

export type Transaction = {
  id: string
  merchant: string
  transactionId: string
  amount: number
  date: string
  logo: string
  category: string
}
export const recentTransactions: Transaction[] = []

export type FullTransaction = {
  id: string
  merchant: string
  transactionId: string
  amount: number
  date: string
  logo: string
  category: string
  status: "completed" | "pending" | "failed"
  type: "expense" | "income"
  notes?: string
  merchantInfo?: string
  cardLast4?: string
}
export const fullTransactions: FullTransaction[] = []

export type CardData = {
  id: string
  name: string
  type: "physical" | "virtual"
  last4: string
  cardNumber: string
  holder: string
  expiry: string
  cvv: string
  network: "visa" | "mastercard"
  frozen: boolean
  dailyLimit: number
  monthlySpend: number
  monthlyLimit: number
  color: string
}
export const cardsData: CardData[] = []

export type SpendingHeatmapDay = { date: string; amount: number }
export const spendingHeatmapData: SpendingHeatmapDay[] = []

export type CategoryBreakdown = {
  category: string
  amount: number
  color: string
  subcategories: { name: string; amount: number }[]
}
export const categoryBreakdowns: CategoryBreakdown[] = []

export type RecurringCharge = {
  id: string
  merchant: string
  logo: string
  amount: number
  frequency: "monthly" | "yearly"
  nextDate: string
  status: "wanted" | "review" | "unset"
  category: string
}
export const recurringCharges: RecurringCharge[] = []

export type MonthComparison = { category: string; thisMonth: number; lastMonth: number }
export const monthComparisons: MonthComparison[] = []

export type AiInsight = { id: string; text: string; trend: "up" | "down" | "neutral"; percentChange: number; category: string }
export const aiInsights: AiInsight[] = []

export type Holding = {
  id: string
  symbol: string
  name: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
  logo: string
  sparklineData: number[]
  sector: string
}
export const holdings: Holding[] = []

export type WatchlistItem = { id: string; symbol: string; name: string; currentPrice: number; dayChange: number; logo: string; sparklineData: number[] }
export const watchlistItems: WatchlistItem[] = []

export type PortfolioHistoryPoint = { date: string; portfolio: number; sp500: number }
export const portfolioHistory: PortfolioHistoryPoint[] = []

export type BudgetCategory = { id: string; category: string; iconName: string; budget: number; spent: number; color: string }
export const budgetCategories: BudgetCategory[] = []

export type SavingsGoal = { id: string; name: string; targetAmount: number; currentAmount: number; deadline: string; iconName: string; monthlyContribution: number }
export const savingsGoals: SavingsGoal[] = []

export type DailySpending = { date: string; amount: number }
export const dailySpending: DailySpending[] = []

export type BankAccount = {
  id: string
  name: string
  type: "checking" | "savings" | "crypto" | "investment"
  institution: string
  institutionLogo: string
  accountNumber: string
  balance: number
  currency: string
  change: number
  changePercent: number
  lastActivity: string
  color: string
}
export const bankAccounts: BankAccount[] = []

export type TransferRecord = {
  id: string
  type: "sent" | "received" | "scheduled"
  contactName: string
  contactAvatar: string
  amount: number
  date: string
  status: "completed" | "pending" | "scheduled"
  note?: string
}
export const transferRecords: TransferRecord[] = []

export type Notification = {
  id: string
  type: "transaction" | "security" | "system" | "promotion" | "request"
  title: string
  description: string
  time: string
  read: boolean
  icon: string
  actionable?: { accept: string; decline: string; amount?: string; from?: string; fromAvatar?: string }
}
export const notifications: Notification[] = []

export type CryptoCoin = {
  id: string
  symbol: string
  name: string
  logo: string
  price: number
  change24h: number
  change7d: number
  marketCap: number
  volume24h: number
  holdings: number
  sparklineData: number[]
}
export const cryptoCoins: CryptoCoin[] = []

export type CryptoTransaction = {
  id: string
  type: "buy" | "sell" | "swap" | "receive" | "send"
  coin: string
  coinSymbol: string
  logo: string
  amount: number
  value: number
  date: string
  status: "completed" | "pending"
}
export const cryptoTransactions: CryptoTransaction[] = []

export type HealthFactor = {
  id: string
  label: string
  score: number
  maxScore: number
  status: "excellent" | "good" | "fair" | "poor"
  description: string
}
export const financialHealthScore = { overall: 0, trend: "up" as const, trendDelta: 0, factors: [] as HealthFactor[] }

export type FaqItem = { id: string; question: string; answer: string; category: "account" | "payments" | "security" | "billing" | "general" }
export const faqItems: FaqItem[] = []

export type SupportTicket = { id: string; subject: string; status: "open" | "in-progress" | "resolved"; priority: "low" | "medium" | "high"; createdAt: string; lastUpdate: string }
export const supportTickets: SupportTicket[] = []

export const systemStatus: Array<{ name: string; status: "operational" | "degraded" }> = []
export const cryptoPriceHistory: Array<{ time: string; btc: number; eth: number }> = []
