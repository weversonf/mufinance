// MuFinance React — direção Soft Swiss Fintech / editorial dashboard.
// Dados locais demonstrativos: BRL, português do Brasil e hierarquia visual inspirada na referência fornecida.

export type NavItem = {
  label: string;
  icon: string;
  section?: string;
  badge?: string;
};

export type TransactionStatus = "planned" | "completed";

export type Transaction = {
  id?: string;
  date: string;
  dateISO?: string;
  payee: string;
  category: string;
  account: string;
  destinationAccount?: string;
  destinationSourceId?: string;
  sourceType?: "account" | "credit-card";
  sourceId?: string;
  invoiceId?: string;
  billingKind?: "single" | "installment" | "subscription";
  billingCount?: number;
  billingIndex?: number;
  totalAmount?: number;
  amount: number;
  type: "income" | "expense" | "transfer";
  status?: TransactionStatus;
  settled?: boolean;
  settledAt?: string;
  settlementId?: string;
  p2pRole?: "send" | "request" | "payment";
  p2pStatus?: "pending" | "completed" | "rejected";
  p2pCounterpartName?: string;
  p2pRequestId?: string;
  p2pSenderUid?: string;
  p2pTargetUid?: string;
};

export const getTransactionStatus = (transaction: Pick<Transaction, "status" | "settled" | "sourceType">): TransactionStatus => transaction.status ?? (transaction.sourceType === "credit-card" && !transaction.settled ? "planned" : "completed");
export const transactionStatusLabel = (transaction: Pick<Transaction, "status" | "settled" | "sourceType">) => getTransactionStatus(transaction) === "planned" ? "Prevista" : "Realizada";

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

export type AccountTone = "mint" | "lavender" | "peach" | "blue";

export type Account = {
  name: string;
  number: string;
  value: string;
  balance: number;
  change: string;
  tone: AccountTone;
  icon: string;
};

export type VehicleType = "car" | "motorcycle";

export type VehicleProfile = {
  type: VehicleType;
  manufacturer: string;
  model: string;
  year: number;
  fuel: "Gasolina" | "Etanol" | "Diesel";
  city: string;
};

export type FinanceCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
  tone: "mint" | "blue" | "lavender" | "peach" | "coral";
  active: boolean;
  usage: number;
};

export type VehicleFuelEntry = {
  id: string;
  date: string;
  station: string;
  liters: number;
  amount: number;
  odometer: number;
  fuel: "Gasolina" | "Etanol" | "Diesel";
};

export type VehicleMaintenanceEntry = {
  id: string;
  date: string;
  title: string;
  workshop: string;
  amount: number;
  odometer: number;
  status: "concluída" | "agendada";
};

export type VehicleOdometerEntry = {
  id: string;
  date: string;
  odometer: number;
  note: string;
};

export const defaultFinanceCategories: FinanceCategory[] = [
  // Despesas vindas do seed padrão do index.html legado.
  { id: "category-supermarket", name: "Supermercado", type: "expense", tone: "peach", active: true, usage: 0 },
  { id: "category-food", name: "Alimentação", type: "expense", tone: "lavender", active: true, usage: 0 },
  { id: "category-transport", name: "Transporte", type: "expense", tone: "peach", active: true, usage: 0 },
  { id: "category-bills", name: "Contas e Utilidades", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "category-education", name: "Educação", type: "expense", tone: "lavender", active: true, usage: 0 },
  { id: "category-leisure", name: "Lazer", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "category-travel", name: "Viagem", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "category-shopping", name: "Compras", type: "expense", tone: "lavender", active: true, usage: 0 },
  { id: "category-subscriptions", name: "Assinaturas", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "category-alcohol", name: "Bebidas Alcoólicas", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "category-services", name: "Serviços", type: "expense", tone: "mint", active: true, usage: 0 },
  { id: "category-pet", name: "Pet", type: "expense", tone: "peach", active: true, usage: 0 },
  { id: "category-gift-expense", name: "Presente", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "category-taxes", name: "Impostos e Taxas", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "category-insurance", name: "Seguros", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "category-credit-card", name: "Cartão de Crédito", type: "expense", tone: "lavender", active: true, usage: 0 },
  { id: "category-vehicle", name: "Veículo", type: "expense", tone: "peach", active: true, usage: 0 },
  // Categorias que já faziam parte da versão React atual.
  { id: "category-housing", name: "Moradia", type: "expense", tone: "mint", active: true, usage: 0 },
  { id: "category-work", name: "Trabalho", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "category-other", name: "Outros", type: "expense", tone: "blue", active: true, usage: 0 },
  // Receitas vindas do seed padrão do index.html legado.
  { id: "category-salary", name: "Salário", type: "income", tone: "mint", active: true, usage: 0 },
  { id: "category-freelance", name: "Freelance", type: "income", tone: "blue", active: true, usage: 0 },
  { id: "category-investments", name: "Investimentos", type: "income", tone: "blue", active: true, usage: 0 },
  { id: "category-sales", name: "Vendas", type: "income", tone: "peach", active: true, usage: 0 },
  { id: "category-gift-income", name: "Presente", type: "income", tone: "coral", active: true, usage: 0 },
  { id: "category-refund", name: "Reembolso", type: "income", tone: "mint", active: true, usage: 0 },
  { id: "category-rent-income", name: "Aluguel Recebido", type: "income", tone: "lavender", active: true, usage: 0 },
  { id: "category-other-income", name: "Outros", type: "income", tone: "blue", active: true, usage: 0 },
  { id: "category-income", name: "Receitas", type: "income", tone: "mint", active: true, usage: 0 },
];

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
  { label: "Veículo", icon: "vehicle" },
  { label: "Metas", icon: "target" },
  { label: "Orçamento", icon: "wallet" },
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

export const accounts: Account[] = [
  { name: "Conta principal", number: "•••• 7045", value: "R$ 18.421,00", balance: 18421, change: "+2,4%", tone: "mint", icon: "bank" },
  { name: "Reserva de emergência", number: "•••• 2208", value: "R$ 9.640,00", balance: 9640, change: "+4,0%", tone: "lavender", icon: "sparkles" },
  { name: "Cartão Mu Platinum", number: "•••• 3391", value: "−R$ 842,00", balance: -842, change: "vence 28 ago", tone: "peach", icon: "card" },
  { name: "Caixinha viagem", number: "•••• 0117", value: "R$ 4.350,00", balance: 4350, change: "bloqueada", tone: "blue", icon: "target" },
];

export const creditCards: CreditCard[] = [
  { id: "mu-platinum", name: "Mu Platinum", last4: "3391", brand: "Mastercard", color: "ocean", balance: "R$ 842,00", dueDate: "vence em 28 ago", limit: 12000, closingDay: 20, dueDay: 28 },
  { id: "mu-travel", name: "Mu Travel", last4: "2208", brand: "Visa", color: "forest", balance: "R$ 1.284,90", dueDate: "vence em 04 set", limit: 18000, closingDay: 27, dueDay: 4 },
];

export const vehicleProfile: VehicleProfile = {
  type: "car",
  manufacturer: "Honda",
  model: "HR-V Touring",
  year: 2023,
  fuel: "Gasolina",
  city: "São Paulo",
};

export const budgets = [
  { label: "Moradia", value: "R$ 9,8K", limit: "R$ 12K", progress: 82, tone: "mint" },
  { label: "Alimentação", value: "R$ 6,2K", limit: "R$ 6K", progress: 100, tone: "coral" },
  { label: "Transporte", value: "R$ 4,4K", limit: "R$ 5K", progress: 87, tone: "lavender" },
  { label: "Assinaturas", value: "R$ 3,1K", limit: "R$ 4K", progress: 78, tone: "blue" },
];

export const transactions: Transaction[] = [
  { id: "tx-freelance", date: "12 ago", dateISO: "2026-08-12", payee: "Recebimento freelance", category: "Receitas", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 18420, type: "income", status: "completed" },
  { id: "tx-salary", date: "11 ago", dateISO: "2026-08-11", payee: "Folha de pagamento", category: "Moradia", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 9870, type: "expense", status: "completed" },
  { id: "tx-market", date: "11 ago", dateISO: "2026-08-11", payee: "Mercado Vila Madalena", category: "Alimentação", account: "Cartão •3391", sourceType: "credit-card", sourceId: "mu-platinum", invoiceId: "mu-platinum-2026-08", amount: 2840, type: "expense", status: "planned" },
  { id: "tx-mobility", date: "10 ago", dateISO: "2026-08-10", payee: "Cora mobilidade", category: "Transporte", account: "Cartão •3391", sourceType: "credit-card", sourceId: "mu-platinum", invoiceId: "mu-platinum-2026-08", amount: 1640, type: "expense", status: "planned" },
  { id: "tx-invoice", date: "09 ago", dateISO: "2026-08-09", payee: "Nota fiscal #0241", category: "Receitas", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 9200, type: "income", status: "completed" },
  { id: "tx-coworking", date: "08 ago", dateISO: "2026-08-08", payee: "Coworking Pinheiros", category: "Trabalho", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", amount: 1129, type: "expense", status: "completed" },
];

export const upcomingBills = [
  { label: "Cartão Mu Platinum", date: "28 ago", amount: "R$ 842,00", days: "2 dias", tone: "coral" },
  { label: "Aluguel do apartamento", date: "01 set", amount: "R$ 4.129,00", days: "5 dias", tone: "lavender" },
  { label: "Ferramentas de trabalho", date: "05 set", amount: "R$ 2.840,00", days: "9 dias", tone: "blue" },
  { label: "Imposto trimestral", date: "15 set", amount: "R$ 2.210,00", days: "19 dias", tone: "mint" },
];

export const vehicleFuelEntries: VehicleFuelEntry[] = [
  { id: "fuel-aug-1", date: "12 ago 2026", station: "Posto Ipiranga Vila Madalena", liters: 42.8, amount: 286.4, odometer: 48216, fuel: "Gasolina" },
  { id: "fuel-jul-2", date: "28 jul 2026", station: "Shell Faria Lima", liters: 38.2, amount: 254.9, odometer: 47784, fuel: "Gasolina" },
  { id: "fuel-jul-1", date: "13 jul 2026", station: "Auto Posto Pinheiros", liters: 40.1, amount: 267.3, odometer: 47396, fuel: "Gasolina" },
];

export const vehicleMaintenanceEntries: VehicleMaintenanceEntry[] = [
  { id: "maintenance-1", date: "03 ago 2026", title: "Troca de óleo e filtros", workshop: "Oficina Central", amount: 480, odometer: 48090, status: "concluída" },
  { id: "maintenance-2", date: "22 set 2026", title: "Revisão dos 50 mil km", workshop: "Agendada · Oficina Central", amount: 950, odometer: 50000, status: "agendada" },
];

export const vehicleOdometerEntries: VehicleOdometerEntry[] = [
  { id: "odo-1", date: "12 ago 2026", odometer: 48216, note: "Abastecimento" },
  { id: "odo-2", date: "28 jul 2026", odometer: 47784, note: "Viagem de trabalho" },
  { id: "odo-3", date: "13 jul 2026", odometer: 47396, note: "Abastecimento" },
];

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);

export const formatCompactBRL = (value: number) => {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}K`;
  return formatBRL(value);
};
