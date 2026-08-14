/* MuFinance React — monthly card history keeps the same editorial, low-noise finance language. */
import { CalendarDays, Check, CreditCard, Download, FileText, Pencil, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CreditCard as CreditCardData, Transaction } from "@/lib/financeData";
import { ActionDialog } from "./ActionDialog";

export type CardHistoryPeriod = string | "all";

type CardDetailsDialogProps = {
  open: boolean;
  card: CreditCardData | null;
  transactions: Transaction[];
  onClose: () => void;
  onEditCard?: (card: CreditCardData) => void;
  onExport: (card: CreditCardData, month: CardHistoryPeriod, items: Transaction[]) => void;
  onPayInvoice: (card: CreditCardData, month: string, amount: number, transactionIds: string[]) => void;
};

const defaultMonths = ["2026-08", "2026-09", "2026-10", "2026-11"];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
}

function invoiceMonthFor(transaction: Transaction) {
  const match = transaction.invoiceId?.match(/\d{4}-\d{2}$/);
  return match?.[0] ?? transaction.dateISO?.slice(0, 7) ?? "2026-08";
}

function monthLabel(month: string) {
  return new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function shortDate(transaction: Transaction) {
  return transaction.date || new Date(`${transaction.dateISO ?? "2026-08-13"}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function CardDetailsDialog({ open, card, transactions, onClose, onEditCard, onExport, onPayInvoice }: CardDetailsDialogProps) {
  const [period, setPeriod] = useState<CardHistoryPeriod>("2026-08");
  const cardTransactions = useMemo(() => card ? transactions.filter((item) => item.sourceType === "credit-card" && item.sourceId === card.id && item.type === "expense") : [], [card, transactions]);
  const periods = useMemo(() => {
    const unique = new Set(defaultMonths.concat(cardTransactions.map(invoiceMonthFor)));
    return Array.from(unique).sort();
  }, [cardTransactions]);

  useEffect(() => {
    if (!open || !card) return;
    setPeriod(periods.includes("2026-08") ? "2026-08" : periods[0] ?? "all");
  }, [card, open, periods]);

  if (!card) return null;

  const visibleTransactions = period === "all" ? cardTransactions : cardTransactions.filter((item) => invoiceMonthFor(item) === period);
  const openTransactions = visibleTransactions.filter((item) => !item.settled);
  const paidTransactions = visibleTransactions.filter((item) => item.settled);
  const openAmount = openTransactions.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = paidTransactions.reduce((sum, item) => sum + item.amount, 0);
  const periodTitle = period === "all" ? "Todo o histórico" : monthLabel(period);

  return (
    <ActionDialog open={open} onClose={onClose} eyebrow="DETALHE DO CARTÃO" title={`${card.name} · ${card.brand}`} description={`•••• ${card.last4} · histórico organizado por fatura e status de baixa.`} icon={<CreditCard size={17} />} labelledBy="card-details-title" footer={<><button className="soft-button" type="button" onClick={onClose}>Fechar</button>{onEditCard && <button className="soft-button" type="button" onClick={() => onEditCard(card)}><Pencil size={15} /> Editar cartão</button>}{period !== "all" && openAmount > 0 && <button className="primary-button" type="button" onClick={() => onPayInvoice(card, period, openAmount, openTransactions.map((item) => item.id).filter((id): id is string => Boolean(id)))}><Check size={15} /> Pagar fatura</button>}</>}>
      <div className="card-detail-balance-row"><div><span>Em aberto</span><strong className={openAmount ? "expense-text" : "income-text"}>{formatBRL(openAmount)}</strong></div><div><span>Baixado</span><strong className="income-text">{formatBRL(paidAmount)}</strong></div><div><span>Limite livre</span><strong>{formatBRL(Math.max(card.limit - openAmount, 0))}</strong></div></div>
      <div className="card-detail-toolbar"><label className="form-field"><span>Período da fatura</span><div className="select-shell"><CalendarDays size={15} /><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Todo o histórico</option>{periods.map((item) => <option key={item} value={item}>{monthLabel(item)}</option>)}</select></div></label><button className="soft-button soft-button--small" type="button" onClick={() => onExport(card, period, visibleTransactions)}><Download size={14} /> Exportar CSV</button></div>
      <div className="card-history-heading"><div><p className="eyebrow">{periodTitle}</p><h3>{visibleTransactions.length ? `${visibleTransactions.length} lançamentos` : "Nenhum lançamento"}</h3></div><span className="card-history-limit">Limite {formatBRL(card.limit)}</span></div>
      <div className="card-history-list" aria-live="polite">{visibleTransactions.length ? visibleTransactions.map((item) => <div className={`card-history-row ${item.settled ? "is-settled" : ""}`} key={item.id ?? `${item.payee}-${item.dateISO}`}><span className={`card-history-icon ${item.settled ? "is-settled" : ""}`}>{item.settled ? <Check size={14} /> : <ReceiptText size={14} />}</span><span className="card-history-info"><strong>{item.payee}</strong><small>{shortDate(item)} · {item.category}</small></span><span className="card-history-amount"><strong>{formatBRL(item.amount)}</strong><small>{item.settled ? "Baixado" : "Em aberto"}</small></span></div>) : <div className="card-history-empty"><FileText size={20} /><strong>Sem transações neste período</strong><span>Os lançamentos adicionados para esta fatura aparecerão aqui.</span></div>}</div>
    </ActionDialog>
  );
}
