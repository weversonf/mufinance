// Soft Swiss Fintech / editorial dashboard: farol MuFinance, rastro de maré nos dados, tipografia editorial e movimento curto.

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  Globe2,
  Home,
  Landmark,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { accounts, budgets, cashflowData, creditCards as initialCreditCards, formatBRL, formatCompactBRL, navItems, spendingData, transactions, upcomingBills, type CreditCard as CreditCardData, type Transaction } from "@/lib/financeData";
import { useTheme } from "@/contexts/ThemeContext";
import { ActionDialog } from "./ActionDialog";
import { CardWallet, type NewCreditCardPayload } from "./CardWallet";
import { NewTransactionPayload, TransactionModal } from "./TransactionModal";

type IconName = "home" | "receipt" | "chart" | "card" | "target" | "wallet" | "user" | "settings" | "bank" | "sparkles";
type ActionPanel = "transfer" | "deposit" | "pay-bills" | "schedule" | "report" | "accounts" | "budget" | "filters" | "transaction" | "about" | "support" | "privacy" | "insights" | "settings" | "session" | null;
type SearchItem = { label: string; nav: string; anchor: string };
type SupportView = "home" | "help" | "contact";

const iconMap: Record<IconName, typeof Home> = {
  home: Home,
  receipt: FileText,
  chart: TrendingUp,
  card: CreditCard,
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

const currencyValues: Record<string, { available: string; label: string }> = {
  BRL: { available: "R$ 32.540,00", label: "MuFinance · Principal" },
  USD: { available: "$ 5,820.00", label: "MuFinance · Internacional" },
  EUR: { available: "€ 4.210,00", label: "MuFinance · Europa" },
};

const navAnchors: Record<string, string> = { Início: "overview", Extrato: "transactions", Relatórios: "spending", Cartões: "cards", Metas: "budget", Orçamento: "budget" };
const searchItems: SearchItem[] = [
  { label: "Visão geral", nav: "Início", anchor: "overview" },
  { label: "Últimos lançamentos", nav: "Extrato", anchor: "transactions" },
  { label: "Gastos por categoria", nav: "Relatórios", anchor: "spending" },
  { label: "Sua carteira", nav: "Cartões", anchor: "cards" },
  { label: "Uso dos envelopes", nav: "Orçamento", anchor: "budget" },
  { label: "Contas a pagar", nav: "Orçamento", anchor: "bills" },
];

const navIcon = (name: string) => {
  const Icon = iconMap[name as IconName] ?? LayoutDashboard;
  return <Icon size={17} strokeWidth={1.8} />;
};

function parseAmount(value: string) {
  return Number(value.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
}

export default function FinanceDashboard() {
  const [activeNav, setActiveNav] = useState("Início");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("6M");
  const [currency, setCurrency] = useState("BRL");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Últimos 30 dias");
  const [query, setQuery] = useState("");
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);
  const [localCreditCards, setLocalCreditCards] = useState<CreditCardData[]>(initialCreditCards);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [actionPanel, setActionPanel] = useState<ActionPanel>(null);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paidBills, setPaidBills] = useState<string[]>([]);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | Transaction["type"]>("all");
  const [transactionCategoryFilter, setTransactionCategoryFilter] = useState("Todas");
  const [compactMode, setCompactMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("PT");
  const [globalSearch, setGlobalSearch] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDestination, setTransferDestination] = useState("Conta principal");
  const [depositAmount, setDepositAmount] = useState("");
  const [scheduleDate, setScheduleDate] = useState("2026-08-28");
  const [budgetAdjusted, setBudgetAdjusted] = useState(false);
  const [accountConnected, setAccountConnected] = useState(false);
  const [scheduledReminder, setScheduledReminder] = useState<string | null>(null);
  const [supportView, setSupportView] = useState<SupportView>("home");
  const [supportMessage, setSupportMessage] = useState("");
  const [sessionActive, setSessionActive] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Pesquisar ou ir para"]')?.focus();
      }
      if (event.key === "Escape") {
        setPeriodOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setLanguageOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, []);

  const filteredNav = useMemo(() => navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const selectedCurrency = currencyValues[currency];
  const chartMuted = theme === "dark" ? "#9aaabd" : "#9aa2b4";
  const chartGrid = theme === "dark" ? "#2b3849" : "#eef0f5";
  const chartData = timeRange === "6M" ? cashflowData.slice(-6) : timeRange === "YTD" ? cashflowData : [...cashflowData.slice(0, 2), ...cashflowData, { month: "Set", income: 50200, expenses: 32900, net: 17300 }];
  const transactionCategories = ["Todas"].concat(localTransactions.map((item) => item.category).filter((category, index, list) => list.indexOf(category) === index));
  const filteredTransactions = localTransactions.filter((item) => (transactionTypeFilter === "all" || item.type === transactionTypeFilter) && (transactionCategoryFilter === "Todas" || item.category === transactionCategoryFilter));
  const searchResults = searchItems.filter((item) => item.label.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 5);
  const transactionAccountOptions = useMemo(() => Array.from(new Set(accounts.filter((item) => item.icon !== "card").map((item) => `${item.name} ${item.number}`).concat(localTransactions.filter((item) => item.sourceType !== "credit-card" && !item.account.toLowerCase().includes("cartão")).map((item) => item.account)))), [localTransactions]);

  const closePanels = () => { setActionPanel(null); setSelectedBill(null); setSelectedAccount(null); setSelectedTransaction(null); };
  const scrollTo = (anchor: string) => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const action = (message: string, description = "Alteração aplicada nesta sessão.") => toast.success(message, { description });
  const handleNavSelect = (label: string) => {
    setActiveNav(label);
    setMobileOpen(false);
    closePanels();
    if (label === "Perfil") { setActionPanel("about"); return; }
    if (label === "Configurações") { setActionPanel("settings"); return; }
    if (label === "Insights") { setActionPanel("insights"); return; }
    if (label === "Exportar dados") { exportTransactions(); return; }
    const anchor = navAnchors[label];
    if (anchor) window.setTimeout(() => scrollTo(anchor), 40);
  };
  const exportTransactions = () => {
    const csv = [["Data", "Descrição", "Categoria", "Conta", "Tipo", "Valor"], ...localTransactions.map((item) => [item.date, item.payee, item.category, item.account, item.type === "income" ? "Receita" : "Despesa", item.amount.toFixed(2).replace(".", ",")])].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mufinance-transacoes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    action("Extrato exportado", `${localTransactions.length} lançamentos foram baixados em CSV.`);
  };
  const openNewTransaction = () => {
    setEditingTransaction(null);
    setTransactionModalOpen(true);
  };
  const addTransaction = (transaction: NewTransactionPayload, editing?: Transaction | null) => {
    if (editing) {
      setLocalTransactions((current) => current.map((item) => item === editing ? { ...item, ...transaction } : item));
      setEditingTransaction(null);
      setTransactionModalOpen(false);
      action("Transação atualizada", `${transaction.payee} · ${formatBRL(transaction.amount)}`);
      return;
    }
    setLocalTransactions((current) => [{ ...transaction, date: "13 ago" }, ...current]);
    setTransactionModalOpen(false);
    action("Transação adicionada", `${transaction.payee} · ${formatBRL(transaction.amount)}`);
  };
  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };
  const addCreditCard = (card: NewCreditCardPayload) => {
    setLocalCreditCards((current) => current.concat({ ...card, id: `card-${Date.now()}` }));
    action("Cartão adicionado", `${card.name} · ${card.brand}`);
  };
  const submitTransfer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseAmount(transferAmount);
    if (!Number.isFinite(amount) || amount <= 0) { action("Digite um valor válido", "A transferência não foi enviada."); return; }
    setLocalTransactions((current) => [{ date: "13 ago", payee: `Transferência para ${transferDestination}`, category: "Transferências", account: "Conta •7045", type: "expense", amount }, ...current]);
    setTransferAmount("");
    closePanels();
    action("Transferência agendada", `${formatBRL(amount)} para ${transferDestination}.`);
  };
  const submitDeposit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseAmount(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) { action("Digite um valor válido", "O depósito não foi preparado."); return; }
    setLocalTransactions((current) => [{ date: "13 ago", payee: "Depósito PIX", category: "Receitas", account: "Conta •7045", type: "income", amount }, ...current]);
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
    setLocalTransactions((current) => [{ ...selectedTransaction, date: "13 ago", payee: `${selectedTransaction.payee} (cópia)` }, ...current]);
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
    setSessionActive(false);
    setProfileOpen(false);
    setActionPanel("session");
  };
  const handleLogin = () => {
    setSessionActive(true);
    closePanels();
    action("Sessão reaberta", "Você voltou ao espaço MuFinance desta sessão.");
  };

  return (
    <div className={`app-shell ${compactMode ? "app-shell--compact" : ""}`}>
      <AnimatePresence>{mobileOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}</AnimatePresence>
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileOpen} activeNav={activeNav} filteredNav={filteredNav} query={query} setQuery={setQuery} onSelect={handleNavSelect} onCollapse={() => setSidebarCollapsed((value) => !value)} onExport={exportTransactions} />

      <main className={`main-area ${sidebarCollapsed ? "main-area--wide" : ""}`}>
        <TopBar compactMode={compactMode} onCompact={() => setCompactMode((value) => !value)} onMenu={() => setMobileOpen(true)} language={language} languageOpen={languageOpen} onLanguageToggle={() => setLanguageOpen((value) => !value)} onLanguageSelect={(value) => { setLanguage(value); setLanguageOpen(false); action(`Idioma alterado para ${value}`); }} notificationsOpen={notificationsOpen} onNotificationsToggle={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} profileOpen={profileOpen} onProfileToggle={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} sessionActive={sessionActive} onLogout={handleLogout} onLogin={handleLogin} onOpenPanel={setActionPanel} globalSearch={globalSearch} onSearchChange={setGlobalSearch} searchResults={searchResults} onSearchSelect={(item) => { setGlobalSearch(""); setActiveNav(item.nav); scrollTo(item.anchor); }} />

        <motion.div className="dashboard-content" initial="hidden" animate="visible" variants={pageVariants}>
          <section id="overview" className="page-heading"><div><div className="breadcrumb"><Home size={13} /> <span>Início</span> <ChevronRight size={13} /> <strong>Visão geral</strong></div><div className="heading-row"><div><p className="eyebrow">QUARTA-FEIRA, 13 DE AGOSTO</p><h1>Olá, Ben.</h1><p className="page-subtitle">Seu dinheiro está encontrando um ritmo melhor.</p></div><div className="heading-actions"><div className="period-select-wrap"><button className="soft-button period-button" onClick={() => setPeriodOpen((value) => !value)}><CalendarDays size={15} /> {selectedPeriod} <ChevronDown size={15} /></button><AnimatePresence>{periodOpen && <motion.div className="period-menu" initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.97 }}>{["Últimos 30 dias", "Últimos 90 dias", "Este ano"].map((period) => <button key={period} onClick={() => { setSelectedPeriod(period); setPeriodOpen(false); action("Período atualizado", period); }}>{period}{selectedPeriod === period && <Check size={14} />}</button>)}</motion.div>}</AnimatePresence></div><button className="primary-button" onClick={() => setTransactionModalOpen(true)}><Plus size={16} /> Adicionar transação</button></div></div></div></section>

          <motion.section className="kpi-grid" variants={stagger}>{kpis.map((item) => <motion.article className="kpi-card" variants={child} key={item.label}><div className={`kpi-icon kpi-icon--${item.tone}`}><item.icon size={18} strokeWidth={1.8} /></div><div className="kpi-meta"><span>{item.label}</span><span className={`trend trend--${item.negative ? "negative" : "positive"}`}><TrendingUp size={12} /> {item.delta}</span></div><strong>{item.value}</strong><span className="kpi-foot">comparado ao mês anterior</span></motion.article>)}</motion.section>

          <motion.section className="savings-banner savings-banner--secondary" variants={child}><div className="savings-copy"><div className="banner-kicker"><Sparkles size={14} /> SAÚDE FINANCEIRA</div><h2>Você guardou <strong>R$ 1.644</strong> este mês</h2><p>Isso representa 34% da sua renda — seu melhor mês desde fevereiro. Três compromissos vencem nos próximos sete dias.</p><div className="banner-actions"><button className="primary-button primary-button--small" onClick={() => setActionPanel("transfer")}><ArrowUpRight size={14} /> Transferir</button><button className="ghost-button" onClick={() => setActionPanel("pay-bills")}><FileText size={14} /> Pagar contas</button></div></div><div className="banner-metrics"><Metric label="Taxa de economia" value="34%" /><Metric label="Compromissos" value="3" /><Metric label="Orçamentos acima" value="1" /></div><div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" /><div className="banner-ray" /></motion.section>

          <motion.section className="dashboard-grid dashboard-grid--primary" variants={stagger}><motion.article className="surface-card cashflow-card" variants={child}><CardHeader eyebrow="FLUXO DE CAIXA" title="Receitas vs. despesas" subtitle="Entrada, saída e saldo líquido no período" action={<div className="segmented-control">{["6M", "12M", "YTD"].map((range) => <button key={range} className={timeRange === range ? "is-active" : ""} onClick={() => setTimeRange(range)}>{range}</button>)}</div>} /><div className="chart-legend"><span><i className="legend-dot legend-dot--income" /> Receitas</span><span><i className="legend-dot legend-dot--expense" /> Despesas</span><span><i className="legend-dot legend-dot--net" /> Líquido</span></div><div className="cashflow-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 5, left: -18, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#65bfae" stopOpacity={0.24} /><stop offset="100%" stopColor="#65bfae" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f3a299" stopOpacity={0.16} /><stop offset="100%" stopColor="#f3a299" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartMuted, fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: chartMuted, fontSize: 10 }} tickFormatter={(value) => `R$${value / 1000}k`} domain={[0, 60000]} /><Tooltip cursor={{ stroke: chartGrid, strokeWidth: 1 }} contentStyle={{ backgroundColor: theme === "dark" ? "#1b2839" : "#fff", color: theme === "dark" ? "#edf3f4" : "#172033", border: 0, borderRadius: 12, boxShadow: "0 10px 30px rgba(22, 32, 54, .12)", fontSize: 12 }} formatter={(value) => formatCompactBRL(Number(value))} /><Area type="monotone" dataKey="income" stroke="#138a72" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 5, fill: "#138a72", stroke: theme === "dark" ? "#172132" : "#fff", strokeWidth: 3 }} /><Area type="monotone" dataKey="expenses" stroke="#e9857d" strokeWidth={2} fill="url(#expenseFill)" activeDot={{ r: 4, fill: "#e9857d", stroke: theme === "dark" ? "#172132" : "#fff", strokeWidth: 3 }} /><Area type="monotone" dataKey="net" stroke="#7486ca" strokeWidth={2} strokeDasharray="4 4" fill="transparent" /></AreaChart></ResponsiveContainer></div><div className="chart-bottom-stat"><div><span>Saldo líquido</span><strong>+R$ 1.644,00</strong></div><div className="stat-delta"><ArrowUpRight size={14} /> 12,4% <small>vs. mês anterior</small></div><button className="icon-button" aria-label="Mais opções do fluxo de caixa" onClick={() => setActionPanel("report")}><MoreHorizontal size={18} /></button></div></motion.article>

            <motion.article id="balance" className="surface-card balance-card" variants={child}><CardHeader eyebrow="SALDO TOTAL" title="Sua carteira" subtitle="Patrimônio consolidado" action={<div className="currency-switcher">{Object.keys(currencyValues).map((item) => <button key={item} className={currency === item ? "is-active" : ""} onClick={() => setCurrency(item)}>{item}</button>)}</div>} /><div className="balance-card-art"><div className="balance-card-top"><span>{selectedCurrency.label}</span><CreditCard size={22} /></div><div className="balance-card-label">Saldo disponível</div><strong>{selectedCurrency.available}</strong><div className="card-number">4921 &nbsp;•••• &nbsp;•••• &nbsp;7045</div><div className="card-bottom"><span>MuFinance</span><span>08/29</span></div></div><div className="balance-actions"><button className="primary-button primary-button--small" onClick={() => setActionPanel("transfer")}><ArrowUpRight size={14} /> Transferir</button><button className="soft-button soft-button--small" onClick={() => setActionPanel("deposit")}><ArrowDownLeft size={14} /> Depositar</button></div><div className="balance-summary"><div><span>Receitas</span><strong className="income-text">+R$ 4.820</strong></div><div><span>Despesas</span><strong className="expense-text">−R$ 3.176</strong></div><div><span>Guardado</span><strong>R$ 1.644</strong></div></div></motion.article></motion.section>

          <CardWallet cards={localCreditCards} onAddCard={addCreditCard} onSelectCard={(card) => action("Cartão selecionado", `${card.name} · ${card.brand}`)} />

          <motion.section className="dashboard-grid dashboard-grid--secondary" variants={stagger}><motion.article id="spending" className="surface-card spending-card" variants={child}><CardHeader eyebrow="GASTOS POR CATEGORIA" title="Onde seu dinheiro foi" subtitle="Distribuição das despesas no período" action={<button className="text-button" onClick={() => setActionPanel("report")}>Ver relatório <ChevronRight size={14} /></button>} /><div className="spending-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={spendingData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={87} paddingAngle={3} stroke="none">{spendingData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatBRL(Number(value))} contentStyle={{ border: 0, borderRadius: 12, boxShadow: "0 10px 30px rgba(22, 32, 54, .12)", fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>R$ 31,8K</strong><span>gastos</span></div></div><div className="spending-list">{spendingData.map((item, index) => <div className="spending-row" key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{formatCompactBRL(item.value)}</strong><small>{[31, 20, 14, 10, 25][index]}%</small></div>)}</div></div></motion.article>

            <motion.article className="surface-card accounts-card" variants={child}><CardHeader eyebrow="CONTAS" title="Suas contas" subtitle="Patrimônio por carteira" action={<button className="text-button" onClick={() => setActionPanel("accounts")}>Gerenciar <ChevronRight size={14} /></button>} /><div className="account-list">{accounts.map((account) => <button className="account-row" key={account.name} onClick={() => { setSelectedAccount(account.name); setActionPanel("accounts"); }}><span className={`account-icon account-icon--${account.tone}`}>{navIcon(account.icon)}</span><span className="account-info"><strong>{account.name}</strong><small>{account.number}</small></span><span className="account-value"><strong>{account.value}</strong><small className={account.tone === "peach" ? "account-alert" : ""}>{account.change}</small></span><ChevronRight className="account-chevron" size={15} /></button>)}</div></motion.article></motion.section>

          <motion.section className="dashboard-grid dashboard-grid--secondary" variants={stagger}><motion.article id="budget" className="surface-card budget-card" variants={child}><CardHeader eyebrow="ORÇAMENTO" title="Uso dos envelopes" subtitle="Agosto · limite mensal" action={<button className="text-button" onClick={() => setActionPanel("budget")}>Ajustar <ChevronRight size={14} /></button>} /><div className="budget-list">{budgets.map((item) => <div className="budget-row" key={item.label}><div className="budget-row-head"><span>{item.label}</span><strong>{item.value} <small>/ {item.limit}</small></strong></div><div className="progress-track"><motion.div className={`progress-fill progress-fill--${item.tone}`} initial={{ width: 0 }} whileInView={{ width: `${Math.min(item.progress, 100)}%` }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.15 }} /></div></div>)}</div><div className="budget-alert"><ZapIcon /><span><strong>Alimentação</strong> está 3% acima do seu limite.</span><button onClick={() => setActionPanel("budget")} aria-label="Ver sugestão"><ChevronRight size={15} /></button></div></motion.article>

            <motion.article id="bills" className="surface-card bills-card" variants={child}><CardHeader eyebrow="PRÓXIMOS COMPROMISSOS" title="Contas a pagar" subtitle="O que merece atenção" action={<button className="text-button" onClick={() => setActionPanel("schedule")}>Agendar <ChevronRight size={14} /></button>} /><div className="bills-list">{upcomingBills.map((bill) => <button className={`bill-row ${paidBills.includes(bill.label) ? "is-paid" : ""}`} key={bill.label} onClick={() => { setSelectedBill(bill.label); setActionPanel("pay-bills"); }}><span className={`bill-date bill-date--${bill.tone}`}><CalendarDays size={15} /><small>{bill.date}</small></span><span className="bill-info"><strong>{bill.label}</strong><small>{paidBills.includes(bill.label) ? "pago nesta sessão" : bill.days}</small></span><span className="bill-amount">{paidBills.includes(bill.label) ? "Pago" : bill.amount}</span><ChevronRight size={15} /></button>)}</div></motion.article></motion.section>

          <motion.section id="transactions" className="surface-card transactions-card" variants={child}><CardHeader eyebrow="ATIVIDADE RECENTE" title="Últimos lançamentos" subtitle="Clique em um lançamento para editar" action={<div className="transactions-actions"><button className="soft-button soft-button--small" onClick={() => setActionPanel("filters")}><Filter size={14} /> Filtrar</button><button className="text-button" onClick={() => { setActiveNav("Extrato"); scrollTo("transactions"); action("Extrato completo aberto"); }}>Ver tudo <ChevronRight size={14} /></button></div>} /><div className="transactions-table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th className="amount-cell">Valor</th><th /></tr></thead><tbody>{filteredTransactions.map((transaction) => <tr key={`${transaction.date}-${transaction.payee}-${transaction.amount}`} className="transaction-row" tabIndex={0} role="button" onClick={() => editTransaction(transaction)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editTransaction(transaction); } }}><td className="muted-cell">{transaction.date}</td><td><span className={`transaction-icon transaction-icon--${transaction.type}`}>{transaction.type === "income" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><strong>{transaction.payee}</strong></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-cell">{transaction.account}</td><td className={`amount-cell ${transaction.type === "income" ? "income-text" : "expense-text"}`}>{transaction.type === "income" ? "+" : "−"}{formatBRL(transaction.amount).replace("R$ ", "R$ ")}</td><td className="transaction-edit-cell"><span>Editar</span><ChevronRight size={15} /></td></tr>)}</tbody></table>{filteredTransactions.length === 0 && <div className="table-empty"><Filter size={18} /><strong>Nenhum lançamento encontrado</strong><span>Limpe os filtros para ver todas as movimentações.</span></div>}</div></motion.section>

          <footer className="dashboard-footer"><span>© 2026 MuFinance · Versão React</span><div><button onClick={() => setActionPanel("about")}>Sobre</button><button onClick={() => setActionPanel("support")}>Suporte</button><button onClick={() => setActionPanel("privacy")}>Privacidade</button></div><span className="footer-secure"><Check size={13} /> Seus dados estão protegidos</span></footer>
        </motion.div>
      </main>

      <MobileNav activeNav={activeNav} onSelect={handleNavSelect} onMore={() => setMobileOpen(true)} />
      <TransactionModal open={transactionModalOpen} onClose={() => { setTransactionModalOpen(false); setEditingTransaction(null); }} onSubmit={addTransaction} editingTransaction={editingTransaction} accountOptions={transactionAccountOptions} creditCards={localCreditCards} />
      <ActionPanels actionPanel={actionPanel} selectedBill={selectedBill} selectedAccount={selectedAccount} selectedTransaction={selectedTransaction} paidBills={paidBills} transferAmount={transferAmount} transferDestination={transferDestination} depositAmount={depositAmount} scheduleDate={scheduleDate} budgetAdjusted={budgetAdjusted} accountConnected={accountConnected} scheduledReminder={scheduledReminder} supportView={supportView} supportMessage={supportMessage} sessionActive={sessionActive} reportTransactions={filteredTransactions} transactionTypeFilter={transactionTypeFilter} transactionCategoryFilter={transactionCategoryFilter} transactionCategories={transactionCategories} onClose={closePanels} onOpenPanel={setActionPanel} onSelectBill={(label) => { setSelectedBill(label); setActionPanel("pay-bills"); }} onSelectAccount={(name) => { setSelectedAccount(name); setActionPanel("accounts"); }} onTransferAmount={setTransferAmount} onTransferDestination={setTransferDestination} onDepositAmount={setDepositAmount} onScheduleDate={setScheduleDate} onSubmitTransfer={submitTransfer} onSubmitDeposit={submitDeposit} onMarkBillAsPaid={markBillAsPaid} onSchedule={handleSchedule} onExport={exportTransactions} onDuplicate={duplicateSelectedTransaction} onDelete={deleteSelectedTransaction} onConnectAccount={handleConnectAccount} onBudgetSave={() => { setBudgetAdjusted(true); closePanels(); action("Orçamento atualizado", "O limite de alimentação foi sinalizado para revisão."); }} onSupportChoice={setSupportView} onSupportMessage={setSupportMessage} onSubmitSupport={handleSupportSubmit} onLogin={handleLogin} onTransactionTypeFilter={setTransactionTypeFilter} onTransactionCategoryFilter={setTransactionCategoryFilter} />
    </div>
  );
}

function Sidebar({ collapsed, mobileOpen, activeNav, filteredNav, query, setQuery, onSelect, onCollapse, onExport }: { collapsed: boolean; mobileOpen: boolean; activeNav: string; filteredNav: typeof navItems; query: string; setQuery: (value: string) => void; onSelect: (label: string) => void; onCollapse: () => void; onExport: () => void }) {
  return <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}><div className="brand"><div className="brand-mark"><img src="/manus-storage/mufinance-logo_40c68aae.png" alt="" /></div>{!collapsed && <span className="brand-wordmark"><b>Mu</b>Finance</span>}<span className="brand-version">R2</span></div><div className="sidebar-search"><Search size={15} />{!collapsed && <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar menu…" aria-label="Filtrar menu" />}</div>{!collapsed && <p className="sidebar-label">MENU PRINCIPAL</p>}<nav className="sidebar-nav" aria-label="Navegação principal">{filteredNav.map((item) => <button key={item.label} className={`nav-item ${activeNav === item.label ? "is-active" : ""}`} onClick={() => onSelect(item.label)} title={collapsed ? item.label : undefined}><span className="nav-icon">{navIcon(item.icon)}</span>{!collapsed && <><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</>}</button>)}</nav>{!collapsed && <><div className="sidebar-divider" /><p className="sidebar-label">ATALHOS</p><button className="nav-item" onClick={() => onSelect("Insights")}><span className="nav-icon"><Sparkles size={17} /></span><span>Insights</span><span className="new-badge">Novo</span></button><button className="nav-item" onClick={onExport}><span className="nav-icon"><Download size={17} /></span><span>Exportar dados</span></button></>}<div className="sidebar-bottom"><button className="nav-item collapse-button" onClick={onCollapse} title={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />} {!collapsed && <span>Recolher menu</span>}</button>{!collapsed && <button className="sidebar-user" onClick={() => onSelect("Perfil")}><div className="avatar">B</div><div><strong>Ben Oliveira</strong><small>ben@exemplo.com</small></div><MoreHorizontal size={16} /></button>}</div></aside>;
}

type TopBarProps = { compactMode: boolean; onCompact: () => void; onMenu: () => void; language: string; languageOpen: boolean; onLanguageToggle: () => void; onLanguageSelect: (value: string) => void; notificationsOpen: boolean; onNotificationsToggle: () => void; profileOpen: boolean; onProfileToggle: () => void; sessionActive: boolean; onLogout: () => void; onLogin: () => void; onOpenPanel: (panel: ActionPanel) => void; globalSearch: string; onSearchChange: (value: string) => void; searchResults: SearchItem[]; onSearchSelect: (item: SearchItem) => void };

function TopBar({ compactMode, onCompact, onMenu, language, languageOpen, onLanguageToggle, onLanguageSelect, notificationsOpen, onNotificationsToggle, profileOpen, onProfileToggle, sessionActive, onLogout, onLogin, onOpenPanel, globalSearch, onSearchChange, searchResults, onSearchSelect }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const hasSearch = globalSearch.trim().length > 0;
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenu} aria-label="Abrir menu"><Menu size={20} /></button><div className="topbar-search"><Search size={16} /><input value={globalSearch} onChange={(event) => onSearchChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && searchResults[0]) onSearchSelect(searchResults[0]); }} placeholder="Pesquisar ou ir para…" aria-label="Pesquisar ou ir para" /><kbd>⌘K</kbd>{hasSearch && <div className="search-results" role="listbox">{searchResults.length ? searchResults.map((item) => <button key={item.label} type="button" onClick={() => onSearchSelect(item)}><Search size={13} /><span>{item.label}</span><small>{item.nav}</small></button>) : <span className="search-empty">Nenhum destino encontrado</span>}</div>}</div><div className="topbar-actions"><div className="topbar-popover-wrap"><button className="topbar-icon-button language-button" onClick={onLanguageToggle} aria-expanded={languageOpen}><Globe2 size={16} /><span>{language}</span></button>{languageOpen && <div className="popover-panel language-panel">{["PT", "EN", "ES"].map((item) => <button key={item} className={language === item ? "is-selected" : ""} onClick={() => onLanguageSelect(item)}>{item}{language === item && <Check size={13} />}</button>)}</div>}</div><button className={`topbar-icon-button ${compactMode ? "is-active" : ""}`} onClick={onCompact} aria-label={compactMode ? "Desativar modo compacto" : "Ativar modo compacto"} aria-pressed={compactMode} title={compactMode ? "Desativar modo compacto" : "Ativar modo compacto"}><Eye size={17} /></button><button className="topbar-icon-button theme-toggle-button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button><div className="topbar-popover-wrap"><button className="topbar-icon-button notification-button" onClick={onNotificationsToggle} aria-label="Abrir notificações" aria-expanded={notificationsOpen}><Bell size={17} /><span>2</span></button>{notificationsOpen && <div className="popover-panel notification-panel"><div className="popover-heading"><strong>Notificações</strong><button onClick={onNotificationsToggle} aria-label="Fechar notificações"><X size={14} /></button></div><div className="notification-item"><span className="notification-dot notification-dot--mint" /><div><strong>Orçamento em atenção</strong><small>Alimentação está 3% acima do limite.</small></div></div><div className="notification-item"><span className="notification-dot notification-dot--coral" /><div><strong>Vencimento próximo</strong><small>Cartão Mu Platinum vence em 2 dias.</small></div></div><button className="popover-link" onClick={() => { onNotificationsToggle(); onOpenPanel("settings"); }}><RefreshCw size={13} /> Gerenciar notificações</button></div>}</div><div className="topbar-popover-wrap"><button className="topbar-avatar" onClick={onProfileToggle} aria-label="Abrir perfil" aria-expanded={profileOpen}>B</button>{profileOpen && <div className="popover-panel profile-panel"><div className="profile-heading"><div className="avatar">B</div><div><strong>Ben Oliveira</strong><small>{sessionActive ? "ben@exemplo.com" : "Sessão encerrada"}</small></div></div>{sessionActive ? <><button onClick={() => { onProfileToggle(); onOpenPanel("about"); }}><UserRound size={14} /> Minha conta</button><button onClick={() => { onProfileToggle(); onOpenPanel("settings"); }}><Settings size={14} /> Configurações</button><button onClick={onLogout}><LogOut size={14} /> Encerrar sessão</button></> : <button onClick={onLogin}><RefreshCw size={14} /> Reabrir sessão</button>}</div>}</div></div></header>;
}

function MobileNav({ activeNav, onSelect, onMore }: { activeNav: string; onSelect: (label: string) => void; onMore: () => void }) {
  const items = navItems.slice(0, 4);
  return <nav className="mobile-nav" aria-label="Navegação mobile">{items.map((item) => <button key={item.label} className={activeNav === item.label ? "is-active" : ""} onClick={() => onSelect(item.label)}>{navIcon(item.icon)}<span>{item.label}</span></button>)}<button onClick={onMore}><Menu size={18} /><span>Mais</span></button></nav>;
}

function CardHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="card-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="card-subtitle">{subtitle}</p></div>{action}</div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="banner-metric"><span>{label}</span><strong>{value}</strong></div>; }
function ZapIcon() { return <Sparkles size={15} />; }

type ActionPanelsProps = {
  actionPanel: ActionPanel;
  selectedBill: string | null;
  selectedAccount: string | null;
  selectedTransaction: Transaction | null;
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
  onClose: () => void;
  onOpenPanel: (panel: ActionPanel) => void;
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

function ActionPanels({ actionPanel, selectedBill, selectedAccount, selectedTransaction, paidBills, transferAmount, transferDestination, depositAmount, scheduleDate, budgetAdjusted, accountConnected, scheduledReminder, supportView, supportMessage, sessionActive, reportTransactions, transactionTypeFilter, transactionCategoryFilter, transactionCategories, onClose, onOpenPanel, onSelectBill, onSelectAccount, onTransferAmount, onTransferDestination, onDepositAmount, onScheduleDate, onSubmitTransfer, onSubmitDeposit, onMarkBillAsPaid, onSchedule, onExport, onDuplicate, onDelete, onConnectAccount, onBudgetSave, onSupportChoice, onSupportMessage, onSubmitSupport, onLogin, onTransactionTypeFilter, onTransactionCategoryFilter }: ActionPanelsProps) {
  const account = accounts.find((item) => item.name === selectedAccount);
  const bill = upcomingBills.find((item) => item.label === selectedBill);
  const dialog = (eyebrow: string, title: string, description: string, icon: React.ReactNode, children: React.ReactNode, footer?: React.ReactNode) => <ActionDialog open onClose={onClose} eyebrow={eyebrow} title={title} description={description} icon={icon} footer={footer}>{children}</ActionDialog>;
  if (!actionPanel) return null;

  if (actionPanel === "transfer") return dialog("MOVIMENTAÇÃO", "Transferir dinheiro", "Escolha o destino e confirme o valor da transferência.", <ArrowUpRight size={17} />, <form className="transaction-form" onSubmit={onSubmitTransfer}><label className="form-field form-field--wide"><span>Valor</span><div className="amount-shell"><b>R$</b><input autoFocus inputMode="decimal" value={transferAmount} onChange={(event) => onTransferAmount(event.target.value)} placeholder="0,00" /></div></label><label className="form-field form-field--wide"><span>Destino</span><div className="select-shell"><Wallet size={15} /><select value={transferDestination} onChange={(event) => onTransferDestination(event.target.value)}><option>Conta principal</option><option>Reserva de emergência</option><option>Caixinha viagem</option></select><ChevronDown size={14} /></div></label><p className="dialog-hint"><ShieldCheck size={14} /> A transferência será preparada apenas nesta sessão demonstrativa.</p><div className="modal-actions"><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><ArrowUpRight size={15} /> Confirmar transferência</button></div></form>);
  if (actionPanel === "deposit") return dialog("MOVIMENTAÇÃO", "Preparar depósito", "Registre uma entrada planejada para acompanhar seu saldo.", <ArrowDownLeft size={17} />, <form className="transaction-form" onSubmit={onSubmitDeposit}><label className="form-field form-field--wide"><span>Valor do depósito</span><div className="amount-shell"><b>R$</b><input autoFocus inputMode="decimal" value={depositAmount} onChange={(event) => onDepositAmount(event.target.value)} placeholder="0,00" /></div></label><div className="deposit-method"><div><strong>PIX · Conta principal</strong><small>Disponível imediatamente</small></div><Check size={16} /></div><div className="modal-actions"><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><ArrowDownLeft size={15} /> Preparar depósito</button></div></form>);
  if (actionPanel === "pay-bills") return dialog("COMPROMISSOS", selectedBill ? selectedBill : "Pagar contas", selectedBill && bill ? `${bill.amount} · vence em ${bill.days}.` : "Selecione uma conta para revisar, marcar como paga ou acompanhar.", <FileText size={17} />, <div className="action-list">{upcomingBills.map((item) => <button key={item.label} className={`action-list-item ${selectedBill === item.label ? "is-selected" : ""}`} onClick={() => onSelectBill(item.label)}><span className={`bill-date bill-date--${item.tone}`}><CalendarDays size={14} /><small>{item.date}</small></span><span><strong>{item.label}</strong><small>{paidBills.includes(item.label) ? "Pago nesta sessão" : `${item.amount} · ${item.days}`}</small></span><ChevronRight size={15} /></button>)}</div>, <><button className="soft-button" type="button" onClick={onClose}>Fechar</button><button className="primary-button" type="button" disabled={!selectedBill || paidBills.includes(selectedBill)} onClick={onMarkBillAsPaid}><Check size={15} /> Marcar como paga</button></>);
  if (actionPanel === "schedule") return dialog("AGENDA", "Agendar compromisso", "Escolha quando o lembrete deve aparecer para você.", <CalendarDays size={17} />, <div className="transaction-form"><label className="form-field form-field--wide"><span>Data do lembrete</span><div className="input-shell"><CalendarDays size={15} /><input type="date" value={scheduleDate} onChange={(event) => onScheduleDate(event.target.value)} /></div></label><div className="dialog-hint"><MessageCircle size={14} /> Você receberá um alerta dentro do dashboard na data selecionada.</div>{scheduledReminder && <p className="dialog-hint"><Check size={14} /> Último lembrete: {scheduledReminder}</p>}</div>, <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="button" onClick={onSchedule}><CalendarDays size={15} /> Salvar lembrete</button></>);
  if (actionPanel === "report") return dialog("ANÁLISE", "Relatório financeiro", "Resumo dos lançamentos locais e da distribuição por categoria.", <TrendingUp size={17} />, <div className="report-summary"><div className="detail-stat"><span>Receitas filtradas</span><strong className="income-text">+{formatBRL(reportTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0))}</strong></div><div className="detail-stat"><span>Despesas filtradas</span><strong className="expense-text">−{formatBRL(reportTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0))}</strong></div><div className="detail-stat"><span>Transações</span><strong>{localTransactionCount(reportTransactions)}</strong></div></div>, <><button className="soft-button" type="button" onClick={onClose}>Fechar</button><button className="primary-button" type="button" onClick={onExport}><Download size={15} /> Exportar CSV</button></>);
  if (actionPanel === "accounts") return dialog("CARTEIRAS", account ? account.name : "Gerenciar contas", account ? `${account.number} · ${account.change}.` : "Selecione uma conta para ver seus detalhes.", <Wallet size={17} />, <div className="action-list">{accounts.map((item) => <button key={item.name} className={`action-list-item ${selectedAccount === item.name ? "is-selected" : ""}`} onClick={() => onSelectAccount(item.name)}><span className={`account-icon account-icon--${item.tone}`}>{navIcon(item.icon)}</span><span><strong>{item.name}</strong><small>{item.value} · {item.number}</small></span><ChevronRight size={15} /></button>)}{accountConnected && <p className="dialog-hint"><Check size={14} /> Conta demonstrativa conectada nesta sessão.</p>}</div>, <><button className="soft-button" type="button" onClick={onClose}>Fechar</button><button className="primary-button" type="button" disabled={accountConnected} onClick={() => { onConnectAccount(); onClose(); }}><Link2 size={15} /> {accountConnected ? "Conta conectada" : "Conectar conta"}</button></>);
  if (actionPanel === "budget") return dialog("ORÇAMENTO", "Ajustar envelopes", "Revise a categoria que passou do limite e salve a sua intenção.", <SlidersHorizontal size={17} />, <div className="budget-dialog"><div className="budget-dialog-row"><div><strong>Alimentação</strong><small>R$ 6,2K utilizados de R$ 6K</small></div><span className="budget-alert-chip">+3%</span></div><div className="progress-track"><div className="progress-fill progress-fill--coral" style={{ width: "100%" }} /></div>{budgetAdjusted && <p className="dialog-hint"><Check size={14} /> Revisão já sinalizada nesta sessão.</p>}</div>, <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="button" onClick={onBudgetSave}><Check size={15} /> Salvar ajuste</button></>);
  if (actionPanel === "filters") return dialog("EXTRATO", "Filtrar lançamentos", "Refine a atividade recente sem sair da visão geral.", <Filter size={17} />, <div className="filter-grid"><label className="form-field"><span>Tipo</span><div className="select-shell"><Filter size={15} /><select value={transactionTypeFilter} onChange={(event) => onTransactionTypeFilter(event.target.value as "all" | Transaction["type"])}><option value="all">Todos</option><option value="income">Receitas</option><option value="expense">Despesas</option></select><ChevronDown size={14} /></div></label><label className="form-field"><span>Categoria</span><div className="select-shell"><Wallet size={15} /><select value={transactionCategoryFilter} onChange={(event) => onTransactionCategoryFilter(event.target.value)}>{transactionCategories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label></div>, <><button className="soft-button" type="button" onClick={() => { onTransactionTypeFilter("all"); onTransactionCategoryFilter("Todas"); }}>Limpar</button><button className="primary-button" type="button" onClick={onClose}><Check size={15} /> Aplicar filtros</button></>);
  if (actionPanel === "transaction") return dialog("LANÇAMENTO", selectedTransaction?.payee ?? "Detalhes", selectedTransaction ? `${selectedTransaction.category} · ${selectedTransaction.account}` : "Veja os detalhes desta movimentação.", selectedTransaction?.type === "income" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />, selectedTransaction ? <div className="transaction-detail"><div className="detail-stat"><span>Valor</span><strong className={selectedTransaction.type === "income" ? "income-text" : "expense-text"}>{selectedTransaction.type === "income" ? "+" : "−"}{formatBRL(selectedTransaction.amount)}</strong></div><div className="detail-stat"><span>Data</span><strong>{selectedTransaction.date}</strong></div><div className="detail-stat"><span>Categoria</span><strong>{selectedTransaction.category}</strong></div></div> : null, <><button className="soft-button" type="button" onClick={onDuplicate}><RefreshCw size={15} /> Duplicar</button><button className="danger-button" type="button" onClick={onDelete}><X size={15} /> Remover</button></>);
  if (actionPanel === "about") return dialog("PERFIL", "Minha conta", "Dados básicos do seu espaço MuFinance.", <UserRound size={17} />, <div className="profile-detail"><div className="profile-heading"><div className="avatar avatar--large">B</div><div><strong>Ben Oliveira</strong><small>ben@exemplo.com</small></div></div><div className="detail-stat"><span>Plano</span><strong>MuFinance pessoal</strong></div><div className="detail-stat"><span>Conta criada</span><strong>Janeiro de 2024</strong></div></div>, <button className="primary-button" type="button" onClick={onClose}>Fechar</button>);
  if (actionPanel === "support") return dialog("AJUDA", "Suporte MuFinance", supportView === "help" ? "Consulte respostas rápidas para continuar sem sair do dashboard." : supportView === "contact" ? "Envie uma mensagem e registraremos o atendimento nesta sessão." : "Escolha uma forma de continuar o atendimento.", <CircleHelp size={17} />, supportView === "home" ? <div className="action-list"><button className="action-list-item" onClick={() => onSupportChoice("help")}><span className="list-icon"><CircleHelp size={15} /></span><span><strong>Central de ajuda</strong><small>Consulte respostas rápidas.</small></span><ChevronRight size={15} /></button><button className="action-list-item" onClick={() => onSupportChoice("contact")}><span className="list-icon"><MailIcon /></span><span><strong>Falar com suporte</strong><small>Envie uma mensagem para o time.</small></span><ChevronRight size={15} /></button></div> : supportView === "help" ? <div className="support-faq"><div><strong>Como adiciono uma transação?</strong><p>Use o botão Adicionar transação no topo e confirme valor e categoria.</p></div><div><strong>Onde encontro o extrato?</strong><p>Abra Extrato na navegação lateral ou use a busca rápida.</p></div><button className="text-button" type="button" onClick={() => onSupportChoice("contact")}>Ainda preciso de ajuda <ChevronRight size={14} /></button></div> : <form id="support-form" className="transaction-form" onSubmit={onSubmitSupport}><label className="form-field form-field--wide"><span>Mensagem</span><textarea value={supportMessage} onChange={(event) => onSupportMessage(event.target.value)} autoFocus placeholder="Descreva o que você precisa…" rows={5} /></label><button className="text-button" type="button" onClick={() => onSupportChoice("home")}>Voltar para opções</button><div className="dialog-hint"><MessageCircle size={14} /> O atendimento é simulado e não envia dados para fora desta sessão.</div></form>, supportView === "contact" ? <><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" form="support-form"><MessageCircle size={15} /> Enviar mensagem</button></> : <button className="soft-button" type="button" onClick={onClose}>Fechar</button>);
  if (actionPanel === "privacy") return dialog("SEGURANÇA", "Privacidade e dados", "Controle como seus dados locais são tratados nesta demonstração.", <ShieldCheck size={17} />, <div className="privacy-copy"><p>Os lançamentos criados aqui ficam apenas no estado da sessão do navegador. Nenhum dado bancário real é conectado ou enviado.</p><div className="privacy-badge"><ShieldCheck size={16} /><strong>Dados protegidos nesta sessão</strong></div></div>, <button className="primary-button" type="button" onClick={onClose}>Entendi</button>);
  if (actionPanel === "insights") return dialog("INSIGHTS", "Seu próximo movimento", "Uma leitura rápida baseada nos dados demonstrativos do dashboard.", <Sparkles size={17} />, <div className="insight-card"><div className="insight-card-icon"><TrendingUp size={18} /></div><div><strong>Reduza Alimentação em 3%</strong><p>Esse ajuste mantém o envelope dentro do limite mensal sem mexer na reserva.</p></div></div>, <button className="primary-button" type="button" onClick={() => { onClose(); onOpenPanel("budget"); }}>Revisar orçamento</button>);
  if (actionPanel === "session") return dialog("SESSÃO", "Sessão encerrada", "O estado local foi mantido neste navegador, mas o perfil está desconectado.", <LogOut size={17} />, <div className="privacy-copy"><p>Você pode reabrir a sessão demonstrativa para continuar testando as interações.</p><div className="privacy-badge"><ShieldCheck size={16} /><strong>Dados locais preservados</strong></div></div>, <button className="primary-button" type="button" onClick={onLogin}><RefreshCw size={15} /> Reabrir sessão</button>);
  return dialog("PREFERÊNCIAS", "Configurações", "Ajuste a forma como o MuFinance se comporta nesta sessão.", <Settings size={17} />, <div className="settings-list"><div className="settings-row"><span><Eye size={15} /><div><strong>Modo compacto</strong><small>Reduz o espaçamento entre módulos.</small></div></span><span className="status-pill">Ativo no cabeçalho</span></div><div className="settings-row"><span><Bell size={15} /><div><strong>Alertas</strong><small>Contas e orçamentos prioritários.</small></div></span><span className="status-pill status-pill--on">Ligados</span></div></div>, <button className="primary-button" type="button" onClick={onClose}>Salvar preferências</button>);
}

function localTransactionCount(items: Transaction[]) { return `${items.length} lançamentos`; }
function ExternalLinkIcon() { return <Link2 size={15} />; }
function MailIcon() { return <MessageCircle size={15} />; }
