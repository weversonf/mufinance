// MuFinance React — Soft Swiss Fintech / editorial dashboard.
// Sidebar assimétrica, superfícies calmas, farol esmeralda e movimento curto com propósito.

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  Globe2,
  Home,
  Landmark,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UserRound,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { accounts, budgets, cashflowData, formatBRL, formatCompactBRL, navItems, spendingData, transactions, upcomingBills, type Transaction } from "@/lib/financeData";
import { useTheme } from "@/contexts/ThemeContext";
import { NewTransactionPayload, TransactionModal } from "./TransactionModal";

type IconName = "home" | "receipt" | "chart" | "card" | "target" | "wallet" | "user" | "settings" | "bank" | "sparkles";

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

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const child = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42 } },
};

const kpis = [
  { label: "Saldo total", value: "R$ 32.540", delta: "+3,1%", icon: Wallet, tone: "mint" },
  { label: "Receitas do mês", value: "R$ 4.820", delta: "+4,0%", icon: ArrowDownLeft, tone: "blue" },
  { label: "Despesas do mês", value: "R$ 3.176", delta: "+6,7%", icon: ArrowUpRight, tone: "lavender", negative: true },
  { label: "Taxa de economia", value: "34%", delta: "+1,5%", icon: Sparkles, tone: "peach" },
];

const navIcon = (name: string) => {
  const Icon = iconMap[name as IconName] ?? LayoutDashboard;
  return <Icon size={17} strokeWidth={1.8} />;
};

const currencyValues: Record<string, { main: string; available: string; label: string }> = {
  BRL: { main: "R$ 32.540", available: "R$ 32.540,00", label: "MuFinance · Principal" },
  USD: { main: "$ 5.820", available: "$ 5,820.00", label: "MuFinance · Internacional" },
  EUR: { main: "€ 4.210", available: "€ 4.210,00", label: "MuFinance · Europa" },
};

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
  const { theme } = useTheme();

  const filteredNav = useMemo(() => navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const selectedCurrency = currencyValues[currency];
  const chartMuted = theme === "dark" ? "#9aaabd" : "#9aa2b4";
  const chartGrid = theme === "dark" ? "#2b3849" : "#eef0f5";

  const action = (message: string) => toast.success(message, { description: "Esta interação está pronta para receber dados reais." });
  const addTransaction = (transaction: NewTransactionPayload) => {
    setLocalTransactions((current) => [{ ...transaction, date: "13 ago" }, ...current]);
    setTransactionModalOpen(false);
    toast.success("Transação adicionada", { description: `${transaction.payee} · ${formatBRL(transaction.amount)}` });
  };

  return (
    <div className="app-shell">
      <AnimatePresence>
        {mobileOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileOpen} activeNav={activeNav} filteredNav={filteredNav} query={query} setQuery={setQuery} onSelect={(label) => { setActiveNav(label); setMobileOpen(false); }} onCollapse={() => setSidebarCollapsed((value) => !value)} />

      <main className={`main-area ${sidebarCollapsed ? "main-area--wide" : ""}`}>
        <TopBar onMenu={() => setMobileOpen(true)} onAction={action} />

        <motion.div className="dashboard-content" initial="hidden" animate="visible" variants={pageVariants}>
          <section className="page-heading">
            <div>
              <div className="breadcrumb"><Home size={13} /> <span>Início</span> <ChevronRight size={13} /> <strong>Visão geral</strong></div>
              <div className="heading-row">
                <div>
                  <p className="eyebrow">QUARTA-FEIRA, 13 DE AGOSTO</p>
                  <h1>Olá, Ben.</h1>
                  <p className="page-subtitle">Seu dinheiro está encontrando um ritmo melhor.</p>
                </div>
                <div className="heading-actions">
                  <div className="period-select-wrap">
                    <button className="soft-button period-button" onClick={() => setPeriodOpen((value) => !value)}><CalendarDays size={15} /> {selectedPeriod} <ChevronDown size={15} /></button>
                    <AnimatePresence>
                      {periodOpen && <motion.div className="period-menu" initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.97 }}>
                        {["Últimos 30 dias", "Últimos 90 dias", "Este ano"].map((period) => <button key={period} onClick={() => { setSelectedPeriod(period); setPeriodOpen(false); }}>{period}{selectedPeriod === period && <Check size={14} />}</button>)}
                      </motion.div>}
                    </AnimatePresence>
                  </div>
                  <button className="primary-button" onClick={() => setTransactionModalOpen(true)}><Plus size={16} /> Adicionar transação</button>
                </div>
              </div>
            </div>
          </section>

          <motion.section className="savings-banner" variants={child}>
            <div className="savings-copy">
              <div className="banner-kicker"><Sparkles size={14} /> SAÚDE FINANCEIRA</div>
              <h2>Você guardou <strong>R$ 1.644</strong> este mês</h2>
              <p>Isso representa 34% da sua renda — seu melhor mês desde fevereiro. Três compromissos vencem nos próximos sete dias.</p>
              <div className="banner-actions"><button className="primary-button primary-button--small" onClick={() => action("Transferência preparada")}><ArrowUpRight size={14} /> Transferir</button><button className="ghost-button" onClick={() => action("Contas a pagar abertas")}><FileText size={14} /> Pagar contas</button></div>
            </div>
            <div className="banner-metrics"><Metric label="Taxa de economia" value="34%" /><Metric label="Compromissos" value="3" /><Metric label="Orçamentos acima" value="1" /></div>
            <div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" /><div className="banner-ray" />
          </motion.section>

          <motion.section className="kpi-grid" variants={stagger}>
            {kpis.map((item) => <motion.article className="kpi-card" variants={child} key={item.label}><div className={`kpi-icon kpi-icon--${item.tone}`}><item.icon size={18} strokeWidth={1.8} /></div><div className="kpi-meta"><span>{item.label}</span><span className={`trend trend--${item.negative ? "negative" : "positive"}`}><TrendingUp size={12} /> {item.delta}</span></div><strong>{item.value}</strong><span className="kpi-foot">comparado ao mês anterior</span></motion.article>)}
          </motion.section>

          <motion.section className="dashboard-grid dashboard-grid--primary" variants={stagger}>
            <motion.article className="surface-card cashflow-card" variants={child}>
              <CardHeader eyebrow="FLUXO DE CAIXA" title="Receitas vs. despesas" subtitle="Entrada, saída e saldo líquido no período" action={<div className="segmented-control">{["6M", "12M", "YTD"].map((range) => <button key={range} className={timeRange === range ? "is-active" : ""} onClick={() => setTimeRange(range)}>{range}</button>)}</div>} />
              <div className="chart-legend"><span><i className="legend-dot legend-dot--income" /> Receitas</span><span><i className="legend-dot legend-dot--expense" /> Despesas</span><span><i className="legend-dot legend-dot--net" /> Líquido</span></div>
              <div className="cashflow-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashflowData} margin={{ top: 8, right: 5, left: -18, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#65bfae" stopOpacity={0.24} /><stop offset="100%" stopColor="#65bfae" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f3a299" stopOpacity={0.16} /><stop offset="100%" stopColor="#f3a299" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartMuted, fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: chartMuted, fontSize: 10 }} tickFormatter={(value) => `R$${value / 1000}k`} domain={[0, 60000]} /><Tooltip cursor={{ stroke: chartGrid, strokeWidth: 1 }} contentStyle={{ backgroundColor: theme === "dark" ? "#1b2839" : "#fff", color: theme === "dark" ? "#edf3f4" : "#172033", border: 0, borderRadius: 12, boxShadow: "0 10px 30px rgba(22, 32, 54, .12)", fontSize: 12 }} formatter={(value) => formatCompactBRL(Number(value))} /><Area type="monotone" dataKey="income" stroke="#138a72" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 5, fill: "#138a72", stroke: theme === "dark" ? "#172132" : "#fff", strokeWidth: 3 }} /><Area type="monotone" dataKey="expenses" stroke="#e9857d" strokeWidth={2} fill="url(#expenseFill)" activeDot={{ r: 4, fill: "#e9857d", stroke: theme === "dark" ? "#172132" : "#fff", strokeWidth: 3 }} /><Area type="monotone" dataKey="net" stroke="#7486ca" strokeWidth={2} strokeDasharray="4 4" fill="transparent" /></AreaChart></ResponsiveContainer></div>
              <div className="chart-bottom-stat"><div><span>Saldo líquido</span><strong>+R$ 1.644,00</strong></div><div className="stat-delta"><ArrowUpRight size={14} /> 12,4% <small>vs. mês anterior</small></div><button className="icon-button" aria-label="Mais opções" onClick={() => action("Opções do fluxo de caixa")}><MoreHorizontal size={18} /></button></div>
            </motion.article>

            <motion.article className="surface-card balance-card" variants={child}>
              <CardHeader eyebrow="SALDO TOTAL" title="Sua carteira" subtitle="Patrimônio consolidado" action={<div className="currency-switcher">{Object.keys(currencyValues).map((item) => <button key={item} className={currency === item ? "is-active" : ""} onClick={() => setCurrency(item)}>{item}</button>)}</div>} />
              <div className="balance-card-art"><div className="balance-card-top"><span>{selectedCurrency.label}</span><CreditCard size={22} /></div><div className="balance-card-label">Saldo disponível</div><strong>{selectedCurrency.available}</strong><div className="card-number">4921 &nbsp;•••• &nbsp;•••• &nbsp;7045</div><div className="card-bottom"><span>Mu Finance</span><span>08/29</span></div></div>
              <div className="balance-actions"><button className="primary-button primary-button--small" onClick={() => action("Transferência preparada")}><ArrowUpRight size={14} /> Transferir</button><button className="soft-button soft-button--small" onClick={() => action("Depósito preparado")}><ArrowDownLeft size={14} /> Depositar</button></div>
              <div className="balance-summary"><div><span>Receitas</span><strong className="income-text">+R$ 4.820</strong></div><div><span>Despesas</span><strong className="expense-text">−R$ 3.176</strong></div><div><span>Guardado</span><strong>R$ 1.644</strong></div></div>
            </motion.article>
          </motion.section>

          <motion.section className="dashboard-grid dashboard-grid--secondary" variants={stagger}>
            <motion.article className="surface-card spending-card" variants={child}><CardHeader eyebrow="GASTOS POR CATEGORIA" title="Onde seu dinheiro foi" subtitle="Distribuição das despesas no período" action={<button className="text-button" onClick={() => action("Relatório de categorias aberto")}>Ver relatório <ChevronRight size={14} /></button>} /><div className="spending-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={spendingData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={87} paddingAngle={3} stroke="none">{spendingData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatBRL(Number(value))} contentStyle={{ border: 0, borderRadius: 12, boxShadow: "0 10px 30px rgba(22, 32, 54, .12)", fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>R$ 31,8K</strong><span>gastos</span></div></div><div className="spending-list">{spendingData.map((item, index) => <div className="spending-row" key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{formatCompactBRL(item.value)}</strong><small>{[31, 20, 14, 10, 25][index]}%</small></div>)}</div></div></motion.article>

            <motion.article className="surface-card accounts-card" variants={child}><CardHeader eyebrow="CONTAS" title="Suas contas" subtitle="Patrimônio por carteira" action={<button className="text-button" onClick={() => action("Gerenciador de contas aberto")}>Gerenciar <ChevronRight size={14} /></button>} /><div className="account-list">{accounts.map((account) => <button className="account-row" key={account.name} onClick={() => action(`${account.name} selecionada`)}><span className={`account-icon account-icon--${account.tone}`}>{navIcon(account.icon)}</span><span className="account-info"><strong>{account.name}</strong><small>{account.number}</small></span><span className="account-value"><strong>{account.value}</strong><small className={account.tone === "peach" ? "account-alert" : ""}>{account.change}</small></span><ChevronRight className="account-chevron" size={15} /></button>)}</div></motion.article>
          </motion.section>

          <motion.section className="dashboard-grid dashboard-grid--secondary" variants={stagger}>
            <motion.article className="surface-card budget-card" variants={child}><CardHeader eyebrow="ORÇAMENTO" title="Uso dos envelopes" subtitle="Agosto · limite mensal" action={<button className="text-button" onClick={() => action("Orçamento aberto")}>Ajustar <ChevronRight size={14} /></button>} /><div className="budget-list">{budgets.map((item) => <div className="budget-row" key={item.label}><div className="budget-row-head"><span>{item.label}</span><strong>{item.value} <small>/ {item.limit}</small></strong></div><div className="progress-track"><motion.div className={`progress-fill progress-fill--${item.tone}`} initial={{ width: 0 }} whileInView={{ width: `${Math.min(item.progress, 100)}%` }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.15 }} /></div></div>)}</div><div className="budget-alert"><Zap size={15} /><span><strong>Alimentação</strong> está 3% acima do seu limite.</span><button onClick={() => action("Sugestão de orçamento aberta")} aria-label="Ver sugestão"><ChevronRight size={15} /></button></div></motion.article>

            <motion.article className="surface-card bills-card" variants={child}><CardHeader eyebrow="PRÓXIMOS COMPROMISSOS" title="Contas a pagar" subtitle="O que merece atenção" action={<button className="text-button" onClick={() => action("Agenda de compromissos aberta")}>Agendar <ChevronRight size={14} /></button>} /><div className="bills-list">{upcomingBills.map((bill) => <button className="bill-row" key={bill.label} onClick={() => action(`${bill.label} selecionado`)}><span className={`bill-date bill-date--${bill.tone}`}><CalendarDays size={15} /><small>{bill.date}</small></span><span className="bill-info"><strong>{bill.label}</strong><small>{bill.days}</small></span><span className="bill-amount">{bill.amount}</span><ChevronRight size={15} /></button>)}</div></motion.article>
          </motion.section>

          <motion.section className="surface-card transactions-card" variants={child}><CardHeader eyebrow="ATIVIDADE RECENTE" title="Últimos lançamentos" subtitle="Movimentações recentes em suas contas" action={<div className="transactions-actions"><button className="soft-button soft-button--small" onClick={() => action("Filtros de lançamentos abertos")}><Filter size={14} /> Filtrar</button><button className="text-button" onClick={() => action("Extrato completo aberto")}>Ver tudo <ChevronRight size={14} /></button></div>} /><div className="transactions-table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th className="amount-cell">Valor</th><th /></tr></thead><tbody>{localTransactions.map((transaction) => <tr key={`${transaction.date}-${transaction.payee}`}><td className="muted-cell">{transaction.date}</td><td><span className={`transaction-icon transaction-icon--${transaction.type}`}>{transaction.type === "income" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><strong>{transaction.payee}</strong></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-cell">{transaction.account}</td><td className={`amount-cell ${transaction.type === "income" ? "income-text" : "expense-text"}`}>{transaction.type === "income" ? "+" : "−"}{formatBRL(transaction.amount).replace("R$ ", "R$ ")}</td><td><button className="row-more" onClick={() => action(`Opções para ${transaction.payee}`)} aria-label={`Mais opções para ${transaction.payee}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div></motion.section>

          <footer className="dashboard-footer"><span>© 2026 MuFinance · Versão React</span><div><button onClick={() => action("Sobre o MuFinance aberto")}>Sobre</button><button onClick={() => action("Suporte aberto")}>Suporte</button><button onClick={() => action("Privacidade aberta")}>Privacidade</button></div><span className="footer-secure"><Check size={13} /> Seus dados estão protegidos</span></footer>
        </motion.div>
      </main>
      <MobileNav activeNav={activeNav} onSelect={setActiveNav} onMore={() => setMobileOpen(true)} />
      <TransactionModal open={transactionModalOpen} onClose={() => setTransactionModalOpen(false)} onSubmit={addTransaction} />
    </div>
  );
}

function Sidebar({ collapsed, mobileOpen, activeNav, filteredNav, query, setQuery, onSelect, onCollapse }: { collapsed: boolean; mobileOpen: boolean; activeNav: string; filteredNav: typeof navItems; query: string; setQuery: (value: string) => void; onSelect: (label: string) => void; onCollapse: () => void }) {
  return <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}><div className="brand"><div className="brand-mark"><img src="/manus-storage/mufinance-logo_40c68aae.png" alt="" /></div>{!collapsed && <span className="brand-wordmark"><b>Mu</b>Finance</span>}<span className="brand-version">R2</span></div><div className="sidebar-search"><Search size={15} />{!collapsed && <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar menu…" aria-label="Filtrar menu" />}</div>{!collapsed && <p className="sidebar-label">MENU PRINCIPAL</p>}<nav className="sidebar-nav" aria-label="Navegação principal">{filteredNav.map((item) => <button key={item.label} className={`nav-item ${activeNav === item.label ? "is-active" : ""}`} onClick={() => onSelect(item.label)} title={collapsed ? item.label : undefined}><span className="nav-icon">{navIcon(item.icon)}</span>{!collapsed && <><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</>}</button>)}</nav>{!collapsed && <><div className="sidebar-divider" /><p className="sidebar-label">ATALHOS</p><button className="nav-item" onClick={() => onSelect("Insights")}><span className="nav-icon"><Sparkles size={17} /></span><span>Insights</span><span className="new-badge">Novo</span></button><button className="nav-item" onClick={() => onSelect("Exportar dados")}><span className="nav-icon"><Download size={17} /></span><span>Exportar dados</span></button></>}<div className="sidebar-bottom"><button className="nav-item collapse-button" onClick={onCollapse} title={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />} {!collapsed && <span>Recolher menu</span>}</button>{!collapsed && <div className="sidebar-user"><div className="avatar">B</div><div><strong>Ben Oliveira</strong><small>ben@exemplo.com</small></div><MoreHorizontal size={16} /></div>}</div></aside>;
}

function TopBar({ onMenu, onAction }: { onMenu: () => void; onAction: (message: string) => void }) {
  const { theme, toggleTheme } = useTheme();
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenu} aria-label="Abrir menu"><Menu size={20} /></button><div className="topbar-search"><Search size={16} /><input placeholder="Pesquisar ou ir para…" aria-label="Pesquisar ou ir para" /><kbd>⌘K</kbd></div><div className="topbar-actions"><button className="topbar-icon-button language-button" onClick={() => onAction("Idioma: Português (BR)")}><Globe2 size={16} /><span>PT</span></button><button className="topbar-icon-button" onClick={() => onAction("Modo compacto alternado")}><Eye size={17} /></button><button className="topbar-icon-button theme-toggle-button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button><button className="topbar-icon-button notification-button" onClick={() => onAction("Você não tem novas notificações")}><Bell size={17} /><span>2</span></button><div className="topbar-avatar" onClick={() => onAction("Perfil aberto")}>B</div></div></header>;
}

function MobileNav({ activeNav, onSelect, onMore }: { activeNav: string; onSelect: (label: string) => void; onMore: () => void }) {
  const items = navItems.slice(0, 4);
  return <nav className="mobile-nav" aria-label="Navegação mobile">{items.map((item) => <button key={item.label} className={activeNav === item.label ? "is-active" : ""} onClick={() => onSelect(item.label)}>{navIcon(item.icon)}<span>{item.label}</span></button>)}<button onClick={onMore}><Menu size={18} /><span>Mais</span></button></nav>;
}

function CardHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="card-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="card-subtitle">{subtitle}</p></div>{action}</div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="banner-metric"><span>{label}</span><strong>{value}</strong></div>; }
