/* MuFinance credit center: stacked cards, invoice context and premium creation flow. */
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, CreditCard as CreditCardIcon, Plus, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { CardBrand, CardColor, CreditCard, Transaction } from "@/lib/financeData";

export type NewCreditCardPayload = Omit<CreditCard, "id">;

type CardWalletProps = {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddCard: (card: NewCreditCardPayload) => void;
  onSelectCard?: (card: CreditCard) => void;
};

const colors: { value: CardColor; label: string }[] = [
  { value: "ocean", label: "Oceano" },
  { value: "forest", label: "Floresta" },
  { value: "plum", label: "Ameixa" },
  { value: "sunset", label: "Pôr do sol" },
  { value: "graphite", label: "Grafite" },
];
const brands: CardBrand[] = ["Visa", "Mastercard", "Elo", "Amex"];
const defaultInvoiceMonths = ["2026-08", "2026-09", "2026-10", "2026-11"];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
}

function formatDay(day: number) {
  return `${String(day).padStart(2, "0")} ago`;
}

function invoiceMonthFor(transaction: Transaction) {
  const match = transaction.invoiceId?.match(/\d{4}-\d{2}$/);
  return match?.[0] ?? transaction.dateISO?.slice(0, 7) ?? "2026-08";
}

function formatInvoiceShort(month: string) {
  return new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

export function CardWallet({ cards, transactions, onAddCard, onSelectCard }: CardWalletProps) {
  const [open, setOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "");
  const [name, setName] = useState("");
  const [last4, setLast4] = useState("");
  const [brand, setBrand] = useState<CardBrand>("Visa");
  const [color, setColor] = useState<CardColor>("plum");
  const [limit, setLimit] = useState("12000");
  const [closingDay, setClosingDay] = useState("20");
  const [dueDay, setDueDay] = useState("28");
  const [error, setError] = useState("");
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState("2026-08");

  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];
  const totalUsed = useMemo(() => cards.reduce((total, card) => total + transactions.filter((item) => item.type === "expense" && item.sourceType === "credit-card" && item.sourceId === card.id).reduce((sum, item) => sum + item.amount, 0), 0), [cards, transactions]);
  const selectedCardTransactions = useMemo(() => selectedCard ? transactions.filter((item) => item.type === "expense" && item.sourceType === "credit-card" && item.sourceId === selectedCard.id) : [], [selectedCard, transactions]);
  const invoiceOptions = useMemo(() => {
    const months = new Set(defaultInvoiceMonths.concat(selectedCardTransactions.map(invoiceMonthFor)));
    return Array.from(months).sort().slice(0, 6);
  }, [selectedCardTransactions]);
  const selectedUsed = selectedCardTransactions.filter((item) => invoiceMonthFor(item) === selectedInvoiceMonth).reduce((sum, item) => sum + item.amount, 0);
  const currentInvoiceLabel = selectedCard ? `Fatura de ${new Date(`${selectedInvoiceMonth}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long" })} · ${formatDay(selectedCard.dueDay)}` : "Nenhuma fatura cadastrada";

  useEffect(() => {
    setSelectedInvoiceMonth("2026-08");
  }, [selectedCardId]);

  const close = () => {
    setOpen(false);
    setError("");
  };

  const selectCard = (card: CreditCard) => {
    setSelectedCardId(card.id);
    onSelectCard?.(card);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericLimit = Number(limit.replace(/\D/g, ""));
    const numericClosingDay = Number(closingDay);
    const numericDueDay = Number(dueDay);
    if (!name.trim()) {
      setError("Dê um nome para identificar este cartão.");
      return;
    }
    if (!/^\d{4}$/.test(last4)) {
      setError("Digite os quatro últimos números do cartão.");
      return;
    }
    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      setError("Informe um limite maior que zero.");
      return;
    }
    if (numericClosingDay < 1 || numericClosingDay > 28 || numericDueDay < 1 || numericDueDay > 28) {
      setError("Use dias entre 1 e 28 para fechamento e vencimento.");
      return;
    }
    onAddCard({ name: name.trim(), last4, brand, color, balance: "R$ 0,00", dueDate: `vence em ${formatDay(numericDueDay)}`, limit: numericLimit, closingDay: numericClosingDay, dueDay: numericDueDay });
    setName("");
    setLast4("");
    setBrand("Visa");
    setColor("plum");
    setLimit("12000");
    setClosingDay("20");
    setDueDay("28");
    close();
  };

  return (
    <>
      <motion.article id="cards" className="surface-card card-wallet-card" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.42 }}>
        <div className="card-header"><div><p className="eyebrow">CARTEIRA DE CRÉDITO</p><h2>Sua carteira</h2><p className="card-subtitle">Cartões, faturas e limites em um só lugar.</p></div><button className="soft-button soft-button--small" type="button" onClick={() => setOpen(true)}><Plus size={14} /> Novo cartão</button></div>
        <div className="credit-center-stats"><div><span>Limite total</span><strong>{formatBRL(cards.reduce((sum, card) => sum + card.limit, 0))}</strong></div><div><span>Comprometido</span><strong className="expense-text">{formatBRL(totalUsed)}</strong></div><div><span>Disponível</span><strong className="income-text">{formatBRL(Math.max(cards.reduce((sum, card) => sum + card.limit, 0) - totalUsed, 0))}</strong></div></div>
        <div className="card-wallet-layout">
          <div className="card-stack" aria-label={`${cards.length} cartões cadastrados`}>
            {cards.length ? cards.map((card, index) => <motion.button type="button" className={`wallet-card wallet-card--${card.color} ${selectedCard?.id === card.id ? "is-selected" : ""}`} style={{ "--card-index": index } as CSSProperties} key={card.id} onClick={() => selectCard(card)} whileHover={{ y: index === 0 ? -5 : -2, rotate: index === 0 ? -1 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} aria-label={`Selecionar ${card.name}`} aria-pressed={selectedCard?.id === card.id}>
              <span className="wallet-card-glow" /><span className="wallet-card-line wallet-card-line--one" /><span className="wallet-card-line wallet-card-line--two" />
              <span className="wallet-card-head"><strong>MuFinance</strong><span>{card.brand}</span></span><span className="wallet-card-chip"><span /><span /><span /></span><span className="wallet-card-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;{card.last4}</span><span className="wallet-card-foot"><span><small>{card.name}</small><strong>{formatBRL(transactions.filter((item) => item.sourceType === "credit-card" && item.sourceId === card.id).reduce((sum, item) => sum + item.amount, 0))}</strong></span><span><small>vence {formatDay(card.dueDay)}</small><strong>{card.brand === "Mastercard" ? "MC" : card.brand}</strong></span></span>
            </motion.button>) : <div className="card-stack-empty"><CreditCardIcon size={22} /><strong>Seu primeiro cartão começa aqui</strong><span>Adicione um cartão para acompanhar o limite e as faturas.</span></div>}
          </div>
          <div className="card-wallet-summary"><div className="wallet-summary-kicker"><Sparkles size={14} /> FATURA ATUAL</div><strong>{formatBRL(selectedUsed)}</strong><p>{selectedCard ? `${selectedCard.name} · ${currentInvoiceLabel}` : "Adicione um cartão para começar a organizar suas faturas."}</p><div className="invoice-progress"><span style={{ width: `${selectedCard ? Math.min((selectedUsed / selectedCard.limit) * 100, 100) : 0}%` }} /></div><div className="invoice-progress-meta"><span>Uso do limite</span><strong>{selectedCard ? `${Math.round((selectedUsed / selectedCard.limit) * 100)}%` : "0%"}</strong></div><button className="text-button" type="button" onClick={() => setOpen(true)}>Adicionar cartão <ChevronRight size={14} /></button></div>
        </div>
        <div className="invoice-strip"><div><span>Faturas</span><strong>{cards.length ? `${invoiceOptions.length} acompanhadas` : "Nenhuma ativa"}</strong></div><div className="invoice-pills" role="list" aria-label="Faturas por mês">{invoiceOptions.map((month) => { const total = selectedCardTransactions.filter((item) => invoiceMonthFor(item) === month).reduce((sum, item) => sum + item.amount, 0); return <button type="button" role="listitem" key={month} className={`invoice-pill ${selectedInvoiceMonth === month ? "is-active" : ""}`} onClick={() => { setSelectedInvoiceMonth(month); if (selectedCard) onSelectCard?.(selectedCard); }}>{formatInvoiceShort(month)} · {formatBRL(total)}<ChevronRight size={13} /></button>; })}</div><button type="button" className="invoice-pill" onClick={() => setOpen(true)}>+ Novo cartão</button></div>
      </motion.article>

      <AnimatePresence>
        {open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <motion.div className="modal-panel card-creator-panel" role="dialog" aria-modal="true" aria-labelledby="card-creator-title" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <div className="modal-header"><div className="modal-heading"><span className="modal-icon"><CreditCardIcon size={17} /></span><div><p className="eyebrow">CENTRAL DE CARTÕES</p><h2 id="card-creator-title">Adicionar cartão</h2><p>Cadastre limite, fechamento e vencimento para acompanhar cada fatura.</p></div></div><button className="modal-close" type="button" onClick={close} aria-label="Fechar modal"><X size={18} /></button></div>
            <div className={`card-preview card-preview--${color}`}><div><strong>MuFinance</strong><span>{brand}</span></div><span className="card-preview-chip" /><strong className="card-preview-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;{last4 || "0000"}</strong><small>{name || "Nome do cartão"}</small></div>
            <form className="transaction-form" onSubmit={submit}><label className="form-field form-field--wide"><span>Nome do cartão</span><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Ex.: Cartão viagens" /></label><div className="form-grid"><label className="form-field"><span>Últimos 4 números</span><input inputMode="numeric" maxLength={4} value={last4} onChange={(event) => { setLast4(event.target.value.replace(/\D/g, "")); setError(""); }} placeholder="0000" /></label><label className="form-field"><span>Bandeira</span><select value={brand} onChange={(event) => setBrand(event.target.value as CardBrand)}>{brands.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Limite total</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={limit} onChange={(event) => setLimit(event.target.value)} /></div></label><label className="form-field"><span>Fecha dia</span><input inputMode="numeric" maxLength={2} value={closingDay} onChange={(event) => setClosingDay(event.target.value.replace(/\D/g, ""))} /></label><label className="form-field"><span>Vence dia</span><input inputMode="numeric" maxLength={2} value={dueDay} onChange={(event) => setDueDay(event.target.value.replace(/\D/g, ""))} /></label></div><fieldset className="card-color-field"><legend>Cor do cartão</legend><div className="card-color-options">{colors.map((item) => <button type="button" key={item.value} className={`color-swatch color-swatch--${item.value} ${color === item.value ? "is-selected" : ""}`} onClick={() => setColor(item.value)} aria-label={item.label} aria-pressed={color === item.value}>{color === item.value && <Check size={14} />}</button>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="soft-button" type="button" onClick={close}>Cancelar</button><button className="primary-button modal-submit" type="submit"><Plus size={15} /> Criar cartão</button></div></form>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}
