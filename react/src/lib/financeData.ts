// MuFinance React — direção Soft Swiss Fintech / editorial dashboard.
// Dados locais demonstrativos: BRL, português do Brasil e hierarquia visual inspirada na referência fornecida.

export type NavItem = {
  label: string;
  icon: string;
  section?: string;
  badge?: string;
};

export type Transaction = {
  id?: string;
  date: string;
  dateISO?: string;
  payee: string;
  category: string;
  account: string;
  sourceType?: "account" | "credit-card";
  sourceId?: string;
  invoiceId?: string;
  billingKind?: "single" | "installment" | "subscription";
  billingCount?: number;
  billingIndex?: number;
  totalAmount?: number;
  amount: number;
  type: "income" | "expense";
  settled?: boolean;
  settledAt?: string;
  settlementId?: string;
};

export type CardBrand = "Visa" | "Mastercard" | "Elo" | "Amex";
export type CardColor = "ocean" | "forest" | "plum" | "sunset" | "graphite";

export type CreditCard = {
  id: string;
  name: string;
  last4: string;
  brand: CardBrand;
  color: CardColor;
  balance: string;
  dueDate: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

export type CreditInvoice = {
  id: string;
  cardId: string;
  month: string;
  label: string;
  dueDate: string;
  closingDate: string;
};

export const navItems: NavItem[] = [
  { label: "Início", icon: "home" },
  { label: "Extrato", icon: "receipt", badge: "12" },
  { label: "Relatórios", icon: "chart" },
  { label: "Cartões", icon: "card" },
  { label: "Metas", icon: "target" },
  { label: "Orçamento", icon: "wallet" },
  { label: "Perfil", icon: "user", section: "Pessoal" },
  { label: "Configurações", icon: "settings" },
];

export const cashflowData = [
  { month: "Fev", income: 28600, expenses: 20900, net: 7700 },
  { month: "Mar", income: 33200, expenses: 23900, net: 9300 },
  { month: "Abr", income: 31800, expenses: 27100, net: 4700 },
  { month: "Mai", income: 40500, expenses: 29600, net: 10900 },
  { month: "Jun", income: 38200, expenses: 25500, net: 12700 },
  { month: "Jul", income: 44600, expenses: 31200, net: 13400 },
  { month: "Ago", income: 48200, expenses: 31760, net: 16440 },
];

export const spendingData = [
  { name: "Moradia", value: 9870, color: "#81cfc1" },
  { name: "Alimentação", value: 6210, color: "#a99bea" },
  { name: "Transporte", value: 4360, color: "#f4b37a" },
  { name: "Assinaturas", value: 3120, color: "#7bb9e7" },
  { name: "Outros", value: 8200, color: "#e8eaf0" },
];

export const accounts = [
  { name: "Conta principal", number: "•••• 7045", value: "R$ 18.421,00", change: "+2,4%", tone: "mint", icon: "bank" },
  { name: "Reserva de emergência", number: "•••• 2208", value: "R$ 9.640,00", change: "+4,0%", tone: "lavender", icon: "sparkles" },
  { name: "Cartão Mu Platinum", number: "•••• 3391", value: "−R$ 842,00", change: "vence 28 ago", tone: "peach", icon: "card" },
  { name: "Caixinha viagem", number: "•••• 0117", value: "R$ 4.350,00", change: "bloqueada", tone: "blue", icon: "target" },
];

export const creditCards: CreditCard[] = [
  { id: "mu-platinum", name: "Mu Platinum", last4: "3391", brand: "Mastercard", color: "ocean", balance: "R$ 842,00", dueDate: "vence em 28 ago", limit: 12000, closingDay: 20, dueDay: 28 },
  { id: "mu-travel", name: "Mu Travel", last4: "2208", brand: "Visa", color: "forest", balance: "R$ 1.284,90", dueDate: "vence em 04 set", limit: 18000, closingDay: 27, dueDay: 4 },
];

export const budgets = [
  { label: "Moradia", value: "R$ 9,8K", limit: "R$ 12K", progress: 82, tone: "mint" },
  { label: "Alimentação", value: "R$ 6,2K", limit: "R$ 6K", progress: 100, tone: "coral" },
  { label: "Transporte", value: "R$ 4,4K", limit: "R$ 5K", progress: 87, tone: "lavender" },
  { label: "Assinaturas", value: "R$ 3,1K", limit: "R$ 4K", progress: 78, tone: "blue" },
];

export const transactions: Transaction[] = [
  { id: "tx-freelance", date: "12 ago", dateISO: "2026-08-12", payee: "Recebimento freelance", category: "Receitas", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 18420, type: "income" },
  { id: "tx-salary", date: "11 ago", dateISO: "2026-08-11", payee: "Folha de pagamento", category: "Moradia", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 9870, type: "expense" },
  { id: "tx-market", date: "11 ago", dateISO: "2026-08-11", payee: "Mercado Vila Madalena", category: "Alimentação", account: "Cartão •3391", sourceType: "credit-card", sourceId: "mu-platinum", invoiceId: "mu-platinum-2026-08", amount: 2840, type: "expense" },
  { id: "tx-mobility", date: "10 ago", dateISO: "2026-08-10", payee: "Cora mobilidade", category: "Transporte", account: "Cartão •3391", sourceType: "credit-card", sourceId: "mu-platinum", invoiceId: "mu-platinum-2026-08", amount: 1640, type: "expense" },
  { id: "tx-invoice", date: "09 ago", dateISO: "2026-08-09", payee: "Nota fiscal #0241", category: "Receitas", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 9200, type: "income" },
  { id: "tx-coworking", date: "08 ago", dateISO: "2026-08-08", payee: "Coworking Pinheiros", category: "Trabalho", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 1129, type: "expense" },
];

export const upcomingBills = [
  { label: "Cartão Mu Platinum", date: "28 ago", amount: "R$ 842,00", days: "2 dias", tone: "coral" },
  { label: "Aluguel do apartamento", date: "01 set", amount: "R$ 4.129,00", days: "5 dias", tone: "lavender" },
  { label: "Ferramentas de trabalho", date: "05 set", amount: "R$ 2.840,00", days: "9 dias", tone: "blue" },
  { label: "Imposto trimestral", date: "15 set", amount: "R$ 2.210,00", days: "19 dias", tone: "mint" },
];

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);

export const formatCompactBRL = (value: number) => {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}K`;
  return formatBRL(value);
};
