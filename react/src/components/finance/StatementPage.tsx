// MuFinance — tela editorial de extrato; prioriza leitura diária de saldo, rastreabilidade e ações compactas.
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronLeft, Download, FileText, Filter, Search, Sparkles, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import type { Transaction } from "@/lib/financeData";
import { formatBRL, formatCompactBRL } from "@/lib/financeData";

type StatementPageProps = {
  transactions: Transaction[];
  periodLabel: string;
  onBack: () => void;
  onEdit: (transaction: Transaction) => void;
  onFilter: () => void;
  onExport: () => void;
};

const openingBalance = 21500;

export function StatementPage({ transactions, periodLabel, onBack, onEdit, onFilter, onExport }: StatementPageProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "income" | "expense">("all");
  const filtered = useMemo(() => transactions.filter((item) => {
    const matchesQuery = `${item.payee} ${item.category} ${item.account}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (mode === "all" || item.type === mode);
  }), [mode, query, transactions]);
  const summary = useMemo(() => filtered.reduce((result, item) => {
    result[item.type] += item.amount;
    return result;
  }, { income: 0, expense: 0 }), [filtered]);
  const dailyRows = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    transactions.forEach((item) => {
      const key = item.dateISO ?? item.date;
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    });
    let balance = openingBalance;
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => {
      const income = items.filter((item: Transaction) => item.type === "income").reduce((sum: number, item: Transaction) => sum + item.amount, 0);
      const expense = items.filter((item: Transaction) => item.type === "expense").reduce((sum: number, item: Transaction) => sum + item.amount, 0);
      balance += income - expense;
      return { date, items, income, expense, net: income - expense, balance };
    }).reverse();
  }, [transactions]);
  const currentBalance = openingBalance + summary.income - summary.expense;

  return <section className="dedicated-page statement-page">
    <div className="dedicated-page-header">
      <div>
        <button className="back-link" type="button" onClick={onBack}><ChevronLeft size={16} /> Voltar para início</button>
        <p className="eyebrow">EXTRATO FINANCEIRO</p>
        <h1>Seu dinheiro, dia após dia.</h1>
        <p className="page-subtitle">Uma leitura completa dos lançamentos e do saldo acumulado em {periodLabel.toLowerCase()}.</p>
      </div>
      <div className="dedicated-page-actions"><button className="soft-button" type="button" onClick={onFilter}><Filter size={15} /> Filtrar</button><button className="primary-button" type="button" onClick={onExport}><Download size={15} /> Exportar extrato</button></div>
    </div>

    <div className="statement-hero-grid">
      <article className="statement-balance-card"><div className="statement-card-kicker"><span className="kpi-icon kpi-icon--mint"><Wallet size={17} /></span><span>Saldo ao fim do período</span></div><strong>{formatBRL(currentBalance)}</strong><small>Saldo inicial de {formatBRL(openingBalance)}</small><div className="statement-balance-line"><span>Movimentação líquida</span><b className={summary.income - summary.expense >= 0 ? "income-text" : "expense-text"}>{summary.income - summary.expense >= 0 ? "+" : "−"}{formatBRL(Math.abs(summary.income - summary.expense))}</b></div></article>
      <article className="statement-summary-card"><div className="statement-summary-item"><span className="statement-summary-icon statement-summary-icon--income"><ArrowDownLeft size={15} /></span><div><small>Entradas</small><strong className="income-text">+{formatCompactBRL(summary.income)}</strong></div></div><div className="statement-summary-item"><span className="statement-summary-icon statement-summary-icon--expense"><ArrowUpRight size={15} /></span><div><small>Saídas</small><strong className="expense-text">−{formatCompactBRL(summary.expense)}</strong></div></div><div className="statement-summary-item"><span className="statement-summary-icon statement-summary-icon--neutral"><FileText size={15} /></span><div><small>Lançamentos</small><strong>{filtered.length}</strong></div></div></article>
    </div>

    <article className="statement-health-card"><div className="statement-health-copy"><div className="banner-kicker"><span className="statement-health-icon"><Sparkles size={14} /></span> SAÚDE FINANCEIRA</div><h2>Você guardou <strong>R$ 1.644</strong> neste período</h2><p>Seu ritmo de economia está acima da média recente. Use este resumo para conectar saldo diário, compromissos e decisões de longo prazo.</p></div><div className="statement-health-metrics"><div><span>Taxa de economia</span><strong>34%</strong></div><div><span>Compromissos próximos</span><strong>3</strong></div><div><span>Orçamentos acima</span><strong>1</strong></div></div></article>

    <div className="statement-toolbar"><div className="statement-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no extrato" aria-label="Buscar no extrato" /></div><div className="segmented-control"><button type="button" className={mode === "all" ? "is-active" : ""} onClick={() => setMode("all")}>Todos</button><button type="button" className={mode === "income" ? "is-active" : ""} onClick={() => setMode("income")}>Entradas</button><button type="button" className={mode === "expense" ? "is-active" : ""} onClick={() => setMode("expense")}>Saídas</button></div></div>

    <div className="statement-layout"><article className="surface-card daily-balance-card"><div className="card-header"><div><p className="eyebrow">RESUMO DIÁRIO</p><h2>Saldo por dia</h2><p className="card-subtitle">Acompanhe como cada movimento altera o caixa.</p></div><CalendarDays size={18} className="card-header-symbol" /></div><div className="daily-balance-list">{dailyRows.map((row) => <div className="daily-balance-row" key={row.date}><div className="daily-date"><strong>{formatStatementDate(row.date)}</strong><span>{row.items.length} {row.items.length === 1 ? "lançamento" : "lançamentos"}</span></div><div className="daily-flow"><span className="income-text">+{formatCompactBRL(row.income)}</span><span className="expense-text">−{formatCompactBRL(row.expense)}</span></div><div className="daily-net"><span>Saldo do dia</span><strong>{formatCompactBRL(row.balance)}</strong><small className={row.net >= 0 ? "income-text" : "expense-text"}>{row.net >= 0 ? "+" : "−"}{formatCompactBRL(Math.abs(row.net))}</small></div></div>)}{dailyRows.length === 0 && <div className="table-empty"><FileText size={18} /><strong>Nenhum dia encontrado</strong><span>Ajuste sua busca para continuar.</span></div>}</div></article>
      <article className="surface-card statement-insight-card"><p className="eyebrow">LEITURA RÁPIDA</p><h2>O que mudou?</h2><p>O maior movimento de entrada foi <strong>{transactions.find((item) => item.type === "income")?.payee ?? "seu recebimento"}</strong>. As saídas estão concentradas em <strong>{transactions.find((item) => item.type === "expense")?.category ?? "despesas recorrentes"}</strong>.</p><div className="insight-meter"><div><span>Ritmo de entradas</span><strong>{summary.income > summary.expense ? "Saudável" : "Atenção"}</strong></div><div className="progress-track"><div className="progress-fill progress-fill--mint" style={{ width: `${Math.min(100, Math.round((summary.income / Math.max(summary.expense, 1)) * 50))}%` }} /></div></div><div className="insight-note"><Wallet size={15} /><span>Saldo diário calculado com base nos lançamentos demonstrativos desta sessão.</span></div></article></div>

    <article className="surface-card statement-transactions-card"><div className="card-header"><div><p className="eyebrow">LANÇAMENTOS DO PERÍODO</p><h2>Extrato completo</h2><p className="card-subtitle">Clique em uma linha para editar o lançamento.</p></div><span className="statement-count">{filtered.length} itens</span></div><div className="transactions-table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th className="amount-cell">Valor</th><th /></tr></thead><tbody>{filtered.map((transaction) => <tr key={`${transaction.id ?? transaction.date}-${transaction.payee}-${transaction.amount}`} className="transaction-row" tabIndex={0} role="button" onClick={() => onEdit(transaction)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onEdit(transaction); } }}><td className="muted-cell">{transaction.date}</td><td><span className={`transaction-icon transaction-icon--${transaction.type}`}>{transaction.type === "income" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><strong>{transaction.payee}</strong></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-cell">{transaction.account}</td><td className={`amount-cell ${transaction.type === "income" ? "income-text" : "expense-text"}`}>{transaction.type === "income" ? "+" : "−"}{formatBRL(transaction.amount).replace("R$ ", "R$ ")}</td><td className="transaction-edit-cell"><span>Editar</span></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="table-empty"><Search size={18} /><strong>Nenhum lançamento encontrado</strong><span>Tente outro termo ou altere o filtro.</span></div>}</div></article>
  </section>;
}

function formatStatementDate(date: string) {
  if (!date.includes("-")) return date;
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`)).replace(".", "");
}
