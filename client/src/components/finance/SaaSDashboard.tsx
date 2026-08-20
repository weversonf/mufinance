"use client";

import { createTransaction } from "../../../../actions/finance";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { CreditCard as FinanceCreditCard, FinanceCategory } from "@/lib/financeData";
import { TransactionModal, type NewTransactionPayload } from "./TransactionModal";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bitcoin,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileUp,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  Landmark,
  LineChart,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SnapshotRecord = Record<string, unknown> & { id?: string };
type FinanceSnapshot = {
  accounts: SnapshotRecord[];
  creditCards: SnapshotRecord[];
  transactions: SnapshotRecord[];
  categories: SnapshotRecord[];
  goals: SnapshotRecord[];
  budgets: SnapshotRecord[];
};
type FlowPoint = { label: string; income: number; expense: number };
type Period = "7d" | "30d" | "90d";
type Tone = "mint" | "blue" | "lavender" | "coral";
type NavItem = { label: string; href?: string; icon: LucideIcon; action?: "transaction" | "transfer" };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Dia a dia",
    items: [
      { label: "Visão geral", href: "/", icon: LayoutDashboard },
      { label: "Contas", href: "/planning", icon: Wallet },
      { label: "Lançamentos", icon: ArrowLeftRight, action: "transaction" },
      { label: "Cartões", href: "/planning#cartoes", icon: CreditCard },
    ],
  },
  {
    label: "Dinheiro",
    items: [
      { label: "Transferências", icon: Send, action: "transfer" },
      { label: "Importar dados", href: "/import", icon: Upload },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Relatórios", href: "/reports", icon: BarChart3 },
      { label: "Planejamento", href: "/planning", icon: Target },
    ],
  },
];

const chartTooltipStyle = {
  border: "1px solid var(--rf-border)",
  borderRadius: 10,
  background: "var(--rf-tooltip)",
  color: "var(--rf-text)",
  fontSize: 11,
  boxShadow: "0 16px 36px rgba(0,0,0,.18)",
};

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function recordText(record: SnapshotRecord, key: string, fallback = "") {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function recordDate(record: SnapshotRecord) {
  const raw = record.dateISO ?? record.date ?? record.createdAt;
  if (typeof raw === "string") return raw.slice(0, 10);
  if (raw && typeof raw === "object" && "_seconds" in raw) return new Date(Number((raw as { _seconds: number })._seconds) * 1000).toISOString().slice(0, 10);
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  return "";
}

function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat("pt-BR", compact ? { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 } : { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
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
  return Boolean(value) && value.startsWith(monthKey(reference));
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "M";
}

function categoryTone(index: number): Tone {
  return (["mint", "blue", "lavender", "coral"] as Tone[])[index % 4];
}

function displayAccountName(account: SnapshotRecord) {
  return recordText(account, "name", recordText(account, "institution", "Conta financeira"));
}

function accountIsLocked(account: SnapshotRecord) {
  return account.locked === true || account.isLocked === true || account.blindagem === true;
}

function normalizedCategories(categories: SnapshotRecord[]): FinanceCategory[] {
  return categories.map((category, index) => ({
    id: category.id || `category-${index}`,
    name: recordText(category, "name", "Sem categoria"),
    type: recordText(category, "type", "expense").toLowerCase() === "income" ? "income" : "expense",
    tone: (recordText(category, "tone", categoryTone(index)) as FinanceCategory["tone"]),
    active: category.active !== false,
    usage: numberValue(category.usage),
  }));
}

function normalizedCards(cards: SnapshotRecord[]): FinanceCreditCard[] {
  return cards.map((card, index) => ({
    id: card.id || `card-${index}`,
    name: recordText(card, "name", "Cartão"),
    last4: recordText(card, "last4", ""),
    brand: (recordText(card, "brand", "Visa") as FinanceCreditCard["brand"]),
    color: (recordText(card, "color", "ocean") as FinanceCreditCard["color"]),
    balance: String(numberValue(card.balance ?? card.amount ?? card.value)),
    dueDate: recordText(card, "dueDate", ""),
    limit: numberValue(card.limit ?? card.creditLimit),
    closingDay: numberValue(card.closingDay),
    dueDay: numberValue(card.dueDay),
  }));
}

function Metric({ label, value, caption, icon: Icon, tone, trend }: { label: string; value: string; caption: string; icon: LucideIcon; tone: Tone; trend?: string }) {
  return (
    <article className="rf-metric-card">
      <div className="rf-metric-head">
        <span className={`rf-metric-icon rf-tone-${tone}`}><Icon size={16} /></span>
        {trend && <span className="rf-metric-trend">{trend}</span>}
      </div>
      <span className="rf-metric-label">{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}

function EmptyState({ icon: Icon, title, copy, href, action }: { icon: LucideIcon; title: string; copy: string; href?: string; action?: string }) {
  return (
    <div className="rf-empty-state">
      <span className="rf-empty-icon"><Icon size={18} /></span>
      <strong>{title}</strong>
      <p>{copy}</p>
      {href && action && <a href={href} className="rf-text-link">{action}<ChevronRight size={14} /></a>}
    </div>
  );
}

function CardHeader({ kicker, title, action, icon: Icon }: { kicker?: string; title: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="rf-card-header">
      <div>
        {kicker && <span className="rf-card-kicker">{kicker}</span>}
        <h2>{title}</h2>
      </div>
      {Icon && <Icon size={18} className="rf-card-header-icon" />}
      {action}
    </div>
  );
}

function FinancialOverview({ data, hasData }: { data: FlowPoint[]; hasData: boolean }) {
  const totals = data.reduce((result, item) => ({ income: result.income + item.income, expense: result.expense + item.expense }), { income: 0, expense: 0 });
  return (
    <article className="rf-card rf-overview-card">
      <CardHeader
        title="Visão financeira"
        action={<button type="button" className="rf-period-button"><CalendarDays size={14} />{new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date())}<ChevronDown size={13} /></button>}
      />
      <div className="rf-legend-row">
        <span><i className="rf-dot rf-dot-primary" />Entradas <b>{formatCurrency(totals.income, true)}</b></span>
        <span><i className="rf-dot rf-dot-muted" />Saídas <b>{formatCurrency(totals.expense, true)}</b></span>
      </div>
      <div className="rf-chart-area rf-overview-chart">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rfIncomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--rf-primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--rf-primary)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--rf-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--rf-muted)", fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--rf-muted)", fontSize: 10 }} tickFormatter={(value) => formatCurrency(Number(value), true)} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => [formatCurrency(Number(value)), name === "income" ? "Entradas" : "Saídas"]} />
              <Area type="linear" dataKey="expense" stroke="var(--rf-expense)" strokeOpacity={0.7} strokeWidth={1.5} fill="transparent" dot={{ r: 3, fill: "var(--rf-expense)" }} />
              <Area type="linear" dataKey="income" stroke="var(--rf-primary)" strokeWidth={2} fill="url(#rfIncomeFill)" dot={{ r: 3, fill: "var(--rf-primary)" }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={LineChart} title="Seu fluxo começa aqui" copy="Registre ou importe um lançamento para acompanhar entradas e saídas." href="/import" action="Importar extrato" />
        )}
      </div>
      <div className="rf-chart-summary">
        <div><span>Saldo do período</span><strong className={totals.income - totals.expense >= 0 ? "rf-positive" : "rf-negative"}>{formatCurrency(totals.income - totals.expense)}</strong></div>
        <span className="rf-summary-change"><TrendingUp size={14} /> Dados reais do seu espaço</span>
      </div>
    </article>
  );
}

function PatrimonyCard({ accounts, creditCards, balance, showSensitive }: { accounts: SnapshotRecord[]; creditCards: SnapshotRecord[]; balance: number; showSensitive: boolean }) {
  const primary = accounts.find((account) => !accountIsLocked(account));
  return (
    <article className="rf-card rf-patrimony-card">
      <CardHeader title="Patrimônio" icon={Wallet} action={<button type="button" className="rf-icon-action" aria-label="Adicionar conta" title="Adicionar conta" onClick={() => { window.location.href = "/planning"; }}><Plus size={16} /></button>} />
      {primary ? (
        <>
          <div className="rf-account-art">
            <div className="rf-account-art-top"><span>{displayAccountName(primary)}</span><Landmark size={18} /></div>
            <span className="rf-account-art-label">Saldo disponível</span>
            <strong>{showSensitive ? formatCurrency(numberValue(primary.balance ?? primary.amount ?? primary.value)) : "R$ •••••"}</strong>
            <div className="rf-account-art-bottom"><span>{accountIsLocked(primary) ? "Blindada" : "Conta ativa"}</span><span>{recordText(primary, "type", "Conta bancária")}</span></div>
          </div>
          <div className="rf-balance-actions"><a href="/planning" className="rf-outline-button">Gerenciar contas</a><button type="button" className="rf-primary-button" onClick={() => { window.location.href = "/planning"; }}>Adicionar</button></div>
          <div className="rf-balance-summary"><div><span>Saldo total</span><strong>{showSensitive ? formatCurrency(balance) : "R$ •••••"}</strong></div><div><span>Contas</span><strong>{accounts.length}</strong></div><div><span>Cartões</span><strong>{creditCards.length}</strong></div></div>
        </>
      ) : (
        <EmptyState icon={Wallet} title="Nenhuma conta cadastrada" copy="Adicione sua primeira conta bancária para começar a acompanhar seu patrimônio." href="/planning" action="Adicionar conta" />
      )}
    </article>
  );
}

function QuickActions({ onOpenTransaction, hasAccounts }: { onOpenTransaction: (type: "income" | "expense") => void; hasAccounts: boolean }) {
  const items = [
    { label: "Receita", icon: ArrowDownLeft, tone: "rf-quick-income", type: "income" as const },
    { label: "Despesa", icon: ArrowUpRight, tone: "rf-quick-expense", type: "expense" as const },
    { label: "Cartão", icon: CreditCard, tone: "rf-quick-card", type: "expense" as const },
  ];
  return (
    <article className="rf-card rf-quick-card">
      <CardHeader title="Ação rápida" action={<a href="/reports" className="rf-card-link">Ver lançamentos <ChevronRight size={13} /></a>} />
      <p className="rf-quick-copy">Registre uma movimentação no seu espaço.</p>
      <div className="rf-quick-actions">
        {items.map(({ label, icon: Icon, tone, type }) => (
          <button key={label} type="button" className={`rf-quick-action ${tone}`} onClick={() => onOpenTransaction(type)} disabled={!hasAccounts}>
            <span><Icon size={17} /></span><strong>{label}</strong>
          </button>
        ))}
      </div>
      {!hasAccounts && <p className="rf-card-hint"><ShieldCheck size={13} /> Cadastre uma conta antes de registrar lançamentos.</p>}
    </article>
  );
}

function SpendingLimit({ budgets, transactions, hasData }: { budgets: SnapshotRecord[]; transactions: SnapshotRecord[]; hasData: boolean }) {
  const reference = new Date();
  const currentBudget = budgets.find((budget) => recordText(budget, "month") === monthKey(reference)) || budgets[0];
  const limit = numberValue(currentBudget?.limitAmount ?? currentBudget?.limit ?? currentBudget?.amount ?? currentBudget?.value);
  const spent = transactions.filter((item) => isSameMonth(recordDate(item), reference) && recordText(item, "type").toLowerCase() === "expense").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0);
  const ratio = limit > 0 ? Math.min(spent / limit, 1) : 0;
  return (
    <article className="rf-card rf-spending-card">
      <CardHeader title="Limite mensal" icon={Gauge} />
      {limit > 0 ? (
        <>
          <div className="rf-spending-number"><span>Orçamento</span><strong>{formatCurrency(limit, true)}</strong></div>
          <div className="rf-progress"><span style={{ width: `${ratio * 100}%` }} /></div>
          <div className="rf-spending-meta"><span>Gasto <b>{formatCurrency(spent, true)}</b></span><span>Restante <b className="rf-positive">{formatCurrency(Math.max(limit - spent, 0), true)}</b></span></div>
          <small className="rf-card-period">{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(reference.getFullYear(), reference.getMonth(), 1))} – {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(reference.getFullYear(), reference.getMonth() + 1, 0))}</small>
        </>
      ) : (
        <EmptyState icon={Target} title="Defina um orçamento" copy={hasData ? "Organize seus limites por categoria no planejamento." : "Seu orçamento mensal aparecerá aqui depois da configuração."} href="/planning" action="Abrir planejamento" />
      )}
    </article>
  );
}

function MoneyMovement({ transactions }: { transactions: SnapshotRecord[] }) {
  const [period, setPeriod] = useState<Period>("7d");
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const movement = transactions.filter((item) => {
    const date = new Date(`${recordDate(item)}T12:00:00`);
    return !Number.isNaN(date.getTime()) && date >= cutoff;
  });
  const income = movement.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0);
  const expense = movement.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0);
  const bars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index) * Math.max(1, Math.round(days / 7)));
    const key = date.toISOString().slice(0, 10);
    const dayItems = movement.filter((item) => recordDate(item) === key);
    return { label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", ""), income: dayItems.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0), expense: dayItems.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0) };
  });
  const hasData = movement.length > 0;
  return (
    <article className="rf-card rf-movement-card">
      <CardHeader title="Movimentação" action={<div className="rf-segmented">{(["7d", "30d", "90d"] as Period[]).map((item) => <button key={item} type="button" className={period === item ? "is-active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>} />
      <div className="rf-movement-stats"><div><span className="rf-stat-label"><i className="rf-dot rf-dot-primary" />Entradas</span><strong>{formatCurrency(income, true)}</strong></div><div><span className="rf-stat-label"><i className="rf-dot rf-dot-expense" />Saídas</span><strong>{formatCurrency(expense, true)}</strong></div><div className="rf-stat-net"><span>Fluxo líquido</span><strong className={income - expense >= 0 ? "rf-positive" : "rf-negative"}>{income - expense >= 0 ? "+" : "−"}{formatCurrency(Math.abs(income - expense), true)}</strong></div></div>
      <div className="rf-chart-area rf-movement-chart">{hasData ? <ResponsiveContainer width="100%" height="100%"><BarChart data={bars} barGap={4} margin={{ top: 12, right: 0, left: -24, bottom: 0 }}><CartesianGrid stroke="var(--rf-grid)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--rf-muted)", fontSize: 9 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--rf-muted)", fontSize: 9 }} tickFormatter={(value) => formatCurrency(Number(value), true)} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => [formatCurrency(Number(value)), name === "income" ? "Entradas" : "Saídas"]} /><Bar dataKey="income" fill="var(--rf-primary)" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" fill="var(--rf-expense)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState icon={Activity} title="Sem movimentações no período" copy="Quando houver dados, o fluxo líquido será detalhado aqui." />}</div>
    </article>
  );
}

function SpendingByCategory({ transactions }: { transactions: SnapshotRecord[] }) {
  const reference = new Date();
  const grouped = transactions.filter((item) => isSameMonth(recordDate(item), reference) && recordText(item, "type").toLowerCase() === "expense").reduce<Record<string, number>>((result, item) => { const category = recordText(item, "category", "Outros"); result[category] = (result[category] || 0) + Math.abs(numberValue(item.amount)); return result; }, {});
  const data = Object.entries(grouped).sort(([, left], [, right]) => right - left).slice(0, 5).map(([name, value], index) => ({ name, value, color: ["#58cbb2", "#8a9ff1", "#bd9ae9", "#e89391", "#d2b263"][index] }));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <article className="rf-card rf-category-card">
      <CardHeader title="Gastos por categoria" icon={FolderKanban} action={<a href="/reports" className="rf-card-link">Detalhes <ChevronRight size={13} /></a>} />
      {data.length ? <div className="rf-category-content"><div className="rf-donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={3} stroke="none">{data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer><div className="rf-donut-center"><strong>{formatCurrency(total, true)}</strong><span>este mês</span></div></div><div className="rf-category-list">{data.map((item) => <div className="rf-category-row" key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{formatCurrency(item.value, true)}</strong><small>{total ? Math.round(item.value / total * 100) : 0}%</small></div>)}</div></div> : <EmptyState icon={FolderKanban} title="Sem gastos categorizados" copy="As categorias aparecerão quando você registrar despesas." href="/categories" action="Gerenciar categorias" />}
    </article>
  );
}

function FinancialHealth({ transactions, accounts, goals }: { transactions: SnapshotRecord[]; accounts: SnapshotRecord[]; goals: SnapshotRecord[] }) {
  const reference = new Date();
  const current = transactions.filter((item) => isSameMonth(recordDate(item), reference));
  const income = current.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0);
  const expense = current.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0);
  const balance = accounts.filter((account) => !accountIsLocked(account)).reduce((sum, account) => sum + numberValue(account.balance ?? account.amount ?? account.value), 0);
  const hasData = current.length > 0 || accounts.length > 0 || goals.length > 0;
  const savings = income > 0 ? Math.max(0, Math.min(100, Math.round((income - expense) / income * 100))) : 0;
  const factors = [{ label: "Taxa de economia", value: savings }, { label: "Hábitos de gasto", value: income ? Math.max(0, 100 - Math.min(100, Math.round(expense / income * 100))) : 0 }, { label: "Reserva disponível", value: balance > 0 ? Math.min(100, Math.round(balance / Math.max(income || 1, 1) * 100)) : 0 }, { label: "Metas financeiras", value: goals.length ? Math.min(100, goals.filter((goal) => recordText(goal, "status", "active") !== "completed").length * 25) : 0 }];
  const score = hasData ? Math.round(factors.reduce((sum, factor) => sum + factor.value, 0) / factors.length) : 0;
  return (
    <article className="rf-card rf-health-card">
      <CardHeader title="Saúde financeira" icon={Gauge} action={hasData ? <span className="rf-health-badge"><TrendingUp size={12} />{score} pts</span> : undefined} />
      {hasData ? <div className="rf-health-content"><div className="rf-health-gauge"><div className="rf-gauge-track" /><div className="rf-gauge-fill" style={{ transform: `rotate(${Math.min(score, 100) * 1.8 - 90}deg)` }} /><div className="rf-gauge-value"><strong>{score}</strong><span>de 100</span></div></div><div className="rf-health-factors">{factors.map((factor, index) => <div className="rf-health-factor" key={factor.label}><div><span>{factor.label}</span><strong>{factor.value}</strong></div><div className="rf-mini-progress"><span className={`rf-mini-${index}`} style={{ width: `${factor.value}%` }} /></div></div>)}</div></div> : <EmptyState icon={Gauge} title="Sua saúde financeira" copy="Cadastre contas e lançamentos para acompanhar seus indicadores reais." href="/planning" action="Configurar espaço" />}
    </article>
  );
}

function RecentTransactions({ transactions, showSensitive }: { transactions: SnapshotRecord[]; showSensitive: boolean }) {
  const recent = [...transactions].sort((left, right) => recordDate(right).localeCompare(recordDate(left))).slice(0, 7);
  return (
    <article className="rf-card rf-transactions-card">
      <CardHeader title="Lançamentos recentes" action={<a href="/reports" className="rf-card-link">Ver todos <ChevronRight size={13} /></a>} />
      {recent.length ? <div className="rf-table-wrap"><table className="rf-transactions-table"><thead><tr><th>LANÇAMENTO</th><th>CATEGORIA</th><th>TIPO</th><th>VALOR</th><th>DATA</th><th /></tr></thead><tbody>{recent.map((transaction) => { const type = recordText(transaction, "type").toLowerCase(); const income = type === "income"; return <tr key={transaction.id || `${recordDate(transaction)}-${recordText(transaction, "payee")}`}><td><span className={`rf-transaction-icon ${income ? "is-income" : "is-expense"}`}>{income ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}</span><strong>{recordText(transaction, "payee", "Lançamento")}</strong></td><td><span className="rf-category-chip">{recordText(transaction, "category", "Sem categoria")}</span></td><td className="rf-muted-cell">{income ? "Receita" : "Despesa"}</td><td className={`rf-amount-cell ${income ? "rf-positive" : "rf-negative"}`}>{income ? "+" : "−"}{showSensitive ? formatCurrency(Math.abs(numberValue(transaction.amount))) : "R$ •••"}</td><td className="rf-muted-cell">{formatDate(recordDate(transaction))}</td><td><button type="button" className="rf-row-more" aria-label="Mais opções"><MoreHorizontal size={15} /></button></td></tr>; })}</tbody></table></div> : <EmptyState icon={ArrowLeftRight} title="Nenhum lançamento ainda" copy="Seu histórico aparecerá aqui depois do primeiro registro ou importação." href="/import" action="Importar extrato" />}
    </article>
  );
}

export default function SaaSDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSensitive, setShowSensitive] = useState(true);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense" | "transfer">("expense");

  const loadSnapshot = () => {
    setLoading(true);
    setRequestError("");
    fetch("/api/finance/snapshot", { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json() as FinanceSnapshot & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar seus dados.");
        return payload;
      })
      .then(setSnapshot)
      .catch((error: unknown) => setRequestError(error instanceof Error ? error.message : "Não foi possível carregar seus dados agora."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSnapshot();
  }, [user?.uid]);

  const profileName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Usuário";
  const firstName = profileName.split(/\s+/)[0];
  const metrics = useMemo(() => {
    const accounts = snapshot?.accounts ?? [];
    const creditCards = snapshot?.creditCards ?? [];
    const transactions = snapshot?.transactions ?? [];
    const reference = new Date();
    const monthTransactions = transactions.filter((item) => isSameMonth(recordDate(item), reference));
    const balance = accounts.reduce((total, account) => accountIsLocked(account) ? total : total + numberValue(account.balance ?? account.amount ?? account.value), 0);
    const income = monthTransactions.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((total, item) => total + Math.abs(numberValue(item.amount)), 0);
    const expense = monthTransactions.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((total, item) => total + Math.abs(numberValue(item.amount)), 0);
    const flow: FlowPoint[] = Array.from({ length: 12 }, (_, index) => { const date = new Date(reference.getFullYear(), index, 1); const key = monthKey(date); const items = transactions.filter((item) => recordDate(item).startsWith(key)); return { label: monthLabel(date), income: items.filter((item) => recordText(item, "type").toLowerCase() === "income").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0), expense: items.filter((item) => recordText(item, "type").toLowerCase() === "expense").reduce((sum, item) => sum + Math.abs(numberValue(item.amount)), 0) }; });
    const goals = snapshot?.goals ?? [];
    return { accounts, creditCards, transactions, categories: snapshot?.categories ?? [], goals, budgets: snapshot?.budgets ?? [], balance, income, expense, flow, hasFlowData: flow.some((item) => item.income > 0 || item.expense > 0), activeGoals: goals.filter((goal) => recordText(goal, "status", "active") !== "completed").length };
  }, [snapshot]);

  const openTransaction = (type: "income" | "expense" | "transfer") => {
    if (!metrics.accounts.length) {
      toast.info("Cadastre uma conta antes de registrar um lançamento.");
      window.location.href = "/planning";
      return;
    }
    setTransactionType(type);
    setTransactionOpen(true);
  };

  const handleTransactionSubmit = async (payload: NewTransactionPayload) => {
    const account = metrics.accounts.find((item) => displayAccountName(item) === payload.account || item.id === payload.account);
    const destination = metrics.accounts.find((item) => displayAccountName(item) === payload.destinationAccount || item.id === payload.destinationAccount);
    await createTransaction({
      date: payload.dateISO,
      payee: payload.payee,
      category: payload.category,
      accountId: account?.id || payload.account,
      destinationAccountId: destination?.id || payload.destinationAccount,
      amount: Math.abs(payload.amount),
      type: payload.type,
      status: payload.status,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId,
      invoiceId: payload.invoiceId,
    });
    setTransactionOpen(false);
    toast.success("Lançamento salvo no seu espaço.");
    loadSnapshot();
  };

  if (loading) return <div className="rf-dashboard-loading"><div className="rf-loading-spinner" /><p>Preparando seu espaço financeiro…</p></div>;

  return (
    <div className={`reference-dashboard ${theme === "dark" ? "is-dark" : "is-light"} ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <div className={`rf-mobile-scrim ${mobileMenuOpen ? "is-visible" : ""}`} onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      <aside className={`rf-sidebar ${mobileMenuOpen ? "is-mobile-open" : ""}`}>
        <div className="rf-sidebar-brand"><a href="/" className="rf-brand"><span className="rf-brand-icon"><Landmark size={17} /></span><span><strong>MuFinance</strong><small>FINANÇAS PESSOAIS</small></span></a><button type="button" className="rf-mobile-close" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu"><X size={18} /></button></div>
        <div className="rf-sidebar-caption">MuFinance</div>
        <nav className="rf-sidebar-nav" aria-label="Navegação principal">
          {navGroups.map((group) => <div className="rf-nav-group" key={group.label}><span className="rf-nav-group-label">{group.label}</span>{group.items.map(({ label, href, icon: Icon, action }) => { const active = href ? (href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0])) : false; const common = { className: `rf-nav-item ${active ? "is-active" : ""}`, onClick: () => { setMobileMenuOpen(false); if (action) openTransaction(action === "transfer" ? "transfer" : "expense"); } }; return href ? <a key={label} href={href} {...common}><Icon size={16} /><span>{label}</span>{label === "Relatórios" && <em>Live</em>}</a> : <button key={label} type="button" {...common}><Icon size={16} /><span>{label}</span></button>; })}</div>)}
        </nav>
        <div className="rf-sidebar-spacer" />
        <div className="rf-sidebar-bottom"><button type="button" className="rf-nav-item" onClick={toggleTheme}><span className="rf-nav-theme-icon">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</span><span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span></button><a href="/categories" className={`rf-nav-item ${pathname.startsWith("/categories") ? "is-active" : ""}`}><Settings2 size={16} /><span>Configurações</span></a><button type="button" className="rf-nav-item" onClick={() => void logout()}><LogOut size={16} /><span>Sair da conta</span></button></div>
        <div className="rf-sidebar-user"><span className="rf-user-avatar">{initials(profileName)}</span><div><strong>{profileName}</strong><small>{user?.email || "Conta pessoal"}</small></div><MoreHorizontal size={15} /></div>
      </aside>

      <main className="rf-main">
        <header className="rf-topbar"><button type="button" className="rf-sidebar-toggle rf-desktop-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}><Menu size={17} /></button><button type="button" className="rf-sidebar-toggle rf-mobile-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu"><Menu size={18} /></button><div className="rf-topbar-search"><Search size={14} /><span>Pesquisar no MuFinance</span><kbd>⌘ K</kbd></div><div className="rf-topbar-actions"><button type="button" className="rf-topbar-action rf-import-action" onClick={() => { window.location.href = "/import"; }}><FileUp size={15} /><span>Importar</span></button><button type="button" className="rf-topbar-action" aria-label="Ajuda"><CircleHelp size={16} /></button><button type="button" className="rf-topbar-action rf-notification-action" aria-label="Notificações"><Bell size={16} /><i /></button><button type="button" className="rf-customize-button" onClick={() => toast.info("A personalização da grade estará disponível em breve.")}>Customize</button><button type="button" className="rf-topbar-theme" onClick={toggleTheme} aria-label="Alternar tema">{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button><span className="rf-topbar-avatar">{initials(profileName)}</span></div></header>
        <div className="rf-content">
          <div className="rf-breadcrumb"><span>MuFinance</span><ChevronRight size={13} /><strong>Visão geral</strong></div>
          <section className="rf-heading-row"><div><span className="rf-eyebrow">{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}</span><h1>Olá, {firstName}.</h1><p>Uma visão clara para decisões financeiras mais tranquilas.</p></div><div className="rf-heading-actions"><button type="button" className="rf-outline-button" onClick={() => setShowSensitive((value) => !value)}>{showSensitive ? "Ocultar valores" : "Mostrar valores"}</button><button type="button" className="rf-primary-button" onClick={() => openTransaction("expense")}><Plus size={15} />Novo lançamento</button></div></section>
          {requestError && <div className="rf-inline-alert"><span>{requestError}</span><button type="button" onClick={loadSnapshot}>Tentar novamente</button></div>}
          <section className="rf-metrics-grid"><Metric label="Saldo disponível" value={showSensitive ? formatCurrency(metrics.balance) : "R$ •••••"} caption="Contas sem blindagem" icon={Wallet} tone="mint" trend={metrics.accounts.length ? `${metrics.accounts.length} conta${metrics.accounts.length > 1 ? "s" : ""}` : undefined} /><Metric label="Receitas do mês" value={showSensitive ? formatCurrency(metrics.income) : "R$ •••••"} caption="Entradas confirmadas" icon={ArrowDownLeft} tone="blue" /><Metric label="Despesas do mês" value={showSensitive ? formatCurrency(metrics.expense) : "R$ •••••"} caption="Saídas confirmadas" icon={ArrowUpRight} tone="coral" /><Metric label="Metas em andamento" value={String(metrics.activeGoals)} caption="Objetivos ativos" icon={Target} tone="lavender" /></section>
          <section className="rf-grid-primary"><FinancialOverview data={metrics.flow} hasData={metrics.hasFlowData} /><PatrimonyCard accounts={metrics.accounts} creditCards={metrics.creditCards} balance={metrics.balance} showSensitive={showSensitive} /></section>
          <section className="rf-grid-secondary"><QuickActions onOpenTransaction={openTransaction} hasAccounts={metrics.accounts.length > 0} /><SpendingLimit budgets={metrics.budgets} transactions={metrics.transactions} hasData={metrics.transactions.length > 0} /></section>
          <section className="rf-grid-secondary"><MoneyMovement transactions={metrics.transactions} /><SpendingByCategory transactions={metrics.transactions} /></section>
          <section className="rf-grid-secondary"><FinancialHealth transactions={metrics.transactions} accounts={metrics.accounts} goals={metrics.goals} /><article className="rf-card rf-focus-card"><CardHeader title="Próximos passos" icon={Sparkles} /><p className="rf-focus-copy">Pequenas configurações deixam seus relatórios mais precisos e sua rotina mais leve.</p><div className="rf-focus-list"><a href="/categories"><span className="rf-focus-icon rf-focus-violet"><FolderKanban size={15} /></span><span><strong>Revise categorias</strong><small>Deixe seus lançamentos organizados.</small></span><ChevronRight size={14} /></a><a href="/planning"><span className="rf-focus-icon rf-focus-blue"><Target size={15} /></span><span><strong>Defina uma meta</strong><small>Acompanhe um objetivo concreto.</small></span><ChevronRight size={14} /></a><a href="/import"><span className="rf-focus-icon rf-focus-mint"><Upload size={15} /></span><span><strong>Importe seu extrato</strong><small>CSV e OFX em poucos passos.</small></span><ChevronRight size={14} /></a></div></article></section>
          <RecentTransactions transactions={metrics.transactions} showSensitive={showSensitive} />
          <footer className="rf-footer"><span>MuFinance · seu espaço financeiro pessoal</span><span className="rf-footer-secure"><ShieldCheck size={13} /> Dados protegidos por usuário</span></footer>
        </div>
      </main>
      <TransactionModal open={transactionOpen} onClose={() => setTransactionOpen(false)} onSubmit={handleTransactionSubmit} initialType={transactionType} accountOptions={metrics.accounts.map((account) => displayAccountName(account))} creditCards={normalizedCards(metrics.creditCards)} categories={normalizedCategories(metrics.categories)} />
    </div>
  );
}
