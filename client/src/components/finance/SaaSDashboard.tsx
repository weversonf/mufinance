"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileUp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type SnapshotRecord = Record<string, unknown> & { id?: string };
type FinanceSnapshot = {
  accounts: SnapshotRecord[];
  creditCards: SnapshotRecord[];
  transactions: SnapshotRecord[];
  categories: SnapshotRecord[];
  goals: SnapshotRecord[];
  budgets: SnapshotRecord[];
};

type FlowMonth = { label: string; income: number; expense: number };

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/categories", label: "Categorias", icon: FolderKanban },
  { href: "/planning", label: "Planejamento", icon: Target },
  { href: "/import", label: "Importar dados", icon: Upload },
];

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
}

function recordText(record: SnapshotRecord, key: string, fallback = "") {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function recordDate(record: SnapshotRecord) {
  const raw = record.dateISO ?? record.date ?? record.createdAt;
  if (typeof raw === "string") return raw.slice(0, 10);
  if (raw && typeof raw === "object" && "_seconds" in raw) return new Date(Number((raw as { _seconds: number })._seconds) * 1000).toISOString().slice(0, 10);
  return "";
}

function formatDate(value: string) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(" de ", " ");
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
}

function isSameMonth(value: string, reference: Date) {
  if (!value) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && monthKey(date) === monthKey(reference);
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "M";
}

function FlowBars({ months }: { months: FlowMonth[] }) {
  const max = Math.max(...months.flatMap((month) => [month.income, month.expense]), 1);
  const hasData = months.some((month) => month.income > 0 || month.expense > 0);

  return (
    <div className="saas-flow-chart" aria-label="Fluxo de receitas e despesas dos últimos seis meses">
      <div className="saas-flow-gridlines" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="saas-flow-bars">
        {months.map((month) => (
          <div className="saas-flow-column" key={month.label}>
            <div className="saas-flow-pair">
              <span className="saas-flow-bar saas-flow-income" style={{ height: `${Math.max((month.income / max) * 100, month.income ? 8 : 2)}%` }} title={`${month.label}: ${formatCurrency(month.income)}`} />
              <span className="saas-flow-bar saas-flow-expense" style={{ height: `${Math.max((month.expense / max) * 100, month.expense ? 8 : 2)}%` }} title={`${month.label}: ${formatCurrency(month.expense)}`} />
            </div>
            <span className="saas-flow-label">{month.label}</span>
          </div>
        ))}
      </div>
      {!hasData && <div className="saas-chart-empty">Seus lançamentos aparecerão aqui conforme você registrar movimentações.</div>}
    </div>
  );
}

function MetricCard({ label, value, helper, icon: Icon, tone, trend }: { label: string; value: string; helper: string; icon: typeof Wallet; tone: string; trend?: string }) {
  return (
    <article className="saas-metric-card">
      <div className="saas-metric-top"><span className={`saas-metric-icon ${tone}`}><Icon size={18} strokeWidth={2.2} /></span>{trend && <span className="saas-metric-trend">{trend}</span>}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span className="saas-metric-helper">{helper}</span>
    </article>
  );
}

export default function SaaSDashboard() {
  const { user, logout } = useAuth();
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSensitive, setShowSensitive] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setRequestError("");
    fetch("/api/finance/snapshot", { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json() as FinanceSnapshot & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar o snapshot.");
        return payload;
      })
      .then((payload) => { if (active) setSnapshot(payload); })
      .catch((error: unknown) => { if (active) setRequestError(error instanceof Error ? error.message : "Não foi possível carregar seus dados agora."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.uid]);

  const profileName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Usuário";
  const firstName = profileName.split(/\s+/)[0];
  const metrics = useMemo(() => {
    const accounts = snapshot?.accounts ?? [];
    const transactions = snapshot?.transactions ?? [];
    const reference = new Date();
    const monthTransactions = transactions.filter((item) => isSameMonth(recordDate(item), reference));
    const balance = accounts.reduce((total, item) => {
      const locked = item.locked === true || item.isLocked === true || item.blindagem === true;
      return locked ? total : total + numberValue(item.balance ?? item.amount ?? item.value);
    }, 0);
    const income = monthTransactions.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((total, item) => total + Math.abs(numberValue(item.amount)), 0);
    const expense = monthTransactions.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((total, item) => total + Math.abs(numberValue(item.amount)), 0);
    const sixMonths: FlowMonth[] = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(reference.getFullYear(), reference.getMonth() - (5 - index), 1);
      const key = monthKey(date);
      const items = transactions.filter((item) => recordDate(item).startsWith(key));
      return {
        label: monthLabel(date),
        income: items.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((total, item) => total + Math.abs(numberValue(item.amount)), 0),
        expense: items.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((total, item) => total + Math.abs(numberValue(item.amount)), 0),
      };
    });
    const recent = [...transactions].sort((left, right) => recordDate(right).localeCompare(recordDate(left))).slice(0, 5);
    const activeGoals = (snapshot?.goals ?? []).filter((goal) => recordText(goal, "status", "active") !== "completed").length;
    return { accounts, transactions, balance, income, expense, sixMonths, recent, activeGoals };
  }, [snapshot]);

  if (loading) {
    return <div className="saas-dashboard-loading"><div className="saas-loading-orb" /><p>Preparando seu espaço financeiro…</p></div>;
  }

  return (
    <div className="saas-dashboard">
      <div className={`saas-mobile-overlay ${mobileMenuOpen ? "is-visible" : ""}`} onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      <aside className={`saas-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="saas-brand-row"><a href="/" className="saas-brand"><span className="saas-brand-mark">Mu</span><span><strong>MuFinance</strong><small>GESTÃO FINANCEIRA</small></span></a><button className="saas-icon-button saas-sidebar-close" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu"><X size={18} /></button></div>
        <div className="saas-workspace"><span className="saas-workspace-dot" /><div><strong>Meu espaço</strong><small>Conta pessoal</small></div><MoreHorizontal size={17} /></div>
        <nav className="saas-nav" aria-label="Navegação principal">
          <span className="saas-nav-label">Workspace</span>
          {navItems.map(({ href, label, icon: Icon }) => <a href={href} className={`saas-nav-item ${href === "/" ? "is-active" : ""}`} key={href} onClick={() => setMobileMenuOpen(false)}><Icon size={18} /><span>{label}</span>{href === "/reports" && <span className="saas-nav-badge">Live</span>}</a>)}
        </nav>
        <div className="saas-sidebar-spacer" />
        <div className="saas-nav saas-nav-secondary"><span className="saas-nav-label">Preferências</span><a href="/categories" className="saas-nav-item"><Settings2 size={18} /><span>Configurações</span></a><button className="saas-nav-item saas-logout" onClick={() => void logout()}><LogOut size={18} /><span>Sair da conta</span></button></div>
        <div className="saas-sidebar-profile"><span className="saas-avatar">{initials(profileName)}</span><div><strong>{profileName}</strong><small>{user?.email || "Conta pessoal"}</small></div><MoreHorizontal size={16} /></div>
      </aside>

      <main className="saas-main">
        <header className="saas-topbar"><button className="saas-icon-button saas-mobile-menu" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div className="saas-command-search"><span className="saas-search-key">⌘</span><span>Pesquisar no MuFinance</span><kbd>⌘ K</kbd></div><div className="saas-topbar-actions"><a href="/import" className="saas-topbar-link"><FileUp size={17} /><span>Importar</span></a><button className="saas-icon-button" aria-label="Ajuda"><CircleHelp size={18} /></button><button className="saas-icon-button saas-notification-button" aria-label="Notificações"><Bell size={18} /><i /></button><span className="saas-topbar-avatar">{initials(profileName)}</span></div></header>
        <div className="saas-content">
          <div className="saas-breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Visão geral</strong></div>
          <section className="saas-hero-row"><div><span className="saas-eyebrow">{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}</span><h1>Olá, {firstName}.</h1><p>Uma visão clara para decisões financeiras mais tranquilas.</p></div><div className="saas-hero-actions"><button className="saas-secondary-button" onClick={() => setShowSensitive((current) => !current)}>{showSensitive ? "Ocultar valores" : "Mostrar valores"}</button><a href="/reports" className="saas-primary-button"><TrendingUp size={17} />Abrir relatórios</a></div></section>

          {requestError && <div className="saas-inline-alert"><span>{requestError}</span><button onClick={() => window.location.reload()}>Tentar novamente</button></div>}
          <section className="saas-metrics-grid" aria-label="Resumo financeiro"><MetricCard label="Saldo disponível" value={showSensitive ? formatCurrency(metrics.balance) : "R$ •••••"} helper="Contas sem blindagem" icon={Wallet} tone="mint" trend={metrics.accounts.length ? `${metrics.accounts.length} conta${metrics.accounts.length > 1 ? "s" : ""}` : "Comece aqui"} /><MetricCard label="Receitas do mês" value={showSensitive ? formatCurrency(metrics.income) : "R$ •••••"} helper="Entradas confirmadas" icon={ArrowDownLeft} tone="blue" /><MetricCard label="Despesas do mês" value={showSensitive ? formatCurrency(metrics.expense) : "R$ •••••"} helper="Saídas confirmadas" icon={ArrowUpRight} tone="rose" /><MetricCard label="Metas em andamento" value={String(metrics.activeGoals)} helper="Objetivos ativos" icon={Target} tone="violet" /></section>

          <section className="saas-grid-main"><article className="saas-panel saas-flow-panel"><div className="saas-panel-heading"><div><span className="saas-panel-kicker">Visão dos últimos seis meses</span><h2>Fluxo de caixa</h2></div><a href="/reports" className="saas-panel-link">Ver relatório <ChevronRight size={15} /></a></div><div className="saas-chart-legend"><span><i className="saas-legend-income" />Receitas</span><span><i className="saas-legend-expense" />Despesas</span></div><FlowBars months={metrics.sixMonths} /></article><article className="saas-panel saas-focus-panel"><div className="saas-panel-heading"><div><span className="saas-panel-kicker">Próximo passo</span><h2>Organize seu espaço</h2></div><Sparkles size={20} className="saas-panel-sparkle" /></div><p className="saas-focus-copy">Pequenas configurações deixam seus relatórios mais precisos e sua rotina mais leve.</p><div className="saas-focus-list"><a href="/categories"><span className="saas-focus-icon focus-violet"><FolderKanban size={17} /></span><span><strong>Revise categorias</strong><small>Deixe seus lançamentos organizados</small></span><ChevronRight size={16} /></a><a href="/planning"><span className="saas-focus-icon focus-blue"><Target size={17} /></span><span><strong>Defina uma meta</strong><small>Acompanhe um objetivo concreto</small></span><ChevronRight size={16} /></a><a href="/import"><span className="saas-focus-icon focus-mint"><FileUp size={17} /></span><span><strong>Importe seu extrato</strong><small>CSV e OFX em poucos passos</small></span><ChevronRight size={16} /></a></div></article></section>

          <section className="saas-grid-bottom"><article className="saas-panel"><div className="saas-panel-heading"><div><span className="saas-panel-kicker">Atividade recente</span><h2>Últimos lançamentos</h2></div><a href="/reports" className="saas-panel-link">Ver todos <ChevronRight size={15} /></a></div>{metrics.recent.length ? <div className="saas-transaction-list">{metrics.recent.map((transaction) => { const type = recordText(transaction, "type").toLowerCase(); const income = type === "income"; return <div className="saas-transaction-row" key={transaction.id || `${recordDate(transaction)}-${recordText(transaction, "payee")}`}><span className={`saas-transaction-icon ${income ? "is-income" : "is-expense"}`}>{income ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><span className="saas-transaction-info"><strong>{recordText(transaction, "payee", "Lançamento")}</strong><small>{recordText(transaction, "category", "Sem categoria")} · {formatDate(recordDate(transaction))}</small></span><strong className={`saas-transaction-amount ${income ? "is-income" : ""}`}>{income ? "+" : "−"}{showSensitive ? formatCurrency(Math.abs(numberValue(transaction.amount))) : "R$ •••"}</strong></div>; })}</div> : <div className="saas-empty-state"><span className="saas-empty-icon"><ArrowDownLeft size={18} /></span><strong>Seu histórico começa aqui</strong><p>Registre ou importe seu primeiro lançamento para acompanhar o fluxo.</p><a href="/import" className="saas-text-button"><FileUp size={15} />Importar extrato</a></div>}</article><article className="saas-panel"><div className="saas-panel-heading"><div><span className="saas-panel-kicker">Patrimônio conectado</span><h2>Minhas contas</h2></div><Wallet size={19} className="saas-panel-sparkle" /></div>{metrics.accounts.length ? <div className="saas-account-list">{metrics.accounts.slice(0, 4).map((account) => <a href="/planning" className="saas-account-row" key={account.id || recordText(account, "name")}><span className="saas-account-icon"><Wallet size={17} /></span><span><strong>{recordText(account, "name", "Conta")}</strong><small>{recordText(account, "type", "Conta financeira")}</small></span><b>{showSensitive ? formatCurrency(numberValue(account.balance ?? account.amount ?? account.value)) : "R$ •••"}</b></a>)}</div> : <div className="saas-empty-state"><span className="saas-empty-icon"><Wallet size={18} /></span><strong>Nenhuma conta conectada</strong><p>Adicione uma conta manualmente para começar a acompanhar seu saldo.</p><a href="/planning" className="saas-text-button"><Plus size={15} />Adicionar conta</a></div>}</article></section>
        </div>
      </main>
    </div>
  );
}
