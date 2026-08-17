/* MuFinance transaction flow: account/card source, invoice choice and automatic billing schedules. */
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CalendarDays, Check, ChevronDown, CreditCard, FileText, Repeat2, Wallet, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getTransactionStatus, type CreditCard as CreditCardType, type Transaction, type TransactionStatus } from "@/lib/financeData";
import { Switch } from "@/components/ui/switch";

export type NewTransactionPayload = Omit<Transaction, "date" | "id"> & {
  dateISO: string;
  billingKind: "single" | "installment" | "subscription";
  billingCount: number;
};

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: NewTransactionPayload, editingTransaction?: Transaction | null) => void;
  editingTransaction?: Transaction | null;
  initialType?: Transaction["type"];
  accountOptions: string[];
  creditCards: CreditCardType[];
  categories: string[];
};

const invoiceMonths = ["2026-08", "2026-09", "2026-10", "2026-11"];

function parseAmount(value: string) {
  const normalized = value.trim().replace(/\s/g, "");
  if (!normalized) return NaN;
  return Number(normalized.includes(",") ? normalized.replace(/\./g, "").replace(",", ".") : normalized);
}

function monthLabel(month: string, dueDay: number) {
  const date = new Date(`${month}-01T12:00:00`);
  return `Fatura de ${date.toLocaleDateString("pt-BR", { month: "long" })} · vence dia ${dueDay}`;
}

function fallbackDate() {
  return "2026-08-13";
}

export function TransactionModal({ open, onClose, onSubmit, editingTransaction, initialType = "expense", accountOptions, creditCards, categories }: TransactionModalProps) {
  const categoryOptions = useMemo(() => categories.length ? categories : ["Outros"], [categories]);
  const [type, setType] = useState<Transaction["type"]>(initialType);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [sourceType, setSourceType] = useState<"account" | "credit-card">("account");
  const [sourceId, setSourceId] = useState(accountOptions[0] ?? "Conta principal");
  const [destinationAccount, setDestinationAccount] = useState(accountOptions[1] ?? accountOptions[0] ?? "");
  const [dateISO, setDateISO] = useState(fallbackDate());
  const [invoiceMonth, setInvoiceMonth] = useState("2026-08");
  const [billingKind, setBillingKind] = useState<"single" | "installment" | "subscription">("single");
  const [billingCount, setBillingCount] = useState("3");
  const [status, setStatus] = useState<TransactionStatus>("completed");
  const [error, setError] = useState("");

  const cardOptions = useMemo(() => creditCards.map((card) => ({ value: card.id, label: `${card.name} ·•••• ${card.last4}` })), [creditCards]);
  const sourceOptions = sourceType === "credit-card" ? cardOptions : accountOptions.map((value) => ({ value, label: value }));
  const selectedCard = creditCards.find((card) => card.id === sourceId) ?? creditCards.find((card) => sourceId.includes(card.last4));

  useEffect(() => {
    if (!open) return;
    const current = editingTransaction;
    const inferredSourceType = current?.sourceType ?? (current?.account.toLowerCase().includes("cartão") ? "credit-card" : "account");
    const matchedCard = creditCards.find((card) => card.id === current?.sourceId || current?.account.includes(card.last4));
    setType(current?.type ?? initialType);
    setPayee(current?.payee ?? "");
    setAmount(current ? String((current.totalAmount ?? current.amount).toFixed(2)).replace(".", ",") : "");
    setCategory(current?.category ?? categoryOptions[0]);
    setSourceType(inferredSourceType);
    setSourceId(current?.sourceId ?? matchedCard?.id ?? current?.account ?? (inferredSourceType === "credit-card" ? cardOptions[0]?.value : accountOptions[0]) ?? "");
    setDestinationAccount(current?.destinationAccount ?? accountOptions.find((account) => account !== current?.sourceId && account !== current?.account) ?? accountOptions[1] ?? accountOptions[0] ?? "");
    setDateISO(current?.dateISO ?? fallbackDate());
    setInvoiceMonth(current?.invoiceId?.split("-").slice(-2).join("-") ?? "2026-08");
    setBillingKind(current?.billingKind ?? "single");
    setBillingCount(String(current?.billingCount ?? 3));
    setStatus(current ? getTransactionStatus(current) : "completed");
    setError("");
  }, [open, editingTransaction, initialType, accountOptions, cardOptions, creditCards, categoryOptions]);

  const close = () => {
    setError("");
    onClose();
  };

  const selectType = (nextType: Transaction["type"]) => {
    setType(nextType);
    setError("");
    if (nextType === "transfer") {
      setSourceType("account");
      setSourceId(accountOptions[0] ?? "");
      setDestinationAccount(accountOptions.find((account) => account !== (accountOptions[0] ?? "")) ?? accountOptions[0] ?? "");
      setBillingKind("single");
      return;
    }
    if (nextType === "income" && sourceType === "credit-card") {
      setSourceType("account");
      setSourceId(accountOptions[0] ?? "Conta principal");
      setBillingKind("single");
    }
  };

  const selectExpenseMode = (nextSourceType: "account" | "credit-card") => {
    setType("expense");
    setError("");
    setSourceType(nextSourceType);
    setSourceId(nextSourceType === "credit-card" ? cardOptions[0]?.value ?? "" : accountOptions[0] ?? "");
    if (nextSourceType === "account") setBillingKind("single");
  };

  const selectSourceType = (nextType: "account" | "credit-card") => {
    if (nextType === "credit-card" && type === "income") {
      setError("Cartões de crédito podem receber apenas despesas.");
      return;
    }
    setError("");
    setSourceType(nextType);
    setSourceId(nextType === "credit-card" ? cardOptions[0]?.value ?? "" : accountOptions[0] ?? "");
    if (nextType === "account") setBillingKind("single");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = parseAmount(amount);
    const numericCount = billingKind === "single" ? 1 : Number(billingCount);
    if (!payee.trim()) {
      setError("Adicione uma descrição para identificar o lançamento.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Digite um valor maior que zero.");
      return;
    }
    if (!sourceId) {
      setError(sourceType === "credit-card" ? "Adicione um cartão antes de lançar a despesa." : "Escolha uma conta para receber ou gerar o movimento.");
      return;
    }
    if (type === "transfer" && (!destinationAccount || destinationAccount === sourceId)) {
      setError("Escolha duas contas bancárias diferentes para concluir a transferência.");
      return;
    }
    if (sourceType === "credit-card" && (numericCount < 2 || numericCount > 24) && billingKind !== "single") {
      setError("Escolha entre 2 e 24 ocorrências para programar o cartão.");
      return;
    }
    const day = dateISO.slice(-2);
    const scheduledDate = sourceType === "credit-card" ? `${invoiceMonth}-${day}` : dateISO;
    const accountLabel = sourceType === "credit-card" ? `Cartão •${selectedCard?.last4 ?? sourceId}` : sourceId;
    onSubmit({ payee: payee.trim(), amount: numericAmount, totalAmount: numericAmount, category: type === "transfer" ? "Transferência entre contas" : category, account: accountLabel, destinationAccount: type === "transfer" ? destinationAccount : undefined, sourceType: type === "transfer" ? "account" : sourceType, sourceId, type, status, dateISO: scheduledDate, invoiceId: sourceType === "credit-card" ? `${sourceId}-${invoiceMonth}` : undefined, billingKind, billingCount: numericCount }, editingTransaction);
    setPayee("");
    setAmount("");
    setError("");
  };

  const editing = Boolean(editingTransaction);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <motion.div className="modal-panel modal-panel--transaction" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <div className="modal-header"><div className="modal-heading"><span className="modal-icon"><Repeat2 size={17} /></span><div><p className="eyebrow">{editing ? "EDITAR MOVIMENTAÇÃO" : "MOVIMENTAÇÃO MANUAL"}</p><h2 id="transaction-modal-title">{editing ? "Editar transação" : "Adicionar transação"}</h2><p>{editing ? "Ajuste os detalhes sem sair da atividade." : "Registre uma entrada, saída ou compromisso do cartão."}</p></div></div><button className="modal-close" type="button" onClick={close} aria-label="Fechar modal"><X size={18} /></button></div>
            <form className="transaction-form" onSubmit={submit}>
              <div className={`transaction-type-toggle ${type === "transfer" ? "transaction-type-toggle--transfer" : ""}`} aria-label="Tipo de transação"><button type="button" className={type === "income" ? "is-active is-income" : ""} onClick={() => selectType("income")}><ArrowDownLeft size={15} /><span>Receita</span>{type === "income" && <Check size={14} />}</button><button type="button" className={type === "expense" && sourceType === "account" ? "is-active is-expense" : ""} onClick={() => selectExpenseMode("account")}><ArrowUpRight size={15} /><span>Despesa</span>{type === "expense" && sourceType === "account" && <Check size={14} />}</button><button type="button" className={type === "expense" && sourceType === "credit-card" ? "is-active is-card-expense" : ""} onClick={() => selectExpenseMode("credit-card")}><CreditCard size={15} /><span>Despesa Cartão</span>{type === "expense" && sourceType === "credit-card" && <Check size={14} />}</button>{type === "transfer" && <button type="button" className="is-active is-transfer" onClick={() => selectType("transfer")}><ArrowLeftRight size={15} /><span>Entre contas</span><Check size={14} /></button>}</div>
              <label className="form-field form-field--wide"><span>Descrição</span><div className="input-shell"><FileText size={15} /><input autoFocus value={payee} onChange={(event) => { setPayee(event.target.value); setError(""); }} placeholder="Ex.: Mercado do mês ou Netflix" /></div></label>
              <label className="form-field form-field--amount"><span>Valor total</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} placeholder="0,00" /></div></label>
              {type === "transfer" ? <div className="transfer-accounts-grid"><label className="form-field"><span>Conta de origem</span><div className="select-shell"><Wallet size={15} /><select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>{accountOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label><label className="form-field"><span>Conta de destino</span><div className="select-shell"><Wallet size={15} /><select value={destinationAccount} onChange={(event) => setDestinationAccount(event.target.value)}>{accountOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label></div> : <div className="form-grid"><label className="form-field"><span>Categoria</span><div className="select-shell"><Wallet size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label><label className="form-field form-field--source"><span>{type === "income" ? "Conta que recebe" : sourceType === "credit-card" ? "Cartão de crédito" : "Conta do movimento"}</span><div className="select-shell">{sourceType === "credit-card" ? <CreditCard size={15} /> : <Wallet size={15} />}<select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>{sourceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={14} /></div></label></div>}
              {type !== "transfer" && <div className="transaction-switch-row"><Switch id="transaction-use-card" checked={sourceType === "credit-card"} disabled={type === "income"} onCheckedChange={(checked) => selectSourceType(checked ? "credit-card" : "account")} /><label htmlFor="transaction-use-card"><strong>Usar cartão de crédito</strong><span>{type === "income" ? "Receitas entram somente em contas bancárias." : sourceType === "credit-card" ? "A cobrança será registrada na fatura selecionada." : "O movimento será registrado na conta selecionada."}</span></label></div>}
              <fieldset className="billing-field transaction-status-field"><legend>Status do lançamento</legend><div className="transaction-switch-row"><Switch id="transaction-realized" checked={status === "completed"} onCheckedChange={(checked) => setStatus(checked ? "completed" : "planned")} /><label htmlFor="transaction-realized"><strong>{status === "completed" ? "Realizada" : "Prevista"}</strong><span>{status === "completed" ? "Entra no saldo efetivo." : "Fica registrada como compromisso futuro."}</span></label></div></fieldset>
              {sourceType === "credit-card" && <>
                <div className="form-grid"><label className="form-field"><span>Fatura de lançamento</span><div className="select-shell"><CreditCard size={15} /><select value={invoiceMonth} onChange={(event) => setInvoiceMonth(event.target.value)}>{invoiceMonths.map((month) => <option key={month} value={month}>{monthLabel(month, selectedCard?.dueDay ?? 28)}</option>)}</select><ChevronDown size={14} /></div></label><label className="form-field"><span>Data da compra</span><div className="input-shell"><CalendarDays size={15} /><input type="date" value={dateISO} onChange={(event) => setDateISO(event.target.value)} /></div></label></div>
                <fieldset className="billing-field"><legend>Como essa cobrança acontece?</legend><div className="billing-type-picker"><button type="button" className={billingKind === "single" ? "is-active" : ""} onClick={() => setBillingKind("single")}>À vista</button><button type="button" className={billingKind === "installment" ? "is-active" : ""} onClick={() => setBillingKind("installment")}>Parcelada</button><button type="button" className={billingKind === "subscription" ? "is-active" : ""} onClick={() => setBillingKind("subscription")}>Assinatura</button></div>{billingKind !== "single" && <label className="form-field"><span>{billingKind === "installment" ? "Número de parcelas" : "Meses para programar"}</span><div className="amount-shell"><b>#</b><input inputMode="numeric" min={2} max={24} value={billingCount} onChange={(event) => setBillingCount(event.target.value.replace(/\D/g, ""))} /></div></label>}<p className="billing-hint">{billingKind === "single" ? "A despesa entra somente na fatura escolhida." : billingKind === "installment" ? `O total será dividido automaticamente em ${billingCount || "0"} parcelas iguais.` : `O sistema criará ${billingCount || "0"} cobranças mensais para esta assinatura.`}</p></fieldset>
              </>}
              {sourceType === "account" && <label className="form-field form-field--wide"><span>Data</span><div className="input-shell"><CalendarDays size={15} /><input type="date" value={dateISO} onChange={(event) => setDateISO(event.target.value)} /></div></label>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button className="soft-button" type="button" onClick={close}>Cancelar</button><button className={`primary-button modal-submit modal-submit--${type}`} type="submit"><Check size={15} /> {editing ? "Salvar alterações" : billingKind === "single" ? "Salvar transação" : "Programar cobranças"}</button></div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
