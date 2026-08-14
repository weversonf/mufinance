/* MuFinance — Soft Swiss Fintech editorial: grupos diários claros, fechamento no rodapé de cada dia e leitura operacional sem ruído. */
import { ArrowLeftRight, Briefcase, CalendarDays, Car, ChevronLeft, ChevronRight, CircleHelp, Download, FileText, Home, RefreshCcw, Search, SlidersHorizontal, TrendingUp, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatBRL, getTransactionStatus, transactionStatusLabel, type Transaction, type TransactionStatus } from "@/lib/financeData";

type StatementPageProps = {
  transactions: Transaction[];
  periodLabel: string;
  onBack: () => void;
  onEdit: (transaction: Transaction) => void;
  onExport: () => void;
};

type StatementDayGroup = {
  date: string;
  items: Transaction[];
  income: number;
  expense: number;
  net: number;
  balance: number;
};

const openingBalance = 21500;
const pageSize = 5;

export function StatementPage({ transactions, periodLabel, onBack, onEdit, onExport }: StatementPageProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [accountFilter, setAccountFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(transactions.map((item) => item.category)))], [transactions]);
  const accountOptions = useMemo(() => ["Todas", ...Array.from(new Set(transactions.map((item) => item.account)))], [transactions]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter((item) => {
      const matchesQuery = !normalizedQuery || `${item.payee} ${item.category} ${item.account}`.toLowerCase().includes(normalizedQuery);
      const matchesMode = mode === "all" || item.type === mode;
      const matchesCategory = categoryFilter === "Todas" || item.category === categoryFilter;
      const matchesAccount = accountFilter === "Todas" || item.account === accountFilter;
      const matchesStatus = statusFilter === "all" || getTransactionStatus(item) === statusFilter;
      return matchesQuery && matchesMode && matchesCategory && matchesAccount && matchesStatus;
    });
  }, [accountFilter, categoryFilter, mode, query, statusFilter, transactions]);

  const dailyGroups = useMemo<StatementDayGroup[]>(() => {
    const visibleByDate = new Map<string, Transaction[]>();
    const periodByDate = new Map<string, Transaction[]>();

    filtered.forEach((item) => {
      const key = item.dateISO ?? item.date;
      visibleByDate.set(key, [...(visibleByDate.get(key) ?? []), item]);
    });

    transactions.forEach((item) => {
      const key = item.dateISO ?? item.date;
      periodByDate.set(key, [...(periodByDate.get(key) ?? []), item]);
    });

    let balance = openingBalance;
    const closingByDate = new Map<string, Omit<StatementDayGroup, "items">>();
    Array.from(periodByDate.entries()).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate)).forEach(([date, items]) => {
      const realizedItems = items.filter((item) => getTransactionStatus(item) === "completed");
      const income = realizedItems.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
      const expense = realizedItems.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
      const net = income - expense;
      balance += net;
      closingByDate.set(date, { date, income, expense, net, balance });
    });

    return Array.from(visibleByDate.entries())
      .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
      .map(([date, items]) => ({ ...closingByDate.get(date)!, items }))
      .reverse();
  }, [filtered, transactions]);

  const paginatedGroups = useMemo(() => paginateDailyGroups(dailyGroups, pageSize), [dailyGroups]);
  const pageCount = Math.max(1, paginatedGroups.length);
  const visibleGroups = paginatedGroups[currentPage - 1] ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [accountFilter, categoryFilter, mode, query, statusFilter, transactions]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  const clearFilters = () => {
    setQuery("");
    setMode("all");
    setCategoryFilter("Todas");
    setAccountFilter("Todas");
    setStatusFilter("all");
  };

  return (
    <section className="dedicated-page statement-page">
      <div className="dedicated-page-header">
        <div>
          <button className="back-link" type="button" onClick={onBack}><ChevronLeft size={16} /> Voltar para início</button>
          <p className="eyebrow">EXTRATO DO MÊS</p>
          <h1>Todos os lançamentos.</h1>
          <p className="page-subtitle">Acompanhe cada entrada e saída de {periodLabel.toLowerCase()} em uma única lista.</p>
        </div>
        <div className="dedicated-page-actions"><button className="primary-button" type="button" onClick={onExport}><Download size={15} /> Exportar extrato</button></div>
      </div>

      <div className="statement-toolbar statement-toolbar--filters" aria-label="Filtros do extrato">
        <div className="statement-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar descrição, categoria ou conta" aria-label="Buscar no extrato" /></div>
        <label className="statement-filter"><span>Categoria</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoria">{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label className="statement-filter"><span>Conta ou cartão</span><select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} aria-label="Filtrar por conta ou cartão">{accountOptions.map((account) => <option key={account} value={account}>{account}</option>)}</select></label>
        <label className="statement-filter statement-filter--status"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | TransactionStatus)} aria-label="Filtrar por status"><option value="all">Todos</option><option value="completed">Realizadas</option><option value="planned">Previstas</option></select></label>
        <div className="segmented-control statement-type-filter" aria-label="Filtrar por tipo"><button type="button" className={mode === "all" ? "is-active" : ""} onClick={() => setMode("all")}>Todos</button><button type="button" className={mode === "income" ? "is-active" : ""} onClick={() => setMode("income")}>Entradas</button><button type="button" className={mode === "expense" ? "is-active" : ""} onClick={() => setMode("expense")}>Saídas</button></div>
        <button className="ghost-button statement-filter-clear" type="button" onClick={clearFilters}><SlidersHorizontal size={14} /> Limpar filtros</button>
      </div>

      <div className="statement-results-meta"><span>{filtered.length} {filtered.length === 1 ? "lançamento" : "lançamentos"} encontrados em {periodLabel.toLowerCase()}</span>{filtered.length !== transactions.length && <strong>Filtros ativos</strong>}</div>

      <article className="surface-card statement-transactions-card statement-ledger-card">
        <div className="card-header"><div><p className="eyebrow">EXTRATO DIÁRIO</p><h2>Lançamentos de {periodLabel.toLowerCase()}</h2><p className="card-subtitle">Cada dia termina com seu saldo após as movimentações.</p></div><span className="statement-count">Página {filtered.length === 0 ? 0 : currentPage} de {filtered.length === 0 ? 0 : pageCount}</span></div>

        {filtered.length > 0 ? <div className="statement-ledger" aria-label="Lançamentos agrupados por dia">
            <div className="statement-ledger-columns" aria-hidden="true"><span>Data</span><span>Descrição</span><span>Categoria</span><span>Conta</span><span>Status</span><span className="amount-cell">Valor</span></div>
          {visibleGroups.map((group) => <section className="statement-day-group" key={group.date}>
            <header className="statement-day-header">
              <div className="statement-day-title statement-day-title--centered"><span className="statement-day-marker"><CalendarDays size={14} /></span><div><strong>{formatStatementDay(group.date)}</strong><span>{group.items.length} {group.items.length === 1 ? "lançamento" : "lançamentos"}</span></div></div>
            </header>
            <div className="statement-day-items">{group.items.map((transaction) => <div key={`${transaction.id ?? transaction.date}-${transaction.payee}-${transaction.amount}`} className="statement-ledger-row transaction-row" tabIndex={0} role="button" onClick={() => onEdit(transaction)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onEdit(transaction); } }}>
              <span className="muted-cell">{transaction.date}</span>
              <span className="statement-ledger-description"><span className={`transaction-icon transaction-icon--${transaction.type}`} aria-hidden="true">{getCategoryIcon(transaction.category, transaction.type)}</span><strong>{transaction.payee}</strong></span>
              <span><span className="category-chip">{transaction.category}</span></span>
              <span className="muted-cell statement-ledger-account">{transaction.account}{transaction.type === "transfer" && transaction.destinationAccount ? ` → ${transaction.destinationAccount}` : ""}</span>
              <span className={`statement-status-chip statement-status-chip--${getTransactionStatus(transaction)}`}>{transactionStatusLabel(transaction)}</span>
              <span className={`amount-cell ${transaction.type === "income" ? "income-text" : transaction.type === "transfer" ? "muted-cell" : "expense-text"}`}>{transaction.type === "income" ? "+" : transaction.type === "transfer" ? "↔" : "−"}{formatBRL(transaction.amount).replace("R$ ", "R$ ")}</span>
            </div>)}</div>
            <footer className="statement-day-closing"><span className="statement-day-closing-label">Saldo do dia</span><strong className={group.balance >= 0 ? "income-text" : "expense-text"}>{formatBRL(group.balance).replace("R$ ", "R$ ")}</strong></footer>
          </section>)}
        </div> : <div className="table-empty"><Search size={18} /><strong>Nenhum lançamento encontrado</strong><span>Tente outro termo ou limpe os filtros para continuar.</span></div>}

        {filtered.length > 0 && <nav className="statement-pagination" aria-label="Paginação do extrato"><button className="icon-button" type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label="Página anterior"><ChevronLeft size={16} /></button><div className="statement-pagination-pages">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button key={page} className={page === currentPage ? "is-active" : ""} type="button" onClick={() => setCurrentPage(page)} aria-label={`Ir para página ${page}`} aria-current={page === currentPage ? "page" : undefined}>{page}</button>)}</div><button className="icon-button" type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount} aria-label="Próxima página"><ChevronRight size={16} /></button></nav>}
      </article>
    </section>
  );
}

function paginateDailyGroups(groups: StatementDayGroup[], targetSize: number) {
  const pages: StatementDayGroup[][] = [];
  let currentPage: StatementDayGroup[] = [];
  let currentSize = 0;

  groups.forEach((group) => {
    const shouldStartNewPage = currentPage.length > 0 && currentSize + group.items.length > targetSize;
    if (shouldStartNewPage) {
      pages.push(currentPage);
      currentPage = [];
      currentSize = 0;
    }

    currentPage.push(group);
    currentSize += group.items.length;

    if (currentSize >= targetSize) {
      pages.push(currentPage);
      currentPage = [];
      currentSize = 0;
    }
  });

  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
}

function formatStatementDay(date: string) {
  if (!date.includes("-")) return date;
  const formatted = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date(`${date}T12:00:00`));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getCategoryIcon(category: string, type: Transaction["type"]) {
  const normalizedCategory = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (type === "transfer") return <ArrowLeftRight size={15} />;
  if (normalizedCategory.includes("aliment")) return <Utensils size={15} />;
  if (normalizedCategory.includes("morad") || normalizedCategory.includes("habit")) return <Home size={15} />;
  if (normalizedCategory.includes("transport")) return <Car size={15} />;
  if (normalizedCategory.includes("assin")) return <RefreshCcw size={15} />;
  if (normalizedCategory.includes("trabalh")) return <Briefcase size={15} />;
  if (type === "income" || normalizedCategory.includes("invest") || normalizedCategory.includes("receit")) return <TrendingUp size={15} />;
  return <CircleHelp size={15} />;
}
