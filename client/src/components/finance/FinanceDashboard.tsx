// Soft Swiss Fintech / editorial dashboard: farol MuFinance, rastro de maré nos dados, tipografia editorial e movimento curto.

// MuFinance — dashboard editorial Soft Swiss Fintech; o P2P mantém a mesma linguagem calma, responsiva e demonstrativa.
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  AtSign,
  Bell,
  Bike,
  CarFront,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { accounts, budgets, cashflowData, creditCards as initialCreditCards, defaultFinanceCategories, formatBRL, formatCompactBRL, getTransactionStatus, navItems, spendingData, transactionStatusLabel, transactions, upcomingBills, vehicleProfile as initialVehicleProfile, type Account, type CreditCard as CreditCardData, type FinanceCategory, type Transaction, type VehicleProfile } from "@/lib/financeData";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancePersistence } from "@/hooks/useFinancePersistence";
import { ActionDialog } from "./ActionDialog";
import { CardWallet, type NewCreditCardPayload } from "./CardWallet";
import { CardDetailsDialog, type CardHistoryPeriod } from "./CardDetailsDialog";
import { P2PDialog, type P2PActivity, type P2PContact, type P2PRequest } from "./P2PDialog";
import { SettingsPanel, type DangerAction } from "./SettingsPanel";
import { StatementPage } from "./StatementPage";
import { NewTransactionPayload, TransactionModal } from "./TransactionModal";
import { VehiclePage } from "./VehiclePage";

type IconName = "home" | "receipt" | "chart" | "card" | "vehicle" | "target" | "wallet" | "user" | "settings" | "bank" | "sparkles";
type ActionPanel = "transfer" | "deposit" | "pay-bills" | "schedule" | "report" | "accounts" | "account-edit" | "card-edit" | "budget" | "transaction" | "about" | "support" | "privacy" | "insights" | "settings" | "session" | null;
type ViewMode = "dashboard" | "statement" | "vehicle";
type ProfileData = { name: string; email: string; username: string; usernameChangedAt: string | null };
type SearchItem = { label: string; nav: string; anchor: string };
type SupportView = "home" | "help" | "contact";

const iconMap: Record<IconName, typeof Home> = {
  home: Home,
  receipt: FileText,
  chart: TrendingUp,
  card: CreditCard,
  vehicle: CarFront,
  target: Target,
  wallet: Wallet,
  user: UserRound,
  settings: Settings,
  bank: Landmark,
  sparkles: Sparkles,
};

const pageVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.48 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } } };
const child = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.42 } } };

const kpis = [
  { label: "Saldo total", value: "R$ 32.540", delta: "+3,1%", icon: Wallet, tone: "mint" },
  { label: "Receitas do mês", value: "R$ 4.820", delta: "+4,0%", icon: ArrowDownLeft, tone: "blue" },
  { label: "Despesas do mês", value: "R$ 3.176", delta: "+6,7%", icon: ArrowUpRight, tone: "lavender", negative: true },
  { label: "Taxa de economia", value: "34%", delta: "+1,5%", icon: Sparkles, tone: "peach" },
];

const navAnchors: Record<string, string> = { Início: "overview", Extrato: "transactions", Relatórios: "spending", Cartões: "cards", Metas: "budget", Orçamento: "budget" };
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const profileEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const profileUsernamePattern = /^[a-zA-Z0-9_.]{3,20}$/;
const chartFallback = [
  { income: 30400, expenses: 22600 },
  { income: 31500, expenses: 23100 },
  { income: 32800, expenses: 24400 },
  { income: 34700, expenses: 25800 },
  { income: 36900, expenses: 27400 },
  { income: 39200, expenses: 28800 },
  { income: 42100, expenses: 30100 },
  { income: 43800, expenses: 31600 },
  { income: 45200, expenses: 32900 },
  { income: 46600, expenses: 33700 },
  { income: 48100, expenses: 34800 },
  { income: 49700, expenses: 35900 },
];
const searchItems: SearchItem[] = [
  { label: "Visão geral", nav: "Início", anchor: "overview" },
  { label: "Últimos lançamentos", nav: "Extrato", anchor: "transactions" },
  { label: "Gastos por categoria", nav: "Relatórios", anchor: "spending" },
  { label: "Sua carteira", nav: "Cartões", anchor: "cards" },
  { label: "Uso dos envelopes", nav: "Orçamento", anchor: "budget" },
  { label: "Contas a pagar", nav: "Orçamento", anchor: "bills" },
];

const demoP2PContacts: P2PContact[] = [
  { id: "p2p-ana", name: "Ana Ribeiro", username: "@ana.ribeiro", initials: "AR", tone: "mint" },
  { id: "p2p-caio", name: "Caio Mendes", username: "@caio.mendes", initials: "CM", tone: "lavender" },
  { id: "p2p-luiza", name: "Luiza Campos", username: "@luiza.campos", initials: "LC", tone: "peach" },
  { id: "p2p-rafa", name: "Rafael Nunes", username: "@rafa.nunes", initials: "RN", tone: "blue" },
];

const navIcon = (name: string, vehicleType: VehicleProfile["type"] = "car") => {
  if (name === "vehicle" && vehicleType === "motorcycle") return <Bike size={17} strokeWidth={1.8} />;
  const Icon = iconMap[name as IconName] ?? LayoutDashboard;
  return <Icon size={17} strokeWidth={1.8} />;
};

function parseAmount(value: string) {
  return Number(value.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
}

function resolveAccountName(option: string | undefined, currentAccounts: Account[]) {
  if (!option) return null;
  const digits = option.replace(/\D/g, "");
  return currentAccounts.find((account) => option === account.name || option.startsWith(`${account.name} `) || (digits.length >= 4 && account.number.replace(/\D/g, "") === digits))?.name ?? null;
}

function updateTransferBalances(currentAccounts: Account[], transaction: Transaction, multiplier = 1) {
  if (transaction.type !== "transfer" || getTransactionStatus(transaction) !== "completed") return currentAccounts;
  const sourceName = resolveAccountName(transaction.sourceId ?? transaction.account, currentAccounts);
  const destinationName = resolveAccountName(transaction.destinationAccount, currentAccounts);
  if (!sourceName || !destinationName || sourceName === destinationName) return currentAccounts;
  const amount = transaction.amount * multiplier;
  return currentAccounts.map((account) => {
    if (account.name === sourceName) {
      const balance = account.balance - amount;
      return { ...account, balance, value: formatBRL(balance) };
    }
    if (account.name === destinationName) {
      const balance = account.balance + amount;
      return { ...account, balance, value: formatBRL(balance) };
    }
    return account;
  });
}

export default function FinanceDashboard() {
  const [activeNav, setActiveNav] = useState("Início");
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileFabOpen, setMobileFabOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("6M");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<"month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState(7);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionPreset, setTransactionPreset] = useState<Transaction["type"]>("expense");
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);
  const [localAccounts, setLocalAccounts] = useState<Account[]>(accounts);
  const [localCreditCards, setLocalCreditCards] = useState<CreditCardData[]>(initialCreditCards);
  const [localVehicle, setLocalVehicle] = useState<VehicleProfile>(initialVehicleProfile);
  const [localCategories, setLocalCategories] = useState<FinanceCategory[]>(defaultFinanceCategories);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [actionPanel, setActionPanel] = useState<ActionPanel>(null);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paidBills, setPaidBills] = useState<string[]>([]);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | Transaction["type"]>("all");
  const [transactionCategoryFilter, setTransactionCategoryFilter] = useState("Todas");
  const [compactMode, setCompactMode] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDestination, setTransferDestination] = useState(accounts.find((item) => item.icon !== "card" && item.name !== "Conta principal")?.name ?? "Conta principal");
  const [depositAmount, setDepositAmount] = useState("");
  const [scheduleDate, setScheduleDate] = useState("2026-08-28");
  const [budgetAdjusted, setBudgetAdjusted] = useState(false);
  const [accountConnected, setAccountConnected] = useState(false);
  const [scheduledReminder, setScheduledReminder] = useState<string | null>(null);
  const [supportView, setSupportView] = useState<SupportView>("home");
  const [supportMessage, setSupportMessage] = useState("");
  const [sessionActive, setSessionActive] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", username: "", usernameChangedAt: null });
  const [accountBalanceAdjustment, setAccountBalanceAdjustment] = useState(0);
  const [cardDetails, setCardDetails] = useState<CreditCardData | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCardData | null>(null);
  const [p2pOpen, setP2POpen] = useState(false);
  const [p2pRequests, setP2PRequests] = useState<P2PRequest[]>([
    { id: "p2p-request-demo", direction: "incoming", contact: demoP2PContacts[0], amount: 220, description: "Jantar de sexta", dateLabel: "hoje", status: "pending" },
  ]);
  const [p2pActivities, setP2PActivities] = useState<P2PActivity[]>([
    { id: "p2p-activity-demo", mode: "send", contact: demoP2PContacts[1], amount: 84.9, description: "Café e transporte", dateLabel: "ontem", status: "completed" },
  ]);
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!user) return;
    const emailName = user.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Usuário";
    setProfile((current) => ({
      ...current,
      email: current.email || user.email || "",
      name: current.name || user.displayName || emailName,
      username: current.username || user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 20) || "usuario",
    }));
  }, [user?.uid, user?.displayName, user?.email]);
  const { storageError } = useFinancePersistence({
    user,
    localTransactions,
    setLocalTransactions,
    localAccounts,
    setLocalAccounts,
    localCreditCards,
    setLocalCreditCards,
    localVehicle,
    setLocalVehicle,
    localCategories,
    setLocalCategories,
    paidBills,
    setPaidBills,
    profile,
    setProfile,
    p2pRequests,
    setP2PRequests,
    p2pActivities,
    setP2PActivities,
    accountBalanceAdjustment,
    setAccountBalanceAdjustment,
    compactMode,
    setCompactMode,
    alertsEnabled,
    setAlertsEnabled,
  });

  useEffect(() => {
    if (storageError) toast.error(storageError);
  }, [storageError]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Pesquisar ou ir para"]')?.focus();
      }
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarCollapsed((current) => !current);
        setMobileOpen(false);
      }
      if (event.key === "Escape") {
        setPeriodOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, []);

  const chartMuted = theme === "dark" ? "#9aaabd" : "#9aa2b4";
  const chartGrid = theme === "dark" ? "#2b3849" : "#eef0f5";
  const chartData = useMemo(() => {
    const count = timeRange === "YTD" ? 12 : timeRange === "12M" ? 12 : 6;
    const startOffset = timeRange === "YTD" ? -selectedMonth : -1;
    const start = new Date(selectedYear, selectedMonth + startOffset, 1);

    return Array.from({ length: count }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      const monthIndex = date.getMonth();
      const month = monthNames[monthIndex].slice(0, 3);
      const knownPoint = date.getFullYear() === 2026 ? cashflowData.find((item) => item.month === month) : undefined;
      const fallback = chartFallback[monthIndex];
      const yearFactor = 1 + (date.getFullYear() - 2026) * 0.035;
      const income = Math.round((knownPoint?.income ?? fallback.income) * yearFactor);
      const expenses = Math.round((knownPoint?.expenses ?? fallback.expenses) * yearFactor);

      return {
        month,
        periodLabel: `${month} ${date.getFullYear()}`,
        income,
        expenses,
        net: income - expenses,
        isReference: date.getFullYear() === selectedYear && monthIndex === selectedMonth,
      };
    });
  }, [selectedMonth, selectedYear, timeRange]);
  const referenceMonth = chartData.find((item) => item.isReference)?.month;
  const selectedPeriod = periodMode === "year" ? `Ano ${selectedYear}` : `${monthNames[selectedMonth]} ${selectedYear}`;
  const periodTransactions = localTransactions.filter((item) => {
    if (!item.dateISO) return true;
    const date = new Date(`${item.dateISO}T12:00:00`);
    return periodMode === "year" ? date.getFullYear() === selectedYear : date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
  });
  const transactionCategories = ["Todas"].concat(periodTransactions.map((item) => item.category).filter((category, index, list) => list.indexOf(category) === index));
  const filteredTransactions = periodTransactions.filter((item) => (transactionTypeFilter === "all" || item.type === transactionTypeFilter) && (transactionCategoryFilter === "Todas" || item.category === transactionCategoryFilter));
  const searchResults = searchItems.filter((item) => item.label.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 5);
  const activeCategoryOptions = useMemo(() => localCategories.filter((item) => item.active).map((item) => item.name), [localCategories]);
  const transactionAccountOptions = useMemo(() => Array.from(new Set(localAccounts.filter((item) => item.icon !== "card").map((item) => `${item.name} ${item.number}`).concat(localTransactions.filter((item) => item.sourceType !== "credit-card" && !item.account.toLowerCase().includes("cartão")).map((item) => item.account)))), [localAccounts, localTransactions]);
  const dashboardKpis = useMemo(() => {
    const totalBalance = localAccounts.filter((item) => item.icon !== "card").reduce((sum, item) => sum + item.balance, 0);
    return kpis.map((item) => item.label === "Saldo total" ? { ...item, value: formatBRL(totalBalance) } : item);
  }, [localAccounts]);
  const usernameLockDaysRemaining = useMemo(() => {
    if (!profile.usernameChangedAt) return 0;
    const elapsedDays = Math.floor((Date.now() - new Date(profile.usernameChangedAt).getTime()) / 86400000);
    return Math.max(0, 90 - elapsedDays);
  }, [profile.usernameChangedAt]);

  const closePanels = () => { setActionPanel(null); setSelectedBill(null); setSelectedAccount(null); setSelectedTransaction(null); setEditingCard(null); };
  const scrollTo = (anchor: string) => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const action = (message: string, description = "Alteração aplicada nesta sessão.") => toast.success(message, { description });
  const shiftPeriod = (direction: -1 | 1) => {
    if (periodMode === "year") {
      setSelectedYear((year) => year + direction);
      action("Ano atualizado", String(selectedYear + direction));
      return;
    }
    const nextDate = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(nextDate.getMonth());
    setSelectedYear(nextDate.getFullYear());
    action("Mês atualizado", `${monthNames[nextDate.getMonth()]} ${nextDate.getFullYear()}`);
  };
  const handleNavSelect = (label: string) => {
    setActiveNav(label);
    setMobileOpen(false);
    setMobileFabOpen(false);
    closePanels();
    if (label === "Início") { setCurrentView("dashboard"); return; }
    if (label === "Extrato") { setCurrentView("statement"); return; }
    if (label === "Perfil") { setActionPanel("about"); return; }
    if (label === "Configurações") { setActionPanel("settings"); return; }
    if (label === "Insights") { setActionPanel("insights"); return; }
    if (label === "Veículo") { setCurrentView("vehicle"); return; }
    setCurrentView("dashboard");
    if (label === "Exportar dados") { exportTransactions(); return; }
    const anchor = navAnchors[label];
    if (anchor) window.setTimeout(() => scrollTo(anchor), 40);
  };
  const handleVehicleAction = (label: string) => action("Veículo", `${label} registrado nesta sessão demonstrativa.`);
  const handleProfileSave = (nextProfile: ProfileData) => {
    const name = nextProfile.name.trim();
    const email = nextProfile.email.trim().toLowerCase();
    const username = nextProfile.username.trim().replace(/^@/, "").toLowerCase();
    const usernameChanged = username !== profile.username;
    if (name.length < 2 || !profileEmailPattern.test(email) || !profileUsernamePattern.test(username)) {
      action("Revise os dados do perfil", "Confira nome, e-mail e identificador público antes de salvar.");
      return;
    }
    if (usernameChanged && usernameLockDaysRemaining > 0) {
      action("Identificador temporariamente bloqueado", `Você poderá alterá-lo novamente em ${usernameLockDaysRemaining} ${usernameLockDaysRemaining === 1 ? "dia" : "dias"}.`);
      return;
    }
    if (usernameChanged && demoP2PContacts.some((contact) => contact.username.slice(1).toLowerCase() === username)) {
      action("Identificador indisponível", "Esse @usuário já está reservado no diretório demonstrativo.");
      return;
    }
    setProfile({ name, email, username, usernameChangedAt: usernameChanged ? new Date().toISOString() : profile.usernameChangedAt });
    closePanels();
    action("Perfil atualizado", usernameChanged ? "O @usuário foi alterado e ficará bloqueado por 90 dias." : "Nome e e-mail salvos nesta sessão.");
  };
  const handleCreateCategory = (name: string, type: FinanceCategory["type"], tone: FinanceCategory["tone"]) => {
    const duplicate = localCategories.some((item) => item.type === type && item.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (duplicate) { action("Categoria já existe", "Escolha outro nome para evitar categorias duplicadas."); return; }
    setLocalCategories((current) => [...current, { id: `category-${Date.now()}`, name, type, tone, active: true, usage: 0 }]);
    action("Categoria criada", `${name} ficará disponível nos próximos lançamentos.`);
  };
  const handleUpdateCategory = (id: string, name: string, tone: FinanceCategory["tone"]) => {
    const current = localCategories.find((item) => item.id === id);
    if (!current) return;
    const duplicate = localCategories.some((item) => item.id !== id && item.type === current.type && item.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (duplicate) { action("Nome já utilizado", "Mantenha nomes únicos dentro do mesmo tipo de categoria."); return; }
    setLocalCategories((items) => items.map((item) => item.id === id ? { ...item, name, tone } : item));
    setLocalTransactions((items) => items.map((item) => item.category === current.name ? { ...item, category: name } : item));
    action("Categoria atualizada", "O histórico também foi ajustado para refletir o novo nome.");
  };
  const handleToggleCategory = (id: string) => {
    const current = localCategories.find((item) => item.id === id);
    if (!current) return;
    setLocalCategories((items) => items.map((item) => item.id === id ? { ...item, active: !item.active } : item));
    action(current.active ? "Categoria desativada" : "Categoria ativada", current.active ? "Ela não aparecerá em novos lançamentos, mas o histórico foi preservado." : "Ela voltou a aparecer no modal de lançamento.");
  };
  const handleDeleteCategory = (id: string) => {
    const current = localCategories.find((item) => item.id === id);
    if (!current) return;
    if (current.usage > 0 || localTransactions.some((item) => item.category === current.name)) { action("Categoria preservada", "Ela possui lançamentos vinculados. Desative-a para manter o histórico íntegro."); return; }
    setLocalCategories((items) => items.filter((item) => item.id !== id));
    action("Categoria excluída", `${current.name} foi removida desta sessão.`);
  };
  const handleDangerAction = (dangerAction: DangerAction) => {
    if (dangerAction === "remove-duplicates") {
      setLocalTransactions((items) => { const seen = new Set<string>(); return items.filter((item) => { const key = `${item.dateISO ?? item.date}|${item.payee}|${item.amount}|${item.category}`; if (seen.has(key)) return false; seen.add(key); return true; }); });
      action("Duplicados revisados", "Lançamentos repetidos foram removidos desta sessão demonstrativa.");
      return;
    }
    if (dangerAction === "clear-history") {
      setLocalTransactions([]);
      action("Histórico limpo", "As categorias e carteiras foram preservadas para você recomeçar.");
      return;
    }
    setLocalTransactions(transactions);
    setLocalAccounts(accounts);
    setLocalCreditCards(initialCreditCards);
    setLocalVehicle(initialVehicleProfile);
    setLocalCategories(defaultFinanceCategories);
    setPaidBills([]);
    setAccountBalanceAdjustment(0);
    action("Sessão restaurada", "Os dados demonstrativos voltaram ao estado inicial.");
  };
  const exportTransactions = () => {
    const csv = [["Data", "Descrição", "Categoria", "Conta", "Destino", "Tipo", "Status", "Valor"], ...localTransactions.map((item) => [item.date, item.payee, item.category, item.account, item.destinationAccount ?? "", item.type === "income" ? "Receita" : item.type === "transfer" ? "Transferência" : "Despesa", transactionStatusLabel(item), item.amount.toFixed(2).replace(".", ",")])].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mufinance-transacoes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    action("Extrato exportado", `${localTransactions.length} lançamentos foram baixados em CSV.`);
  };
  const exportCardHistory = (card: CreditCardData, period: CardHistoryPeriod, items: Transaction[]) => {
    const label = period === "all" ? "historico" : period;
    const rows = [["Data", "Descrição", "Categoria", "Cartão", "Fatura", "Status", "Valor"], ...items.map((item) => [item.date, item.payee, item.category, `${card.name} •••• ${card.last4}`, item.invoiceId ?? "", item.settled ? "Baixado" : transactionStatusLabel(item), item.amount.toFixed(2).replace(".", ",")])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mufinance-${card.id}-${label}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    action("Histórico exportado", `${items.length} lançamentos de ${card.name} foram baixados em CSV.`);
  };
  const openNewTransaction = (presetOrEvent?: Transaction["type"] | React.MouseEvent<HTMLButtonElement>) => {
    const preset = typeof presetOrEvent === "string" ? presetOrEvent : "expense";
    setEditingTransaction(null);
    setTransactionPreset(preset);
    setTransactionModalOpen(true);
  };
  const addTransaction = (transaction: NewTransactionPayload, editing?: Transaction | null) => {
    if (editing) {
      const nextTransaction = { ...editing, ...transaction };
      setLocalTransactions((current) => current.map((item) => item === editing ? nextTransaction : item));
      setLocalAccounts((current) => updateTransferBalances(updateTransferBalances(current, editing, -1), nextTransaction));
      setEditingTransaction(null);
      setTransactionModalOpen(false);
      action("Transação atualizada", `${transaction.payee} · ${formatBRL(transaction.amount)}`);
      return;
    }
    const baseDate = transaction.dateISO ? new Date(`${transaction.dateISO}T12:00:00`) : new Date(2026, 7, 13);
    const count = transaction.billingKind === "single" || !transaction.billingCount ? 1 : transaction.billingCount;
    const amountPerOccurrence = transaction.billingKind === "installment" ? transaction.amount / count : transaction.amount;
    const generated = Array.from({ length: count }, (_, index) => {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, baseDate.getDate());
      const dateISO = date.toISOString().slice(0, 10);
      const monthLabel = `${monthNames[date.getMonth()].slice(0, 3).toLowerCase()} ${String(date.getFullYear()).slice(-2)}`;
      return { ...transaction, id: `${Date.now()}-${index}`, amount: amountPerOccurrence, totalAmount: transaction.amount, billingIndex: count > 1 ? index + 1 : undefined, billingCount: count > 1 ? count : undefined, dateISO, date: `${monthLabel}`, invoiceId: transaction.sourceType === "credit-card" ? `${transaction.sourceId}-${dateISO.slice(0, 7)}` : undefined };
    });
    setLocalTransactions((current) => [...generated, ...current]);
    setLocalAccounts((current) => generated.reduce((nextAccounts, item) => updateTransferBalances(nextAccounts, item), current));
    setTransactionModalOpen(false);
    action(count > 1 ? "Lançamentos programados" : "Transação adicionada", count > 1 ? `${count} ocorrências de ${transaction.payee} foram adicionadas.` : `${transaction.payee} · ${formatBRL(transaction.amount)}`);
  };
  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };
  const addCreditCard = (card: NewCreditCardPayload) => {
    setLocalCreditCards((current) => current.concat({ ...card, id: `card-${Date.now()}` }));
    action("Cartão adicionado", `${card.name} · ${card.brand}`);
  };
  const updateAccount = (nextAccount: Account) => {
    const name = nextAccount.name.trim();
    const number = `•••• ${nextAccount.number.replace(/\D/g, "").slice(-4).padStart(4, "0")}`;
    const balance = Number.isFinite(nextAccount.balance) ? nextAccount.balance : 0;
    const previousName = selectedAccount ?? nextAccount.name;
    setLocalAccounts((current) => current.map((item) => item.name === previousName ? { ...nextAccount, name, number, balance, value: formatBRL(balance) } : item));
    setSelectedAccount(name);
    setSelectedBill(null);
    setSelectedTransaction(null);
    setEditingCard(null);
    setActionPanel("accounts");
    action("Conta atualizada", `${name} · saldo ajustado para ${formatBRL(balance)}.`);
  };
  const updateCard = (nextCard: CreditCardData) => {
    setLocalCreditCards((current) => current.map((item) => item.id === nextCard.id ? { ...nextCard, balance: item.balance, dueDate: `vence em ${String(nextCard.dueDay).padStart(2, "0")} ago` } : item));
    setEditingCard(null);
    closePanels();
    action("Cartão atualizado", `${nextCard.name} · limite de ${formatBRL(nextCard.limit)}.`);
  };
  const openCardEditor = (card: CreditCardData) => {
    setCardDetails(null);
    setEditingCard(card);
    setActionPanel("card-edit");
  };
  const payCardInvoice = (card: CreditCardData, month: string, amount: number, transactionIds: string[]) => {
    if (!transactionIds.length || amount <= 0) return;
    const settlementId = `settlement-${card.id}-${month}`;
    const paidAt = "2026-08-13";
    setLocalTransactions((current) => current.map((item) => transactionIds.includes(item.id ?? "") ? { ...item, status: "completed", settled: true, settledAt: paidAt, settlementId } : item));
    setAccountBalanceAdjustment((current) => current - amount);
    setCardDetails(null);
    action("Fatura paga", `${card.name} · ${formatBRL(amount)} debitados da Conta principal e lançamentos baixados.`);
  };
  const addP2PTransaction = (contact: P2PContact, amount: number, description: string, mode: "send" | "request" | "payment") => {
    const isExpense = mode === "send" || mode === "payment";
    const id = `p2p-${mode}-${Date.now()}`;
    const transaction: Transaction = { id, date: "13 ago", dateISO: "2026-08-13", payee: `${mode === "payment" ? "Pagamento para" : mode === "send" ? "Envio para" : "Cobrança de"} ${contact.name}`, category: "P2P", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", type: isExpense ? "expense" : "income", status: "completed", amount, p2pRole: mode, p2pStatus: mode === "request" ? "pending" : "completed", p2pCounterpartName: contact.name };
    setLocalTransactions((current) => [transaction, ...current]);
    if (isExpense) setAccountBalanceAdjustment((current) => current - amount);
  };
  const handleP2PSend = (contact: P2PContact, amount: number, description: string) => {
    addP2PTransaction(contact, amount, description, "send");
    setP2PActivities((current) => [{ id: `p2p-activity-${Date.now()}`, mode: "send", contact, amount, description, dateLabel: "agora", status: "completed" }, ...current]);
    setP2POpen(false);
    action("Dinheiro enviado", `${formatBRL(amount)} enviados para ${contact.name}.`);
  };
  const handleP2PRequest = (contact: P2PContact, amount: number, description: string) => {
    const requestId = `p2p-request-${Date.now()}`;
    addP2PTransaction(contact, amount, description, "request");
    setP2PRequests((current) => [{ id: requestId, direction: "outgoing", contact, amount, description, dateLabel: "agora", status: "pending" }, ...current]);
    setP2PActivities((current) => [{ id: `p2p-activity-${Date.now()}`, mode: "request", contact, amount, description, dateLabel: "agora", status: "pending" }, ...current]);
    setP2POpen(false);
    action("Cobrança enviada", `${formatBRL(amount)} solicitados a ${contact.name}.`);
  };
  const handleP2PAccept = (request: P2PRequest) => {
    addP2PTransaction(request.contact, request.amount, request.description, "payment");
    setP2PRequests((current) => current.filter((item) => item.id !== request.id));
    setP2PActivities((current) => [{ id: `p2p-activity-${Date.now()}`, mode: "request", contact: request.contact, amount: request.amount, description: request.description, dateLabel: "agora", status: "completed" }, ...current]);
    action("Cobrança aceita", `${formatBRL(request.amount)} debitados da Conta principal.`);
  };
  const handleP2PReject = (request: P2PRequest) => {
    setP2PRequests((current) => current.filter((item) => item.id !== request.id));
    setP2PActivities((current) => [{ id: `p2p-activity-${Date.now()}`, mode: "request", contact: request.contact, amount: request.amount, description: request.description, dateLabel: "agora", status: "rejected" }, ...current]);
    action("Cobrança recusada", `A solicitação de ${request.contact.name} foi removida.`);
  };
  const submitTransfer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseAmount(transferAmount);
    if (!Number.isFinite(amount) || amount <= 0) { action("Digite um valor válido", "A transferência não foi enviada."); return; }
    const source = transactionAccountOptions[0] ?? "Conta principal •••• 7045";
    const transfer: Transaction = { id: `transfer-${Date.now()}`, date: "13 ago", dateISO: "2026-08-13", payee: `Transferência para ${transferDestination}`, category: "Transferência entre contas", account: source, destinationAccount: transferDestination, sourceType: "account", sourceId: source, type: "transfer", status: "completed", amount };
    const destination = resolveAccountName(transferDestination, localAccounts);
    const sourceName = resolveAccountName(source, localAccounts);
    if (!destination || !sourceName || destination === sourceName) { action("Escolha outra conta", "A origem e o destino precisam ser diferentes."); return; }
    setLocalTransactions((current) => [transfer, ...current]);
    setLocalAccounts((current) => updateTransferBalances(current, transfer));
    setTransferAmount("");
    closePanels();
    action("Transferência agendada", `${formatBRL(amount)} para ${transferDestination}.`);
  };
  const submitDeposit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseAmount(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) { action("Digite um valor válido", "O depósito não foi preparado."); return; }
    setLocalTransactions((current) => [{ id: `deposit-${Date.now()}`, date: "13 ago", dateISO: "2026-08-13", payee: "Depósito PIX", category: "Receitas", account: "Conta •7045", sourceType: "account", sourceId: "Conta •7045", type: "income", status: "completed", amount }, ...current]);
    setDepositAmount("");
    closePanels();
    action("Depósito preparado", `Entrada de ${formatBRL(amount)} adicionada ao plano.`);
  };
  const markBillAsPaid = () => {
    if (!selectedBill) return;
    setPaidBills((current) => current.indexOf(selectedBill) >= 0 ? current : current.concat(selectedBill));
    closePanels();
    action("Conta marcada como paga", selectedBill);
  };
  const deleteSelectedTransaction = () => {
    if (!selectedTransaction) return;
    setLocalTransactions((current) => current.filter((item) => !(item.date === selectedTransaction.date && item.payee === selectedTransaction.payee && item.amount === selectedTransaction.amount)));
    closePanels();
    action("Lançamento removido", `${selectedTransaction.payee} foi retirado da atividade local.`);
  };
  const duplicateSelectedTransaction = () => {
    if (!selectedTransaction) return;
    setLocalTransactions((current) => [{ ...selectedTransaction, id: `copy-${Date.now()}`, date: "13 ago", dateISO: "2026-08-13", payee: `${selectedTransaction.payee} (cópia)` }, ...current]);
    closePanels();
    action("Lançamento duplicado", "A cópia foi inserida no topo da atividade.");
  };
  const handleConnectAccount = () => {
    setAccountConnected(true);
    action("Conta conectada", "A conta demonstrativa foi adicionada nesta sessão.");
  };
  const handleSchedule = () => {
    setScheduledReminder(scheduleDate);
    closePanels();
    action("Compromisso agendado", `Lembrete criado para ${scheduleDate}.`);
  };
  const handleSupportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supportMessage.trim()) {
      action("Escreva uma mensagem", "O suporte precisa de um contexto para continuar.");
      return;
    }
    setSupportMessage("");
    setSupportView("home");
    closePanels();
    action("Mensagem enviada", "O atendimento foi registrado nesta sessão demonstrativa.");
  };
  const handleLogout = () => {
    void logout();
  };
  const handleLogin = () => {
    setSessionActive(true);
    closePanels();
    action("Sessão reaberta", "Você voltou ao espaço MuFinance desta sessão.");
  };

  return (
    <div className={`app-shell ${compactMode ? "app-shell--compact" : ""} ${hideValues ? "app-shell--values-hidden" : ""}`}>
      <AnimatePresence>{mobileOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}</AnimatePresence>
          <Sidebar profile={profile} vehicleType={localVehicle.type} collapsed={sidebarCollapsed} mobileOpen={mobileOpen} activeNav={activeNav} onSelect={handleNavSelect} onCollapse={() => setSidebarCollapsed((value) => !value)} onExport={exportTransactions} />

      <main className={`main-area ${sidebarCollapsed ? "main-area--wide" : ""}`}>
        <TopBar profile={profile} valuesHidden={hideValues} onToggleValues={() => setHideValues((value) => !value)} onMenu={() => setMobileOpen(true)} notificationsOpen={notificationsOpen} onNotificationsToggle={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} profileOpen={profileOpen} onProfileToggle={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} sessionActive={sessionActive} onLogout={handleLogout} onLogin={handleLogin} onOpenPanel={setActionPanel} globalSearch={globalSearch} onSearchChange={setGlobalSearch} searchResults={searchResults} onSearchSelect={(item) => { setGlobalSearch(""); setActiveNav(item.nav); scrollTo(item.anchor); }} />

        <motion.div className="dashboard-content" initial="hidden" animate="visible" variants={pageVariants}>
          {currentView === "statement" && <StatementPage transactions={filteredTransactions} periodLabel={selectedPeriod} onBack={() => { setCurrentView("dashboard"); setActiveNav("Início"); }} onEdit={editTransaction} onExport={exportTransactions} />}
          {currentView === "vehicle" && <VehiclePage vehicle={localVehicle} onVehicleUpdate={setLocalVehicle} onBack={() => { setCurrentView("dashboard"); setActiveNav("Início"); }} onAction={handleVehicleAction} />}
          {currentView === "dashboard" && <>
          <section id="overview" className="page-heading"><div><div className="breadcrumb"><Home size={13} /> <span>Início</span> <ChevronRight size={13} /> <strong>Visão geral</strong></div><div className="heading-row"><div><p className="eyebrow">QUARTA-FEIRA, 13 DE AGOSTO</p><h1>Olá, {profile.name.trim().split(/\s+/)[0] || "usuário"}.</h1><p className="page-subtitle">Seu dinheiro está encontrando um ritmo melhor.</p></div><div className="heading-actions"><div className="period-select-wrap"><div className="period-controls"><button className="period-arrow" type="button" onClick={() => shiftPeriod(-1)} aria-label="Período anterior" title="Período anterior"><ChevronLeft size={15} /></button><button className="soft-button period-button" type="button" onClick={() => setPeriodOpen((value) => !value)}><CalendarDays size={15} /> {selectedPeriod} <ChevronDown size={15} /></button><button className="period-arrow" type="button" onClick={() => shiftPeriod(1)} aria-label="Próximo período" title="Próximo período"><ChevronRight size={15} /></button></div><AnimatePresence>{periodOpen && <motion.div className="period-menu period-menu--calendar" initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.97 }}><div className="period-tabs"><button className={periodMode === "month" ? "is-active" : ""} onClick={() => setPeriodMode("month")}>Mês</button><button className={periodMode === "year" ? "is-active" : ""} onClick={() => setPeriodMode("year")}>Ano</button></div>{periodMode === "month" ? <div className="period-months">{monthNames.map((month, index) => <button key={month} className={selectedMonth === index ? "is-selected" : ""} onClick={() => { setSelectedMonth(index); setPeriodOpen(false); action("Mês atualizado", `${month} ${selectedYear}`); }}>{month.slice(0, 3)}{selectedMonth === index && <Check size={13} />}</button>)}</div> : <div className="period-years">{[2026, 2025, 2024].map((year) => <button key={year} className={selectedYear === year ? "is-selected" : ""} onClick={() => { setSelectedYear(year); setPeriodOpen(false); action("Ano atualizado", String(year)); }}>{year}{selectedYear === year && <Check size={13} />}</button>)}</div>}</motion.div>}</AnimatePresence></div><button className="soft-button p2p-launch-button" onClick={() => setP2POpen(true)}><UsersRound size={15} /> Compartilhar</button><button className="primary-button" onClick={openNewTransaction}><Plus size={16} /> Adicionar transação</button></div></div></div></section>

          <motion.section className="kpi-grid" variants={stagger}>{dashboardKpis.map((item) => <motion.article className="kpi-card" variants={child} key={item.label}><div className={`kpi-icon kpi-icon--${item.tone}`}><item.icon size={18} strokeWidth={1.8} /></div><div className="kpi-meta"><span>{item.label}</span><span className={`trend trend--${item.negative ? "negative" : "positive"}`}><TrendingUp size={12} /> {item.delta}</span></div><strong>{item.value}</strong><span className="kpi-foot">comparado ao mês anterior</span></motion.article>)}</motion.section>

          <motion.section className="savings-banner savings-banner--secondary" variants={child}><div className="savings-copy"><div className="banner-kicker"><Sparkles size={14} /> SAÚDE FINANCEIRA</div><h2>Você guardou <strong>R$ 1.644</strong> este mês</h2><p>Isso representa 34% da sua renda — seu melhor mês desde fevereiro. Três compromissos vencem nos próximos sete dias.</p><div className="banner-actions"><button className="primary-button primary-button--small" onClick={() => setActionPanel("transfer")}><ArrowUpRight size={14} /> Transferir</button><button className="ghost-button" onClick={() => setP2POpen(true)}><UsersRound size={14} /> Compartilhar</button><button className="ghost-button" onClick={() => setActionPanel("pay-bills")}><FileText size={14} /> Pagar contas</button></div></div><div className="banner-metrics"><Metric label="Taxa de economia" value="34%" /><Metric label="Compromissos" value="3" /><Metric label="Orçamentos acima" value="1" /></div><div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" /><div className="banner-ray" /></motion.section>

          <motion.section className="dashboard-grid dashboard-grid--primary" variants={stagger}><motion.article className="surface-card cashflow-card" variants={child}><CardHeader eyebrow="FLUXO DE CAIXA" title="Receitas vs. despesas" subtitle="Entrada, saída e saldo líquido no período" action={<div className="segmented-control">{["6M", "12M", "YTD"].map((range) => <button key={range} className={timeRange === range ? "is-active" : ""} onClick={() => setTimeRange(range)}>{range}</button>)}</div>} /><div className="chart-legend"><span><i className="legend-dot legend-dot--income" /> Receitas</span><span><i className="legend-dot legend-dot--expense" /> Despesas</span><span><i className="legend-dot legend-dot--net" /> Líquido</span></div><div className="cashflow-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 5, left: -18, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#65bfae" stopOpacity={0.24} /><stop offset="100%" stopColor="#65bfae" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f3a299" stopOpacity={0.16} /><stop offset="100%" stopColor="#f3a299" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartMuted, fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: chartMuted, fontSize: 10 }} tickFormatter={(value) => `R$${value / 1000}k`} domain={[0, 60000]} /><Tooltip cursor={{ stroke: chartGrid, strokeWidth: 1 }} contentStyle={{ backgroundColor: theme === "dark" ? "#1b2839" : "#fff", color: theme === "dark" ? "#edf3f4" : "#172033", border: 0, borderRadius: 12, boxShadow: "0 10px 30px rgba(22, 32, 54, .12)", fontSize: 12 }} labelFormatter={(label, payload) => payload?.[0]?.payload?.periodLabel ?? label} formatter={(value) => formatCompactBRL(Number(value))} /><ReferenceLine x={referenceMonth} stroke={theme === "dark" ? "#a8e5d5" : "#138a72"} strokeDasharray="4 4" strokeOpacity={0.55} label={{ value: "atual", position: "insideTop", fill: chartMuted, fontSize: 10 }} /><Area type="monotone" dataKey="income" stroke="#138a72" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 5, fill: "#138a72", stroke: theme === "dark" ? "#172132" : "#fff", strokeWidth: 3 }} /><Area type="monotone" dataKey="expenses" stroke="#e9857d" strokeWidth={2} fill="url(#expenseFill)" activeDot={{ r: 4, fill: "#e9857d", stroke: theme === "dark" ? "#172132" : "#fff", strokeWidth: 3 }} /><Area type="monotone" dataKey="net" stroke="#7486ca" strokeWidth={2} strokeDasharray="4 4" fill="transparent" /></AreaChart></ResponsiveContainer></div><div className="chart-bottom-stat"><div><span>Saldo líquido</span><strong>+R$ 1.644,00</strong></div><div className="stat-delta"><ArrowUpRight size={14} /> 12,4% <small>vs. mês anterior</small></div><button className="icon-button" aria-label="Mais opções do fluxo de caixa" onClick={() => setActionPanel("report")}><MoreHorizontal size={18} /></button></div></motion.article>

            <motion.article id="balance" className="surface-card balance-card balance-card--hybrid" variants={child}><CardWallet cards={localCreditCards} transactions={localTransactions} onAddCard={addCreditCard} onEditCard={openCardEditor} onSelectCard={(card) => action("Cartão selecionado", `${card.name} · ${card.brand}`)} onOpenDetails={(card) => setCardDetails(card)} embedded /></motion.article></motion.section>

          <motion.section className="dashboard-grid dashboard-grid--secondary" variants={stagger}><motion.article id="spending" className="surface-card spending-card" variants={child}><CardHeader eyebrow="GASTOS POR CATEGORIA" title="Onde seu dinheiro foi" subtitle="Distribuição das despesas no período" action={<button className="text-button" onClick={() => setActionPanel("report")}>Ver relatório <ChevronRight size={14} /></button>} /><div className="spending-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={spendingData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={87} paddingAngle={3} stroke="none">{spendingData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatBRL(Number(value))} contentStyle={{ border: 0, borderRadius: 12, boxShadow: "0 10px 30px rgba(22, 32, 54, .12)", fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>R$ 31,8K</strong><span>gastos</span></div></div><div className="spending-list">{spendingData.map((item, index) => <div className="spending-row" key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{formatCompactBRL(item.value)}</strong><small>{[31, 20, 14, 10, 25][index]}%</small></div>)}</div></div></motion.article>

            <motion.article className="surface-card accounts-card" variants={child}><CardHeader eyebrow="CONTAS" title="Suas contas" subtitle="Patrimônio por carteira" action={<button className="text-button" onClick={() => setActionPanel("accounts")}>Gerenciar <ChevronRight size={14} /></button>} /><div className="account-list">{localAccounts.filter((account) => account.icon !== "card").map((account) => <button className="account-row" key={account.name} onClick={() => { setSelectedAccount(account.name); setActionPanel("accounts"); }}><span className={`account-icon account-icon--${account.tone}`}>{navIcon(account.icon)}</span><span className="account-info"><strong>{account.name}</strong><small>{account.number}</small></span><span className="account-value"><strong>{account.value}</strong><small className={account.tone === "peach" ? "account-alert" : ""}>{account.change}</small></span><ChevronRight className="account-chevron" size={15} /></button>)}</div></motion.article></motion.section>

          <motion.section className="dashboard-grid dashboard-grid--secondary" variants={stagger}><motion.article id="budget" className="surface-card budget-card" variants={child}><CardHeader eyebrow="ORÇAMENTO" title="Uso dos envelopes" subtitle="Agosto · limite mensal" action={<button className="text-button" onClick={() => setActionPanel("budget")}>Ajustar <ChevronRight size={14} /></button>} /><div className="budget-list">{budgets.map((item) => <div className="budget-row" key={item.label}><div className="budget-row-head"><span>{item.label}</span><strong>{item.value} <small>/ {item.limit}</small></strong></div><div className="progress-track"><motion.div className={`progress-fill progress-fill--${item.tone}`} initial={{ width: 0 }} whileInView={{ width: `${Math.min(item.progress, 100)}%` }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.15 }} /></div></div>)}</div><div className="budget-alert"><ZapIcon /><span><strong>Alimentação</strong> está 3% acima do seu limite.</span><button onClick={() => setActionPanel("budget")} aria-label="Ver sugestão"><ChevronRight size={15} /></button></div></motion.article>

            <motion.article id="bills" className="surface-card bills-card" variants={child}><CardHeader eyebrow="PRÓXIMOS COMPROMISSOS" title="Contas a pagar" subtitle="O que merece atenção" action={<button className="text-button" onClick={() => setActionPanel("schedule")}>Agendar <ChevronRight size={14} /></button>} /><div className="bills-list">{upcomingBills.map((bill) => <button className={`bill-row ${paidBills.includes(bill.label) ? "is-paid" : ""}`} key={bill.label} onClick={() => { setSelectedBill(bill.label); setActionPanel("pay-bills"); }}><span className={`bill-date bill-date--${bill.tone}`}><CalendarDays size={15} /><small>{bill.date}</small></span><span className="bill-info"><strong>{bill.label}</strong><small>{paidBills.includes(bill.label) ? "pago nesta sessão" : bill.days}</small></span><span className="bill-amount">{paidBills.includes(bill.label) ? "Pago" : bill.amount}</span><ChevronRight size={15} /></button>)}</div></motion.article></motion.section>

          <motion.section id="transactions" className="surface-card transactions-card" variants={child}><CardHeader eyebrow="ATIVIDADE RECENTE" title="Últimos lançamentos" subtitle="Clique em um lançamento para editar" action={<button className="text-button" onClick={() => { closePanels(); setActiveNav("Extrato"); setCurrentView("statement"); setMobileFabOpen(false); action("Extrato completo aberto", `Todos os lançamentos de ${selectedPeriod.toLowerCase()} estão disponíveis.`); }}>Ver tudo <ChevronRight size={14} /></button>} /><div className="transactions-table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th className="amount-cell">Valor</th><th /></tr></thead><tbody>{filteredTransactions.map((transaction) => <tr key={`${transaction.date}-${transaction.payee}-${transaction.amount}`} className="transaction-row" tabIndex={0} role="button" onClick={() => editTransaction(transaction)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editTransaction(transaction); } }}><td className="muted-cell">{transaction.date}</td><td><span className={`transaction-icon transaction-icon--${transaction.type}`}>{transaction.type === "income" ? <ArrowDownLeft size={15} /> : transaction.type === "transfer" ? <ArrowLeftRight size={15} /> : <ArrowUpRight size={15} />}</span><strong>{transaction.payee}</strong></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-cell">{transaction.account}{transaction.type === "transfer" && transaction.destinationAccount ? ` → ${transaction.destinationAccount}` : ""}</td><td className={`amount-cell ${transaction.type === "income" ? "income-text" : transaction.type === "transfer" ? "muted-cell" : "expense-text"}`}>{transaction.type === "income" ? "+" : transaction.type === "transfer" ? "↔" : "−"}{formatBRL(transaction.amount).replace("R$ ", "R$ ")}</td><td className="transaction-edit-cell" aria-label="Abrir edição"><ChevronRight size={15} /></td></tr>)}</tbody></table>{filteredTransactions.length === 0 && <div className="table-empty"><FileText size={18} /><strong>Nenhum lançamento no período</strong><span>Altere o mês ou o ano para visualizar outra janela.</span></div>}</div></motion.section>

          <footer className="dashboard-footer"><span>© 2026 MuFinance · Versão React</span><div><button onClick={() => setActionPanel("about")}>Sobre</button><button onClick={() => setActionPanel("support")}>Suporte</button><button onClick={() => setActionPanel("privacy")}>Privacidade</button></div><span className="footer-secure"><Check size={13} /> Seus dados estão protegidos</span></footer>
          </>}
        </motion.div>
      </main>

      <motion.button className="desktop-transaction-fab" type="button" onClick={openNewTransaction} whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.94 }} aria-label="Adicionar transação" title="Adicionar transação">
        <Plus size={22} strokeWidth={2.4} />
      </motion.button>
      <MobileNav vehicleType={localVehicle.type} activeNav={activeNav} onSelect={handleNavSelect} fabOpen={mobileFabOpen} onToggleFab={() => setMobileFabOpen((current) => !current)} onIncome={() => { setMobileFabOpen(false); openNewTransaction("income"); }} onExpense={() => { setMobileFabOpen(false); openNewTransaction("expense"); }} onVehicle={() => { setMobileFabOpen(false); setActiveNav("Veículo"); setCurrentView("vehicle"); }} />
      <TransactionModal open={transactionModalOpen} initialType={transactionPreset} onClose={() => { setTransactionModalOpen(false); setEditingTransaction(null); }} onSubmit={addTransaction} editingTransaction={editingTransaction} accountOptions={transactionAccountOptions} creditCards={localCreditCards} categories={activeCategoryOptions} />
      <P2PDialog open={p2pOpen} contacts={demoP2PContacts} requests={p2pRequests} activities={p2pActivities} onClose={() => setP2POpen(false)} onSend={handleP2PSend} onRequest={handleP2PRequest} onAccept={handleP2PAccept} onReject={handleP2PReject} />
      <ActionPanels vehicleType={localVehicle.type} profile={profile} usernameLockDaysRemaining={usernameLockDaysRemaining} actionPanel={actionPanel} selectedBill={selectedBill} selectedAccount={selectedAccount} selectedTransaction={selectedTransaction} selectedCard={editingCard} accounts={localAccounts} paidBills={paidBills} transferAmount={transferAmount} transferDestination={transferDestination} depositAmount={depositAmount} scheduleDate={scheduleDate} budgetAdjusted={budgetAdjusted} accountConnected={accountConnected} scheduledReminder={scheduledReminder} supportView={supportView} supportMessage={supportMessage} sessionActive={sessionActive} reportTransactions={filteredTransactions} transactionTypeFilter={transactionTypeFilter} transactionCategoryFilter={transactionCategoryFilter} transactionCategories={transactionCategories} categories={localCategories} compactMode={compactMode} alertsEnabled={alertsEnabled} onClose={closePanels} onOpenPanel={setActionPanel} onProfileSave={handleProfileSave} onCreateCategory={handleCreateCategory} onUpdateCategory={handleUpdateCategory} onToggleCategory={handleToggleCategory} onDeleteCategory={handleDeleteCategory} onCompactMode={() => { setCompactMode((value) => !value); action("Modo compacto atualizado"); }} onAlerts={() => { setAlertsEnabled((value) => !value); action("Preferências de alertas atualizadas"); }} onDangerAction={handleDangerAction} onOpenAccounts={() => { closePanels(); setSelectedAccount(localAccounts.find((item) => item.icon !== "card")?.name ?? null); setActionPanel("accounts"); }} onOpenCards={() => { closePanels(); const firstCard = localCreditCards[0]; if (firstCard) setCardDetails(firstCard); else action("Nenhum cartão cadastrado", "Adicione um cartão para visualizar sua carteira de crédito."); }} onOpenVehicle={() => { closePanels(); setCurrentView("vehicle"); setActiveNav("Veículo"); }} onEditAccount={(account) => { setSelectedAccount(account.name); setActionPanel("account-edit"); }} onUpdateAccount={updateAccount} onUpdateCard={updateCard} onSelectBill={(label) => { setSelectedBill(label); setActionPanel("pay-bills"); }} onSelectAccount={(name) => { setSelectedAccount(name); setActionPanel("accounts"); }} onTransferAmount={setTransferAmount} onTransferDestination={setTransferDestination} onDepositAmount={setDepositAmount} onScheduleDate={setScheduleDate} onSubmitTransfer={submitTransfer} onSubmitDeposit={submitDeposit} onMarkBillAsPaid={markBillAsPaid} onSchedule={handleSchedule} onExport={exportTransactions} onDuplicate={duplicateSelectedTransaction} onDelete={deleteSelectedTransaction} onConnectAccount={handleConnectAccount} onBudgetSave={() => { setBudgetAdjusted(true); closePanels(); action("Orçamento atualizado", "O limite de alimentação foi sinalizado para revisão."); }} onSupportChoice={setSupportView} onSupportMessage={setSupportMessage} onSubmitSupport={handleSupportSubmit} onLogin={handleLogin} onTransactionTypeFilter={setTransactionTypeFilter} onTransactionCategoryFilter={setTransactionCategoryFilter} />
      <CardDetailsDialog open={Boolean(cardDetails)} card={cardDetails} transactions={localTransactions} onClose={() => setCardDetails(null)} onEditCard={openCardEditor} onExport={exportCardHistory} onPayInvoice={payCardInvoice} />
    </div>
  );
}

function Sidebar({ profile, vehicleType, collapsed, mobileOpen, activeNav, onSelect, onCollapse, onExport }: { profile: ProfileData; vehicleType: VehicleProfile["type"]; collapsed: boolean; mobileOpen: boolean; activeNav: string; onSelect: (label: string) => void; onCollapse: () => void; onExport: () => void }) {
  return <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}><div className="brand"><div className="brand-mark"><img src="/manus-storage/mufinance-logo_40c68aae.png" alt="" /></div>{!collapsed && <span className="brand-wordmark"><b>Mu</b>Finance</span>}<span className="brand-version">R2</span></div>{!collapsed && <p className="sidebar-label">MENU PRINCIPAL</p>}<nav className="sidebar-nav" aria-label="Navegação principal">{navItems.map((item) => <button key={item.label} className={`nav-item ${activeNav === item.label ? "is-active" : ""}`} onClick={() => onSelect(item.label)} title={collapsed ? item.label : undefined}><span className="nav-icon">{navIcon(item.icon, vehicleType)}</span>{!collapsed && <><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</>}</button>)}</nav>{!collapsed && <><div className="sidebar-divider" /><p className="sidebar-label">ATALHOS</p><button className="nav-item" onClick={() => onSelect("Insights")}><span className="nav-icon"><Sparkles size={17} /></span><span>Insights</span><span className="new-badge">Novo</span></button><button className="nav-item" onClick={onExport}><span className="nav-icon"><Download size={17} /></span><span>Exportar dados</span></button></>}<div className="sidebar-bottom"><button className="nav-item collapse-button" onClick={onCollapse} title={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />} {!collapsed && <span>Recolher menu</span>}</button></div></aside>;
}

type TopBarProps = { profile: ProfileData; valuesHidden: boolean; onToggleValues: () => void; onMenu: () => void; notificationsOpen: boolean; onNotificationsToggle: () => void; profileOpen: boolean; onProfileToggle: () => void; sessionActive: boolean; onLogout: () => void; onLogin: () => void; onOpenPanel: (panel: ActionPanel) => void; globalSearch: string; onSearchChange: (value: string) => void; searchResults: SearchItem[]; onSearchSelect: (item: SearchItem) => void };

function TopBar({ profile, valuesHidden, onToggleValues, onMenu, notificationsOpen, onNotificationsToggle, profileOpen, onProfileToggle, sessionActive, onLogout, onLogin, onOpenPanel, globalSearch, onSearchChange, searchResults, onSearchSelect }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const hasSearch = globalSearch.trim().length > 0;
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenu} aria-label="Abrir menu"><Menu size={20} /></button><div className="topbar-search"><Search size={16} /><input value={globalSearch} onChange={(event) => onSearchChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && searchResults[0]) onSearchSelect(searchResults[0]); }} placeholder="Pesquisar ou ir para…" aria-label="Pesquisar ou ir para" /><kbd>⌘K</kbd>{hasSearch && <div className="search-results" role="listbox">{searchResults.length ? searchResults.map((item) => <button key={item.label} type="button" onClick={() => onSearchSelect(item)}><Search size={13} /><span>{item.label}</span><small>{item.nav}</small></button>) : <span className="search-empty">Nenhum destino encontrado</span>}</div>}</div><div className="topbar-actions"><button className={`topbar-icon-button ${valuesHidden ? "is-active" : ""}`} onClick={onToggleValues} aria-label={valuesHidden ? "Remover desfoque dos números financeiros" : "Embassar números financeiros"} aria-pressed={valuesHidden} title={valuesHidden ? "Remover desfoque dos números financeiros" : "Embassar números financeiros"}>{valuesHidden ? <EyeOff size={17} /> : <Eye size={17} />}</button><button className="topbar-icon-button theme-toggle-button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button><div className="topbar-popover-wrap"><button className="topbar-icon-button notification-button" onClick={onNotificationsToggle} aria-label="Abrir notificações" aria-expanded={notificationsOpen}><Bell size={17} /><span>2</span></button>{notificationsOpen && <div className="popover-panel notification-panel"><div className="popover-heading"><div><span className="notification-overline">CENTRAL DE ATIVIDADE</span><strong>Notificações <em>2 novas</em></strong></div><button onClick={onNotificationsToggle} aria-label="Fechar notificações"><X size={14} /></button></div><div className="notification-item"><span className="notification-item-icon notification-item-icon--mint"><Wallet size={15} /></span><div><strong>Orçamento em atenção</strong><small>Alimentação está 3% acima do limite.</small><span className="notification-time">há 12 min</span></div><ChevronRight size={15} /></div><div className="notification-item"><span className="notification-item-icon notification-item-icon--coral"><CalendarDays size={15} /></span><div><strong>Vencimento próximo</strong><small>Cartão Mu Platinum vence em 2 dias.</small><span className="notification-time">há 28 min</span></div><ChevronRight size={15} /></div></div>}</div><div className="topbar-popover-wrap"><button className="topbar-avatar" onClick={onProfileToggle} aria-label="Abrir perfil" aria-expanded={profileOpen}>{profile.name.trim().charAt(0).toUpperCase() || "B"}</button>{profileOpen && <div className="popover-panel profile-panel"><div className="profile-heading"><div className="avatar">{profile.name.trim().charAt(0).toUpperCase() || "B"}</div><div><strong>{profile.name}</strong><small>{sessionActive ? profile.email : "Sessão encerrada"}</small></div></div>{sessionActive ? <><button onClick={() => { onProfileToggle(); onOpenPanel("about"); }}><UserRound size={14} /> Minha conta</button><button onClick={() => { onProfileToggle(); onOpenPanel("settings"); }}><Settings size={14} /> Configurações</button><button onClick={onLogout}><LogOut size={14} /> Encerrar sessão</button></> : <button onClick={onLogin}><RefreshCw size={14} /> Reabrir sessão</button>}</div>}</div></div></header>;
}

function MobileNav({ vehicleType, activeNav, onSelect, fabOpen, onToggleFab, onIncome, onExpense, onVehicle }: { vehicleType: VehicleProfile["type"]; activeNav: string; onSelect: (label: string) => void; fabOpen: boolean; onToggleFab: () => void; onIncome: () => void; onExpense: () => void; onVehicle: () => void }) {
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2, 4);
  const VehicleIcon = vehicleType === "motorcycle" ? Bike : CarFront;
  return <nav className="mobile-nav" aria-label="Navegação mobile"><div className="mobile-nav-group">{leftItems.map((item) => <button key={item.label} className={activeNav === item.label ? "is-active" : ""} onClick={() => onSelect(item.label)}>{navIcon(item.icon, vehicleType)}<span>{item.label}</span></button>)}</div><div className={`mobile-fab-wrap ${fabOpen ? "is-open" : ""}`}><div className="mobile-fab-actions" aria-hidden={!fabOpen}><button className="mobile-fab-action mobile-fab-action--income" onClick={onIncome} tabIndex={fabOpen ? 0 : -1}><ArrowDownLeft size={16} /><span>Receita</span></button><button className="mobile-fab-action mobile-fab-action--expense" onClick={onExpense} tabIndex={fabOpen ? 0 : -1}><ArrowUpRight size={16} /><span>Despesa</span></button><button className="mobile-fab-action mobile-fab-action--vehicle" onClick={onVehicle} tabIndex={fabOpen ? 0 : -1}><VehicleIcon size={16} /><span>Veículo</span></button></div><button className="mobile-fab" onClick={onToggleFab} aria-label={fabOpen ? "Fechar ações" : "Adicionar transação"} aria-expanded={fabOpen}><Plus size={22} /></button></div><div className="mobile-nav-group">{rightItems.map((item) => <button key={item.label} className={activeNav === item.label ? "is-active" : ""} onClick={() => onSelect(item.label)}>{navIcon(item.icon, vehicleType)}<span>{item.label}</span></button>)}</div></nav>;
}

function CardHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="card-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="card-subtitle">{subtitle}</p></div>{action}</div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="banner-metric"><span>{label}</span><strong>{value}</strong></div>; }
function ZapIcon() { return <Sparkles size={15} />; }

type ActionPanelsProps = {
  vehicleType: VehicleProfile["type"];
  actionPanel: ActionPanel;
  profile: ProfileData;
  usernameLockDaysRemaining: number;
  selectedBill: string | null;
  selectedAccount: string | null;
  selectedTransaction: Transaction | null;
  selectedCard: CreditCardData | null;
  accounts: Account[];
  paidBills: string[];
  transferAmount: string;
  transferDestination: string;
  depositAmount: string;
  scheduleDate: string;
  budgetAdjusted: boolean;
  accountConnected: boolean;
  scheduledReminder: string | null;
  supportView: SupportView;
  supportMessage: string;
  sessionActive: boolean;
  reportTransactions: Transaction[];
  transactionTypeFilter: "all" | Transaction["type"];
  transactionCategoryFilter: string;
  transactionCategories: string[];
  categories: FinanceCategory[];
  compactMode: boolean;
  alertsEnabled: boolean;
  onClose: () => void;
  onOpenPanel: (panel: ActionPanel) => void;
  onProfileSave: (profile: ProfileData) => void;
  onCreateCategory: (name: FinanceCategory["name"], type: FinanceCategory["type"], tone: FinanceCategory["tone"]) => void;
  onUpdateCategory: (id: string, name: string, tone: FinanceCategory["tone"]) => void;
  onToggleCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onCompactMode: () => void;
  onAlerts: () => void;
  onDangerAction: (action: DangerAction) => void;
  onOpenAccounts: () => void;
  onOpenCards: () => void;
  onOpenVehicle: () => void;
  onEditAccount: (account: Account) => void;
  onUpdateAccount: (account: Account) => void;
  onUpdateCard: (card: CreditCardData) => void;
  onSelectBill: (label: string) => void;
  onSelectAccount: (name: string) => void;
  onTransferAmount: (value: string) => void;
  onTransferDestination: (value: string) => void;
  onDepositAmount: (value: string) => void;
  onScheduleDate: (value: string) => void;
  onSubmitTransfer: (event: React.FormEvent<HTMLFormElement>) => void;
  onSubmitDeposit: (event: React.FormEvent<HTMLFormElement>) => void;
  onMarkBillAsPaid: () => void;
  onSchedule: () => void;
  onExport: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onConnectAccount: () => void;
  onBudgetSave: () => void;
  onSupportChoice: (value: SupportView) => void;
  onSupportMessage: (value: string) => void;
  onSubmitSupport: (event: React.FormEvent<HTMLFormElement>) => void;
  onLogin: () => void;
  onTransactionTypeFilter: (value: "all" | Transaction["type"]) => void;
  onTransactionCategoryFilter: (value: string) => void;
};

function ActionPanels({ vehicleType, actionPanel, profile, usernameLockDaysRemaining, selectedBill, selectedAccount, selectedTransaction, selectedCard, accounts, paidBills, transferAmount, transferDestination, depositAmount, scheduleDate, budgetAdjusted, accountConnected, scheduledReminder, supportView, supportMessage, sessionActive, reportTransactions, transactionTypeFilter, transactionCategoryFilter, transactionCategories, categories, compactMode, alertsEnabled, onClose, onOpenPanel, onProfileSave, onCreateCategory, onUpdateCategory, onToggleCategory, onDeleteCategory, onCompactMode, onAlerts, onDangerAction, onOpenAccounts, onOpenCards, onOpenVehicle, onEditAccount, onUpdateAccount, onUpdateCard, onSelectBill, onSelectAccount, onTransferAmount, onTransferDestination, onDepositAmount, onScheduleDate, onSubmitTransfer, onSubmitDeposit, onMarkBillAsPaid, onSchedule, onExport, onDuplicate, onDelete, onConnectAccount, onBudgetSave, onSupportChoice, onSupportMessage, onSubmitSupport, onLogin, onTransactionTypeFilter, onTransactionCategoryFilter }: ActionPanelsProps) {
  const [profileDraft, setProfileDraft] = useState<ProfileData>(profile);
  const [profileError, setProfileError] = useState("");
  useEffect(() => {
    if (actionPanel === "about") {
      setProfileDraft(profile);
      setProfileError("");
    }
  }, [actionPanel, profile]);
  const submitProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = profileDraft.name.trim();
    const email = profileDraft.email.trim().toLowerCase();
    const username = profileDraft.username.trim().replace(/^@/, "").toLowerCase();
    const usernameChanged = username !== profile.username;
    if (name.length < 2) { setProfileError("Informe seu nome completo para continuar."); return; }
    if (!profileEmailPattern.test(email)) { setProfileError("Informe um e-mail válido."); return; }
    if (!profileUsernamePattern.test(username)) { setProfileError("O @usuário deve ter de 3 a 20 caracteres usando apenas letras, números, ponto ou sublinhado."); return; }
    if (usernameChanged && usernameLockDaysRemaining > 0) { setProfileError(`O @usuário está bloqueado. Tente novamente em ${usernameLockDaysRemaining} ${usernameLockDaysRemaining === 1 ? "dia" : "dias"}.`); return; }
    if (usernameChanged && demoP2PContacts.some((contact) => contact.username.slice(1).toLowerCase() === username)) { setProfileError("Esse @usuário já está em uso no diretório demonstrativo."); return; }
    onProfileSave({ name, email, username, usernameChangedAt: usernameChanged ? new Date().toISOString() : profile.usernameChangedAt });
  };
  const account = accounts.find((item) => item.name === selectedAccount);
  const bill = upcomingBills.find((item) => item.label === selectedBill);
  const dialog = (eyebrow: string, title: string, description: string, icon: React.ReactNode, children: React.ReactNode, footer?: React.ReactNode) => <ActionDialog open onClose={onClose} eyebrow={eyebrow} title={title} description={description} icon={icon} footer={footer}>{children}</ActionDialog>;
  if (!actionPanel) return null;

  if (actionPanel === "transfer") return dialog("MOVIMENTAÇÃO", "Transferir dinheiro", "Escolha o destino e confirme o valor da transferência.", <ArrowUpRight size={17} />, <form className="transaction-form" onSubmit={onSubmitTransfer}><label className="form-field form-field--wide"><span>Valor</span><div className="amount-shell"><b>R$</b><input autoFocus inputMode="decimal" value={transferAmount} onChange={(event) => onTransferAmount(event.target.value)} placeholder="0,00" /></div></label><label className="form-field form-field--wide"><span>Destino</span><div className="select-shell"><Wallet size={15} /><select value={transferDestination} onChange={(event) => onTransferDestination(event.target.value)}><option>Conta principal</option><option>Reserva de emergência</option><option>Caixinha viagem</option></select><ChevronDown size={14} /></div></label><p className="dialog-hint"><ShieldCheck size={14} /> A transferência será preparada apenas nesta sessão demonstrativa.</p><div className="modal-actions"><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><ArrowUpRight size={15} /> Confirmar transferência</button></div></form>);
  if (actionPanel === "deposit") return dialog("MOVIMENTAÇÃO", "Preparar depósito", "Registre uma entrada planejada para acompanhar seu saldo.", <ArrowDownLeft size={17} />, <form className="transaction-form" onSubmit={onSubmitDeposit}><label className="form-field form-field--wide"><span>Valor do depósito</span><div className="amount-shell"><b>R$</b><input autoFocus inputMode="decimal" value={depositAmount} onChange={(event) => onDepositAmount(event.target.value)} placeholder="0,00" /></div></label><div className="deposit-method"><div><strong>PIX · Conta principal</strong><small>Disponível imediatamente</small></div><Check size={16} /></div><div className="modal-actions"><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><ArrowDownLeft size={15} /> Preparar depósito</button></div></form>);
  if (actionPanel === "pay-bills") return dialog("COMPROMISSOS", selectedBill ? selectedBill : "Próximos compromissos", selectedBill && bill ? `${bill.amount} · vence em ${bill.days}.` : "Uma agenda financeira para visualizar prioridades e liquidar compromissos com contexto.", <FileText size={17} />, <BillsPanelContent selectedBill={selectedBill} paidBills={paidBills} onSelectBill={onSelectBill} />, <><button className="soft-button" type="button" onClick={onClose}>Fechar</button><button className="primary-button" type="button" disabled={!selectedBill || paidBills.includes(selectedBill)} onClick={onMarkBillAsPaid}><Check size={15} /> Marcar como paga</button></>);
  if (actionPanel === "schedule") return dialog("AGENDA", "Agendar compromisso", "Escolha quando o lembrete deve aparecer para você.", <CalendarDays size={17} />, <div className="transaction-form"><label className="form-field form-field--wide"><span>Data do lembrete</span><div className="input-shell"><CalendarDays size={15} /><input type="date" value={scheduleDate} onChange={(event) => onScheduleDate(event.target.value)} /></div></label><div className="dialog-hint"><MessageCircle size={14} /> Você receberá um alerta dentro do dashboard na data selecionada.</div>{scheduledReminder && <p className="dialog-hint"><Check size={14} /> Último lembrete: {scheduledReminder}</p>}</div>, <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="button" onClick={onSchedule}><CalendarDays size={15} /> Salvar lembrete</button></>);
  if (actionPanel === "report") return dialog("ANÁLISE", "Relatório financeiro", "Uma leitura comparativa dos lançamentos locais e das categorias que mais movimentaram o período.", <TrendingUp size={17} />, <ReportPanelContent reportTransactions={reportTransactions} />, <><button className="soft-button" type="button" onClick={onClose}>Fechar</button><button className="primary-button" type="button" onClick={onExport}><Download size={15} /> Exportar CSV</button></>);
  if (actionPanel === "accounts") return dialog("CARTEIRAS", account ? account.name : "Suas contas", account ? `${account.number} · ${account.change}.` : "Escolha uma conta para ver saldo, movimentações recentes e ações disponíveis.", <Wallet size={17} />, <AccountsPanelContent accounts={accounts} account={account} selectedAccount={selectedAccount} accountConnected={accountConnected} reportTransactions={reportTransactions} onSelectAccount={onSelectAccount} onEditAccount={onEditAccount} />, <><button className="soft-button" type="button" onClick={onClose}>Fechar</button><button className="primary-button" type="button" disabled={accountConnected} onClick={() => { onConnectAccount(); onClose(); }}><Link2 size={15} /> {accountConnected ? "Conta conectada" : "Conectar conta"}</button></>);
  if (actionPanel === "account-edit") return dialog("CARTEIRAS", account ? `Editar ${account.name}` : "Editar conta", "Ajuste o nome, os últimos dígitos e o saldo demonstrativo desta carteira.", <Wallet size={17} />, account ? <AccountEditorForm account={account} onSave={onUpdateAccount} onCancel={onClose} /> : <div className="modal-empty-note"><Wallet size={17} /><span>Selecione uma conta antes de editar.</span></div>);
  if (actionPanel === "card-edit") return dialog("CENTRAL DE CARTÕES", selectedCard ? `Editar ${selectedCard.name}` : "Editar cartão", "Atualize os dados que organizam o limite e o ciclo da fatura.", <CreditCard size={17} />, selectedCard ? <CardEditorForm card={selectedCard} onSave={onUpdateCard} onCancel={onClose} /> : <div className="modal-empty-note"><CreditCard size={17} /><span>Selecione um cartão antes de editar.</span></div>);
  if (actionPanel === "budget") return dialog("ORÇAMENTO", "Ajustar envelopes", "Revise a categoria que passou do limite e salve a sua intenção.", <SlidersHorizontal size={17} />, <div className="budget-dialog"><div className="budget-dialog-row"><div><strong>Alimentação</strong><small>R$ 6,2K utilizados de R$ 6K</small></div><span className="budget-alert-chip">+3%</span></div><div className="progress-track"><div className="progress-fill progress-fill--coral" style={{ width: "100%" }} /></div>{budgetAdjusted && <p className="dialog-hint"><Check size={14} /> Revisão já sinalizada nesta sessão.</p>}</div>, <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="button" onClick={onBudgetSave}><Check size={15} /> Salvar ajuste</button></>);
  if (actionPanel === "transaction") return dialog("LANÇAMENTO", selectedTransaction?.payee ?? "Detalhes", selectedTransaction ? `${selectedTransaction.category} · ${selectedTransaction.account}${selectedTransaction.destinationAccount ? ` → ${selectedTransaction.destinationAccount}` : ""}` : "Veja os detalhes desta movimentação.", selectedTransaction?.type === "income" ? <ArrowDownLeft size={17} /> : selectedTransaction?.type === "transfer" ? <ArrowLeftRight size={17} /> : <ArrowUpRight size={17} />, selectedTransaction ? <div className="transaction-detail"><div className="detail-stat"><span>Valor</span><strong className={selectedTransaction.type === "income" ? "income-text" : selectedTransaction.type === "transfer" ? "muted-cell" : "expense-text"}>{selectedTransaction.type === "income" ? "+" : selectedTransaction.type === "transfer" ? "↔" : "−"}{formatBRL(selectedTransaction.amount)}</strong></div><div className="detail-stat"><span>Data</span><strong>{selectedTransaction.date}</strong></div><div className="detail-stat"><span>Categoria</span><strong>{selectedTransaction.category}</strong></div></div> : null, <><button className="soft-button" type="button" onClick={onDuplicate}><RefreshCw size={15} /> Duplicar</button><button className="danger-button" type="button" onClick={onDelete}><X size={15} /> Remover</button></>);
  if (actionPanel === "settings") return <SettingsPanel open categories={categories} accountCount={accounts.filter((item) => item.icon !== "card").length} cardCount={2} compactMode={compactMode} alertsEnabled={alertsEnabled} onClose={onClose} onCreateCategory={onCreateCategory} onUpdateCategory={onUpdateCategory} onToggleCategory={onToggleCategory} onDeleteCategory={onDeleteCategory} onCompactMode={onCompactMode} onAlerts={onAlerts} onOpenAccounts={onOpenAccounts} onOpenCards={onOpenCards} onOpenVehicle={onOpenVehicle} vehicleType={vehicleType} onDangerAction={onDangerAction} />;
  if (actionPanel === "about") return dialog("PERFIL", "Minha conta", "Edite seus dados básicos e o identificador usado nas conexões P2P.", <UserRound size={17} />, <form id="profile-form" className="profile-editor" onSubmit={submitProfile}><div className="profile-editor-identity"><div className="avatar avatar--large">{profileDraft.name.trim().charAt(0).toUpperCase() || "B"}</div><div><strong>Perfil local</strong><small>@{profile.username} · MuFinance pessoal</small></div></div><div className="profile-form-grid"><label className="form-field"><span>Nome completo</span><div className="input-shell"><UserRound size={15} /><input value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} autoComplete="name" /></div></label><label className="form-field"><span>E-mail</span><div className="input-shell"><Mail size={15} /><input type="email" value={profileDraft.email} onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))} autoComplete="email" /></div></label><label className="form-field form-field--full"><span>Identificador público</span><div className="input-shell"><AtSign size={15} /><input value={`@${profileDraft.username}`} onChange={(event) => setProfileDraft((current) => ({ ...current, username: event.target.value.replace(/^@/, "") }))} disabled={usernameLockDaysRemaining > 0} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></div><small className="field-help">3–20 caracteres, apenas letras, números, ponto e sublinhado.</small></label></div>{profileError && <p className="form-error">{profileError}</p>}<div className="profile-lock-notice"><ShieldCheck size={15} /><span>{usernameLockDaysRemaining > 0 ? `O @usuário poderá ser alterado novamente em ${usernameLockDaysRemaining} ${usernameLockDaysRemaining === 1 ? "dia" : "dias"}.` : "Depois de alterado, o @usuário fica bloqueado por 90 dias."}</span></div><div className="profile-account-meta"><div className="detail-stat"><span>Plano</span><strong>MuFinance pessoal</strong></div><div className="detail-stat"><span>Conta criada</span><strong>Janeiro de 2024</strong></div></div></form>, <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" form="profile-form"><Check size={15} /> Salvar alterações</button></>);
  if (actionPanel === "support") return dialog("AJUDA", "Suporte MuFinance", supportView === "help" ? "Consulte respostas rápidas para continuar sem sair do dashboard." : supportView === "contact" ? "Envie uma mensagem e registraremos o atendimento nesta sessão." : "Escolha uma forma de continuar o atendimento.", <CircleHelp size={17} />, supportView === "home" ? <div className="action-list"><button className="action-list-item" onClick={() => onSupportChoice("help")}><span className="list-icon"><CircleHelp size={15} /></span><span><strong>Central de ajuda</strong><small>Consulte respostas rápidas.</small></span><ChevronRight size={15} /></button><button className="action-list-item" onClick={() => onSupportChoice("contact")}><span className="list-icon"><MailIcon /></span><span><strong>Falar com suporte</strong><small>Envie uma mensagem para o time.</small></span><ChevronRight size={15} /></button></div> : supportView === "help" ? <div className="support-faq"><div><strong>Como adiciono uma transação?</strong><p>Use o botão Adicionar transação no topo e confirme valor e categoria.</p></div><div><strong>Onde encontro o extrato?</strong><p>Abra Extrato na navegação lateral ou use a busca rápida.</p></div><button className="text-button" type="button" onClick={() => onSupportChoice("contact")}>Ainda preciso de ajuda <ChevronRight size={14} /></button></div> : <form id="support-form" className="transaction-form" onSubmit={onSubmitSupport}><label className="form-field form-field--wide"><span>Mensagem</span><textarea value={supportMessage} onChange={(event) => onSupportMessage(event.target.value)} autoFocus placeholder="Descreva o que você precisa…" rows={5} /></label><button className="text-button" type="button" onClick={() => onSupportChoice("home")}>Voltar para opções</button><div className="dialog-hint"><MessageCircle size={14} /> O atendimento é simulado e não envia dados para fora desta sessão.</div></form>, supportView === "contact" ? <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" form="support-form"><MessageCircle size={15} /> Enviar mensagem</button></> : <button className="soft-button" type="button" onClick={onClose}>Fechar</button>);
  if (actionPanel === "privacy") return dialog("SEGURANÇA", "Privacidade e dados", "Controle como seus dados locais são tratados nesta demonstração.", <ShieldCheck size={17} />, <div className="privacy-copy"><p>Os lançamentos criados aqui ficam apenas no estado da sessão do navegador. Nenhum dado bancário real é conectado ou enviado.</p><div className="privacy-badge"><ShieldCheck size={16} /><strong>Dados protegidos nesta sessão</strong></div></div>, <button className="primary-button" type="button" onClick={onClose}>Entendi</button>);
  if (actionPanel === "insights") return dialog("INSIGHTS", "Seu próximo movimento", "Uma leitura rápida baseada nos dados demonstrativos do dashboard.", <Sparkles size={17} />, <div className="insight-card"><div className="insight-card-icon"><TrendingUp size={18} /></div><div><strong>Reduza Alimentação em 3%</strong><p>Esse ajuste mantém o envelope dentro do limite mensal sem mexer na reserva.</p></div></div>, <button className="primary-button" type="button" onClick={() => { onClose(); onOpenPanel("budget"); }}>Revisar orçamento</button>);
  if (actionPanel === "session") return dialog("SESSÃO", "Sessão encerrada", "O estado local foi mantido neste navegador, mas o perfil está desconectado.", <LogOut size={17} />, <div className="privacy-copy"><p>Você pode reabrir a sessão demonstrativa para continuar testando as interações.</p><div className="privacy-badge"><ShieldCheck size={16} /><strong>Dados locais preservados</strong></div></div>, <button className="primary-button" type="button" onClick={onLogin}><RefreshCw size={15} /> Reabrir sessão</button>);
  return dialog("PREFERÊNCIAS", "Configurações", "Ajuste a forma como o MuFinance se comporta nesta sessão.", <Settings size={17} />, <div className="settings-list"><div className="settings-row"><span><Eye size={15} /><div><strong>Modo compacto</strong><small>Reduz o espaçamento entre módulos.</small></div></span><span className="status-pill">Ativo no cabeçalho</span></div><div className="settings-row"><span><Bell size={15} /><div><strong>Alertas</strong><small>Contas e orçamentos prioritários.</small></div></span><span className="status-pill status-pill--on">Ligados</span></div></div>, <button className="primary-button" type="button" onClick={onClose}>Salvar preferências</button>);
}

type BillsPanelContentProps = {
  selectedBill: string | null;
  paidBills: string[];
  onSelectBill: (label: string) => void;
};

function BillsPanelContent({ selectedBill, paidBills, onSelectBill }: BillsPanelContentProps) {
  const total = upcomingBills.reduce((sum, item) => sum + parseDemoBRL(item.amount), 0);
  const pending = upcomingBills.filter((item) => !paidBills.includes(item.label));
  return <div className="modal-rich-content bills-panel"><div className="modal-summary-strip"><div><span>Em aberto</span><strong>{pending.length}</strong></div><div><span>Total previsto</span><strong>{formatCompactBRL(total)}</strong></div><div><span>Próximo prazo</span><strong>{pending[0]?.days ?? "Concluído"}</strong></div></div><div className="modal-section-heading"><div><p className="eyebrow">AGENDA FINANCEIRA</p><h3>O que merece atenção</h3></div><span className="modal-section-count">{upcomingBills.length} compromissos</span></div><div className="action-list action-list--rich">{upcomingBills.map((item) => { const paid = paidBills.includes(item.label); return <button key={item.label} className={`action-list-item ${selectedBill === item.label ? "is-selected" : ""} ${paid ? "is-completed" : ""}`} onClick={() => onSelectBill(item.label)}><span className={`bill-date bill-date--${item.tone}`}><CalendarDays size={14} /><small>{item.date}</small></span><span className="action-list-copy"><strong>{item.label}</strong><small>{paid ? "Pago nesta sessão" : `${item.amount} · vence em ${item.days}`}</small></span><span className={`status-pill ${paid ? "status-pill--on" : ""}`}>{paid ? "Pago" : "Pendente"}</span><ChevronRight size={15} /></button>; })}</div></div>;
}

function ReportPanelContent({ reportTransactions }: { reportTransactions: Transaction[] }) {
  const income = reportTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = reportTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const categoryTotals = reportTransactions.filter((item) => item.type === "expense").reduce<Record<string, number>>((result, item) => { result[item.category] = (result[item.category] ?? 0) + item.amount; return result; }, {});
  const categories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  const maxCategory = categories[0]?.[1] ?? 1;
  return <div className="modal-rich-content report-panel"><div className="modal-summary-strip"><div><span>Receitas</span><strong className="income-text">+{formatCompactBRL(income)}</strong></div><div><span>Despesas</span><strong className="expense-text">−{formatCompactBRL(expense)}</strong></div><div><span>Saldo líquido</span><strong className={income - expense >= 0 ? "income-text" : "expense-text"}>{income - expense >= 0 ? "+" : "−"}{formatCompactBRL(Math.abs(income - expense))}</strong></div></div><div className="report-insight"><span className="report-insight-mark"><TrendingUp size={15} /></span><div><strong>{income >= expense ? "O período fechou positivo" : "As despesas pedem atenção"}</strong><p>{reportTransactions.length} lançamentos analisados, com foco nas categorias que mais movimentaram o caixa.</p></div></div><div className="modal-section-heading"><div><p className="eyebrow">DISTRIBUIÇÃO</p><h3>Despesas por categoria</h3></div><span className="modal-section-count">{localTransactionCount(reportTransactions)}</span></div><div className="report-bars">{categories.length === 0 ? <div className="table-empty"><FileText size={18} /><strong>Sem despesas no período</strong><span>Altere os filtros para visualizar a distribuição.</span></div> : categories.map(([category, value]) => <div className="report-bar-row" key={category}><div><span>{category}</span><strong>{formatCompactBRL(value)}</strong></div><div className="progress-track"><div className="progress-fill progress-fill--mint" style={{ width: `${Math.max(8, Math.round((value / maxCategory) * 100))}%` }} /></div></div>)}</div></div>;
}

function AccountsPanelContent({ accounts, account, selectedAccount, accountConnected, reportTransactions, onSelectAccount, onEditAccount }: { accounts: Account[]; account?: Account; selectedAccount: string | null; accountConnected: boolean; reportTransactions: Transaction[]; onSelectAccount: (name: string) => void; onEditAccount: (account: Account) => void }) {
  const accountDigits = account?.number.replace(/\D/g, "");
  const accountTransactions = accountDigits ? reportTransactions.filter((item) => item.account.replace(/\D/g, "").includes(accountDigits) || item.destinationAccount?.replace(/\D/g, "").includes(accountDigits)) : [];
  const inflow = accountTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const outflow = accountTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  return <div className="modal-rich-content accounts-panel"><div className="modal-summary-strip"><div><span>Carteiras</span><strong>{accounts.length - 1}</strong></div><div><span>Patrimônio local</span><strong>{formatCompactBRL(accounts.filter((item) => item.icon !== "card").reduce((sum, item) => sum + item.balance, 0))}</strong></div><div><span>Movimentações</span><strong>{accountTransactions.length}</strong></div></div>{account ? <div className="account-detail-card"><div className={`account-detail-icon account-icon--${account.tone}`}>{navIcon(account.icon)}</div><div><p className="eyebrow">CONTA SELECIONADA</p><h3>{account.name}</h3><span>{account.number} · {account.change}</span></div><strong>{formatBRL(account.balance)}</strong><button className="soft-button soft-button--small" type="button" onClick={() => onEditAccount(account)}><Pencil size={14} /> Editar conta</button></div> : <div className="modal-empty-note"><Wallet size={17} /><span>Selecione uma carteira abaixo para ver seus detalhes.</span></div>} {account && <div className="account-flow-strip"><div><span>Entradas no período</span><strong className="income-text">+{formatCompactBRL(inflow)}</strong></div><div><span>Saídas no período</span><strong className="expense-text">−{formatCompactBRL(outflow)}</strong></div></div>}<div className="modal-section-heading"><div><p className="eyebrow">CARTEIRAS LOCAIS</p><h3>Onde seu dinheiro está</h3></div><span className="modal-section-count">{accounts.length - 1} contas</span></div><div className="action-list action-list--rich">{accounts.filter((item) => item.icon !== "card").map((item) => <button key={item.name} className={`action-list-item ${selectedAccount === item.name ? "is-selected" : ""}`} onClick={() => onSelectAccount(item.name)}><span className={`account-icon account-icon--${item.tone}`}>{navIcon(item.icon)}</span><span className="action-list-copy"><strong>{item.name}</strong><small>{formatBRL(item.balance)} · {item.number}</small></span><span className="status-pill">{item.change}</span><ChevronRight size={15} /></button>)}</div>{accountConnected && <p className="dialog-hint"><Check size={14} /> Conta demonstrativa conectada nesta sessão.</p>}</div>;
}

function AccountEditorForm({ account, onSave, onCancel }: { account: Account; onSave: (account: Account) => void; onCancel: () => void }) {
  const [name, setName] = useState(account.name);
  const [last4, setLast4] = useState(account.number.replace(/\D/g, "").slice(-4));
  const [balance, setBalance] = useState(String(account.balance).replace(".", ","));
  const [adjustment, setAdjustment] = useState("");
  const [adjustmentMode, setAdjustmentMode] = useState<"add" | "subtract">("add");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericBalance = parseEditableBRL(balance);
    const numericAdjustment = adjustment.trim() ? parseEditableBRL(adjustment) : 0;
    if (name.trim().length < 2) { setError("Informe um nome para a conta."); return; }
    if (!/^\d{4}$/.test(last4)) { setError("Informe os quatro últimos dígitos da conta."); return; }
    if (!Number.isFinite(numericBalance)) { setError("Informe um saldo válido."); return; }
    if (adjustment.trim() && (!Number.isFinite(numericAdjustment) || numericAdjustment < 0)) { setError("Informe um ajuste válido e não negativo."); return; }
    const adjustedBalance = numericBalance + (adjustmentMode === "add" ? numericAdjustment : -numericAdjustment);
    onSave({ ...account, name: name.trim(), number: last4, balance: adjustedBalance, value: formatBRL(adjustedBalance) });
  };
  const parsedBalance = parseEditableBRL(balance);
  const parsedAdjustment = adjustment.trim() ? parseEditableBRL(adjustment) : 0;
  const previewBalance = Number.isFinite(parsedBalance) ? parsedBalance + (adjustmentMode === "add" ? (Number.isFinite(parsedAdjustment) ? parsedAdjustment : 0) : -(Number.isFinite(parsedAdjustment) ? parsedAdjustment : 0)) : account.balance;
  return <form className="transaction-form wallet-editor-form" onSubmit={submit}><div className="form-grid"><label className="form-field form-field--wide"><span>Nome da conta</span><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Ex.: Conta principal" /></label><label className="form-field"><span>Últimos 4 dígitos</span><input inputMode="numeric" maxLength={4} value={last4} onChange={(event) => { setLast4(event.target.value.replace(/\D/g, "")); setError(""); }} /></label><label className="form-field"><span>Saldo base</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={balance} onChange={(event) => { setBalance(event.target.value); setError(""); }} /></div></label></div><div className="balance-adjustment-card"><div className="balance-adjustment-summary"><div><span>Saldo antes</span><strong>{formatBRL(account.balance)}</strong></div><div><span>Novo saldo</span><strong className={previewBalance >= 0 ? "income-text" : "expense-text"}>{formatBRL(previewBalance)}</strong></div></div><div className="balance-adjustment-grid"><label className="form-field"><span>Ajuste rápido</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={adjustment} onChange={(event) => { setAdjustment(event.target.value); setError(""); }} placeholder="0,00" /></div></label><div className="balance-adjustment-control"><span>Aplicar como</span><div className="balance-adjustment-toggle" role="group" aria-label="Tipo do ajuste"><button type="button" className={adjustmentMode === "add" ? "is-active" : ""} onClick={() => setAdjustmentMode("add")}>Adicionar</button><button type="button" className={adjustmentMode === "subtract" ? "is-active" : ""} onClick={() => setAdjustmentMode("subtract")}>Subtrair</button></div></div></div></div><p className="dialog-hint"><ShieldCheck size={14} /> Use o saldo base para definir um valor exato ou o ajuste rápido para somar/subtrair sem fazer contas.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="soft-button" type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit"><Check size={15} /> Salvar conta</button></div></form>;
}

function CardEditorForm({ card, onSave, onCancel }: { card: CreditCardData; onSave: (card: CreditCardData) => void; onCancel: () => void }) {
  const [name, setName] = useState(card.name);
  const [last4, setLast4] = useState(card.last4);
  const [brand, setBrand] = useState(card.brand);
  const [color, setColor] = useState(card.color);
  const [limit, setLimit] = useState(String(card.limit));
  const [closingDay, setClosingDay] = useState(String(card.closingDay));
  const [dueDay, setDueDay] = useState(String(card.dueDay));
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericLimit = parseDemoBRL(limit);
    const numericClosingDay = Number(closingDay);
    const numericDueDay = Number(dueDay);
    if (name.trim().length < 2) { setError("Informe um nome para o cartão."); return; }
    if (!/^\d{4}$/.test(last4)) { setError("Informe os quatro últimos números do cartão."); return; }
    if (numericLimit <= 0 || !Number.isFinite(numericLimit)) { setError("Informe um limite maior que zero."); return; }
    if (numericClosingDay < 1 || numericClosingDay > 28 || numericDueDay < 1 || numericDueDay > 28) { setError("Use dias entre 1 e 28 para fechamento e vencimento."); return; }
    onSave({ ...card, name: name.trim(), last4, brand, color, limit: numericLimit, closingDay: numericClosingDay, dueDay: numericDueDay });
  };
  return <form className="transaction-form wallet-editor-form" onSubmit={submit}><div className="form-grid"><label className="form-field form-field--wide"><span>Nome do cartão</span><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(""); }} /></label><label className="form-field"><span>Últimos 4 números</span><input inputMode="numeric" maxLength={4} value={last4} onChange={(event) => { setLast4(event.target.value.replace(/\D/g, "")); setError(""); }} /></label><label className="form-field"><span>Bandeira</span><select value={brand} onChange={(event) => setBrand(event.target.value as CreditCardData["brand"])}><option>Visa</option><option>Mastercard</option><option>Elo</option><option>Amex</option></select></label><label className="form-field"><span>Limite total</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={limit} onChange={(event) => { setLimit(event.target.value); setError(""); }} /></div></label><label className="form-field"><span>Fecha dia</span><input inputMode="numeric" maxLength={2} value={closingDay} onChange={(event) => setClosingDay(event.target.value.replace(/\D/g, ""))} /></label><label className="form-field"><span>Vence dia</span><input inputMode="numeric" maxLength={2} value={dueDay} onChange={(event) => setDueDay(event.target.value.replace(/\D/g, ""))} /></label><label className="form-field"><span>Tratamento visual</span><select value={color} onChange={(event) => setColor(event.target.value as CreditCardData["color"])}><option value="ocean">Oceano</option><option value="forest">Floresta</option><option value="plum">Ameixa</option><option value="sunset">Pôr do sol</option><option value="graphite">Grafite</option></select></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="soft-button" type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit"><Check size={15} /> Salvar cartão</button></div></form>;
}

function parseDemoBRL(value: string) { return Number(value.replace(/[^0-9,]/g, "").replace(/\./g, "").replace(",", ".")) || 0; }
function parseEditableBRL(value: string) { const normalized = value.trim().replace(/\s/g, "").replace(/R\$/gi, "").replace(/\./g, "").replace(",", "."); const parsed = Number(normalized); return Number.isFinite(parsed) ? parsed : NaN; }
function localTransactionCount(items: Transaction[]) { return `${items.length} lançamentos`; }
function ExternalLinkIcon() { return <Link2 size={15} />; }
function MailIcon() { return <MessageCircle size={15} />; }
