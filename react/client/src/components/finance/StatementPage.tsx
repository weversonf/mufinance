// MuFinance — Extrato mensal operacional; prioriza todas as transações, filtros claros, paginação e saldo diário separado.
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Download, FileText, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "@/lib/financeData";
import { formatBRL, formatCompactBRL } from "@/lib/financeData";

type StatementPageProps = {
  transactions: Transaction[];
  periodLabel: string;
  onBack: () => void;
  onEdit: (transaction: Transaction) => void;
  onExport: () => void;
};

const openingBalance = 21500;
const pageSize = 5;

export function StatementPage({ transactions, periodLabel, onBack, onEdit, onExport }: StatementPageProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [accountFilter, setAccountFilter] = useState("Todas");
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
      return matchesQuery && matchesMode && matchesCategory && matchesAccount;
    });
  }, [accountFilter, categoryFilter, mode, query, transactions]);

  const dailyRows = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    transactions.forEach((item) => {
      const key = item.dateISO ?? item.date;
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    });
    let balance = openingBalance;
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => {
        const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
        const expense = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
        balance += income - expense;
        return { date, items, income, expense, net: income - expense, balance };
      })
      .reverse();
  }, [transactions]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleTransactions = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [accountFilter, categoryFilter, mode, query, transactions]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  const clearFilters = () => {
    setQuery("");
    setMode("all");
    setCategoryFilter("Todas");
    setAccountFilter("Todas");
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
        <div className="segmented-control statement-type-filter" aria-label="Filtrar por tipo"><button type="button" className={mode === "all" ? "is-active" : ""} onClick={() => setMode("all")}>Todos</button><button type="button" className={mode === "income" ? "is-active" : ""} onClick={() => setMode("income")}>Entradas</button><button type="button" className={mode === "expense" ? "is-active" : ""} onClick={() => setMode("expense")}>Saídas</button></div>
        <button className="ghost-button statement-filter-clear" type="button" onClick={clearFilters}><SlidersHorizontal size={14} /> Limpar filtros</button>
      </div>

      <div className="statement-results-meta"><span>{filtered.length} {filtered.length === 1 ? "lançamento" : "lançamentos"} encontrados em {periodLabel.toLowerCase()}</span>{filtered.length !== transactions.length && <strong>Filtros ativos</strong>}</div>

      <article className="surface-card daily-balance-card statement-daily-section">
        <div className="card-header"><div><p className="eyebrow">SALDO DIÁRIO</p><h2>Como o caixa evoluiu</h2><p className="card-subtitle">O saldo acumulado após os movimentos de cada dia do período.</p></div><CalendarDays size={18} className="card-header-symbol" /></div>
        <div className="daily-balance-list">{dailyRows.map((row) => <div className="daily-balance-row" key={row.date}><div className="daily-date"><strong>{formatStatementDate(row.date)}</strong><span>{row.items.length} {row.items.length === 1 ? "lançamento" : "lançamentos"}</span></div><div className="daily-flow"><span className="income-text">+{formatCompactBRL(row.income)}</span><span className="expense-text">−{formatCompactBRL(row.expense)}</span></div><div className="daily-net"><span>Saldo do dia</span><strong>{formatCompactBRL(row.balance)}</strong><small className={row.net >= 0 ? "income-text" : "expense-text"}>{row.net >= 0 ? "+" : "−"}{formatCompactBRL(Math.abs(row.net))}</small></div></div>)}{dailyRows.length === 0 && <div className="table-empty"><FileText size={18} /><strong>Nenhum dia encontrado</strong><span>Não há movimentos registrados neste período.</span></div>}</div>
      </article>

      <article className="surface-card statement-transactions-card">
        <div className="card-header"><div><p className="eyebrow">TODAS AS TRANSAÇÕES</p><h2>Lançamentos de {periodLabel.toLowerCase()}</h2><p className="card-subtitle">Clique em uma linha para editar o lançamento.</p></div><span className="statement-count">Página {filtered.length === 0 ? 0 : currentPage} de {filtered.length === 0 ? 0 : pageCount}</span></div>
        <div className="transactions-table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th className="amount-cell">Valor</th><th /></tr></thead><tbody>{visibleTransactions.map((transaction) => <tr key={`${transaction.id ?? transaction.date}-${transaction.payee}-${transaction.amount}`} className="transaction-row" tabIndex={0} role="button" onClick={() => onEdit(transaction)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onEdit(transaction); } }}><td className="muted-cell">{transaction.date}</td><td><span className={`transaction-icon transaction-icon--${transaction.type}`}>{transaction.type === "income" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><strong>{transaction.payee}</strong></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-cell">{transaction.account}</td><td className={`amount-cell ${transaction.type === "income" ? "income-text" : "expense-text"}`}>{transaction.type === "income" ? "+" : "−"}{formatBRL(transaction.amount).replace("R$ ", "R$ ")}</td><td aria-label="Abrir edição" /></tr>)}</tbody></table>{filtered.length === 0 && <div className="table-empty"><Search size={18} /><strong>Nenhum lançamento encontrado</strong><span>Tente outro termo ou limpe os filtros para continuar.</span></div>}</div>
        {filtered.length > 0 && <nav className="statement-pagination" aria-label="Paginação do extrato"><button className="icon-button" type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label="Página anterior"><ChevronLeft size={16} /></button><div className="statement-pagination-pages">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button key={page} className={page === currentPage ? "is-active" : ""} type="button" onClick={() => setCurrentPage(page)} aria-label={`Ir para página ${page}`} aria-current={page === currentPage ? "page" : undefined}>{page}</button>)}</div><button className="icon-button" type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount} aria-label="Próxima página"><ChevronRight size={16} /></button></nav>}
      </article>
    </section>
  );
}

function formatStatementDate(date: string) {
  if (!date.includes("-")) return date;
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`)).replace(".", "");
}
