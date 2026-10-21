// ---------------------------------------------------------------------------
// Seed data – Dados financeiros zerados para conta limpa
// ---------------------------------------------------------------------------

// ── Contacts (Quick Transfer) ──────────────────────────────────────────────
export type Contact = { id: string; name: string; avatar: string }
export const contacts: Contact[] = []

// ── Account Cards ──────────────────────────────────────────────────────────
export type AccountCard = {
  id: string
  label: string
  balance: string
  currency: string
  variant: "default" | "dark" | "primary"
}
export const accountCards: AccountCard[] = []

// ── Wallet Balance ─────────────────────────────────────────────────────────
export const walletBalance = {
  amount: 0,
  changePercent: 0,
  changeDirection: "up" as const,
}

// ── Monthly Spending Limit ─────────────────────────────────────────────────
export const spendingLimit = {
  budget: 0,
  spent: 0,
  remaining: 0,
  currency: "BRL",
  periodStart: "",
  periodEnd: "",
}

// ── Financial Overview (monthly revenue chart) ─────────────────────────────
export type FinancialOverviewPoint = { month: string; currentYear: number; lastYear: number }
export const financialOverview: FinancialOverviewPoint[] = [
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

// ── Money Movement ─────────────────────────────────────────────────────────
export type MoneyMovementPoint = { label: string; moneyIn: number; moneyOut: number }
export const moneyMovement7d: MoneyMovementPoint[] = []
export const moneyMovement30d: MoneyMovementPoint[] = []
export const moneyMovement90d: MoneyMovementPoint[] = []
export const moneyMovementByPeriod = {
  "7d": moneyMovement7d,
  "30d": moneyMovement30d,
  "90d": moneyMovement90d,
} as const

// ── Logo helper ────────────────────────────────────────────────────────────
export const logo = (domain: string) =>
  `/logos/${domain.replace(/\./g, "-")}.png`

// ── Recent Transactions ────────────────────────────────────────────────────
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

// ── Full Transactions ──────────────────────────────────────────────────────
export type FullTransaction = {
  id: string
  merchant: string
  transactionId: string
  amount: number
  date: string
  logo: string
  category: string
  status: "completed" | "pending" | "failed"
  type: "income" | "expense"
  notes?: string
}
export const fullTransactions: FullTransaction[] = []

// ── Card Data ──────────────────────────────────────────────────────────────
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

// ── Spending Heatmap ───────────────────────────────────────────────────────
export type SpendingHeatmapDay = { date: string; amount: number }
export const spendingHeatmapData: SpendingHeatmapDay[] = []

// ── Category Breakdown ─────────────────────────────────────────────────────
export type CategoryBreakdown = {
  category: string
  amount: number
  color: string
  subcategories: { name: string; amount: number }[]
}
export const categoryBreakdowns: CategoryBreakdown[] = []

// ── Recurring Charges ──────────────────────────────────────────────────────
export type RecurringCharge = {
  id: string
  name: string
  amount: number
  frequency: "monthly" | "yearly"
  category: string
  logo: string
  nextDate: string
  status: "unset" | "wanted" | "review"
}
export const recurringCharges: RecurringCharge[] = []

// ── Month Comparison ───────────────────────────────────────────────────────
export type MonthComparison = { category: string; thisMonth: number; lastMonth: number }
export const monthComparisons: MonthComparison[] = []

// ── AI Insights ────────────────────────────────────────────────────────────
export type AiInsight = {
  id: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  trend: "up" | "down" | "neutral"
  category: string
}
export const aiInsights: AiInsight[] = []

// ── Holdings (Investments) ─────────────────────────────────────────────────
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

// ── Watchlist Items ────────────────────────────────────────────────────────
export type WatchlistItem = {
  id: string
  symbol: string
  name: string
  currentPrice: number
  dayChange: number
  logo: string
  sparklineData: number[]
}
export const watchlistItems: WatchlistItem[] = []

// ── Portfolio History ──────────────────────────────────────────────────────
export type PortfolioHistoryPoint = { date: string; portfolio: number; sp500: number }
export const portfolioHistory: PortfolioHistoryPoint[] = []

// ── Budget Categories ──────────────────────────────────────────────────────
export type BudgetCategory = {
  id: string
  category: string
  iconName: string
  budget: number
  spent: number
  color: string
}
export const budgetCategories: BudgetCategory[] = []

// ── Savings Goals ──────────────────────────────────────────────────────────
export type SavingsGoal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  iconName: string
  monthlyContribution: number
}
export const savingsGoals: SavingsGoal[] = []

// ── Daily Spending ─────────────────────────────────────────────────────────
export type DailySpending = { date: string; amount: number }
export const dailySpending: DailySpending[] = []

// ── Bank Accounts ──────────────────────────────────────────────────────────
export type BankAccount = {
  id: string
  name: string
  type: "checking" | "savings" | "digital" | "investment" | "crypto" | "wallet"
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

// ── Transfer Records ───────────────────────────────────────────────────────
export type TransferRecord = {
  id: string
  recipientName: string
  recipientAvatar: string
  amount: number
  currency: string
  date: string
  status: "completed" | "pending" | "failed"
  type: "sent" | "received"
  method: string
}
export const transferRecords: TransferRecord[] = []

// ── Notifications ──────────────────────────────────────────────────────────
export type Notification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "transaction" | "security" | "system" | "budget"
  link?: string
}
export const notifications: Notification[] = []

// ── Crypto Coins ───────────────────────────────────────────────────────────
export type CryptoCoin = {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d: number
  marketCap: string
  volume24h: string
  holdings: number
  holdingsValue: number
  icon: string
  sparkline: number[]
}
export const cryptoCoins: CryptoCoin[] = []

// ── Crypto Transactions ────────────────────────────────────────────────────
export type CryptoTransaction = {
  id: string
  coinId: string
  type: "buy" | "sell" | "transfer"
  amount: number
  pricePerUnit: number
  totalValue: number
  date: string
  status: "completed" | "pending"
}
export const cryptoTransactions: CryptoTransaction[] = []

// ── Health Score ───────────────────────────────────────────────────────────
export type HealthFactor = {
  name: string
  score: number
  weight: number
  status: "good" | "warning" | "critical"
  recommendation: string
}
export const financialHealthScore = {
  overall: 100,
  trend: "up" as const,
  trendDelta: 0,
  factors: [] as HealthFactor[],
}

// ── FAQ ────────────────────────────────────────────────────────────────────
export type FaqItem = {
  id: string
  question: string
  answer: string
  category: "account" | "payments" | "security" | "billing" | "general"
}
export const faqItems: FaqItem[] = [
  { id: "faq1", category: "account", question: "Como adicionar uma nova conta bancária?", answer: "Acesse a aba Contas e clique em 'Nova Conta'. Preencha os dados e o saldo inicial para começar." },
  { id: "faq2", category: "payments", question: "Como registrar novas transações?", answer: "Use o botão '+' no topo ou acesse a página de Transações e clique em 'Nova Transação'." },
  { id: "faq3", category: "security", question: "Como meus dados são protegidos?", answer: "Seus dados são armazenados no Firebase Firestore com autenticação Google e regras de isolamento por usuário." },
  { id: "faq4", category: "general", question: "Como exportar meus lançamentos?", answer: "Na página Transações, selecione os lançamentos desejados e clique no botão 'Exportar CSV'." },
]

// ── Support Tickets ────────────────────────────────────────────────────────
export type SupportTicket = {
  id: string
  subject: string
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdate: string
}
export const supportTickets: SupportTicket[] = []

// ── System Status ──────────────────────────────────────────────────────────
export const systemStatus = [
  { name: "Sistema Principal", status: "operational" as const },
  { name: "Banco Firestore", status: "operational" as const },
  { name: "Autenticação", status: "operational" as const },
]

// ── Crypto Price History ───────────────────────────────────────────────────
export const cryptoPriceHistory: Array<{ time: string; btc: number; eth: number }> = []
