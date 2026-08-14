// Soft Swiss Fintech / editorial dashboard: formulário de transação direto, calmo e orientado ao contexto da conta ou cartão.

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, CreditCard, FileText, Plus, Wallet, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CreditCard as CreditCardType, Transaction } from "@/lib/financeData";

export type NewTransactionPayload = Omit<Transaction, "date">;

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: NewTransactionPayload, editingTransaction?: Transaction | null) => void;
  editingTransaction?: Transaction | null;
  accountOptions: string[];
  creditCards: CreditCardType[];
};

const categories = ["Alimentação", "Moradia", "Transporte", "Assinaturas", "Trabalho", "Receitas", "Outros"];

function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

export function TransactionModal({ open, onClose, onSubmit, editingTransaction, accountOptions, creditCards }: TransactionModalProps) {
  const [type, setType] = useState<Transaction["type"]>("expense");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [sourceType, setSourceType] = useState<"account" | "credit-card">("account");
  const [sourceId, setSourceId] = useState(accountOptions[0] ?? "Conta principal");
  const [error, setError] = useState("");

  const cardOptions = useMemo(() => creditCards.map((card) => `Cartão •${card.last4}`), [creditCards]);
  const sourceOptions = sourceType === "credit-card" ? cardOptions : accountOptions;

  useEffect(() => {
    if (!open) return;
    const current = editingTransaction;
    const inferredSourceType = current?.sourceType ?? (current?.account.toLowerCase().includes("cartão") ? "credit-card" : "account");
    setType(current?.type ?? "expense");
    setPayee(current?.payee ?? "");
    setAmount(current ? String(current.amount.toFixed(2)).replace(".", ",") : "");
    setCategory(current?.category ?? categories[0]);
    setSourceType(inferredSourceType);
    setSourceId(current?.sourceId ?? current?.account ?? (inferredSourceType === "credit-card" ? cardOptions[0] : accountOptions[0]) ?? "");
    setError("");
  }, [open, editingTransaction, accountOptions, cardOptions]);

  const close = () => {
    setError("");
    onClose();
  };

  const selectType = (nextType: Transaction["type"]) => {
    setType(nextType);
    if (nextType === "income" && sourceType === "credit-card") {
      setSourceType("account");
      setSourceId(accountOptions[0] ?? "Conta principal");
    }
  };

  const selectSourceType = (nextType: "account" | "credit-card") => {
    if (nextType === "credit-card" && type === "income") {
      setError("Cartões de crédito podem receber apenas despesas.");
      return;
    }
    setError("");
    setSourceType(nextType);
    setSourceId(nextType === "credit-card" ? cardOptions[0] ?? "" : accountOptions[0] ?? "");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = parseAmount(amount);
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

    onSubmit({ payee: payee.trim(), amount: numericAmount, category, account: sourceId, sourceType, sourceId, type }, editingTransaction);
    setPayee("");
    setAmount("");
    setError("");
  };

  const editing = Boolean(editingTransaction);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <motion.div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <div className="modal-header"><div className="modal-heading"><span className="modal-icon"><Plus size={17} /></span><div><p className="eyebrow">{editing ? "EDITAR MOVIMENTAÇÃO" : "MOVIMENTAÇÃO MANUAL"}</p><h2 id="transaction-modal-title">{editing ? "Editar transação" : "Adicionar transação"}</h2><p>{editing ? "Ajuste os detalhes sem sair da atividade." : "Registre uma entrada ou saída na sua carteira."}</p></div></div><button className="modal-close" type="button" onClick={close} aria-label="Fechar modal"><X size={18} /></button></div>

            <form className="transaction-form" onSubmit={submit}>
              <div className="transaction-type-toggle" aria-label="Tipo de transação"><button type="button" className={type === "expense" ? "is-active is-expense" : ""} onClick={() => selectType("expense")}><ArrowUpRight size={15} /><span>Despesa</span>{type === "expense" && <Check size={14} />}</button><button type="button" className={type === "income" ? "is-active is-income" : ""} onClick={() => selectType("income")}><ArrowDownLeft size={15} /><span>Receita</span>{type === "income" && <Check size={14} />}</button></div>
              <label className="form-field form-field--wide"><span>Descrição</span><div className="input-shell"><FileText size={15} /><input autoFocus value={payee} onChange={(event) => { setPayee(event.target.value); setError(""); }} placeholder="Ex.: Mercado do mês" /></div></label>
              <label className="form-field form-field--amount"><span>Valor</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} placeholder="0,00" /></div></label>
              <div className="form-grid"><label className="form-field"><span>Categoria</span><div className="select-shell"><Wallet size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label><label className="form-field"><span>{type === "income" ? "Conta que recebe" : "Origem do movimento"}</span><div className="select-shell"><Wallet size={15} /><select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>{sourceOptions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label></div>
              <div className="source-type-picker" aria-label="Origem do movimento"><button type="button" className={sourceType === "account" ? "is-active" : ""} onClick={() => selectSourceType("account")}><Wallet size={14} /><span>Conta</span>{sourceType === "account" && <Check size={13} />}</button><button type="button" className={`${sourceType === "credit-card" ? "is-active" : ""} ${type === "income" ? "is-disabled" : ""}`} onClick={() => selectSourceType("credit-card")} disabled={type === "income"}><CreditCard size={14} /><span>Cartão de crédito</span>{sourceType === "credit-card" && <Check size={13} />}</button></div>
              <label className="form-field form-field--wide"><span>Data</span><div className="input-shell"><CalendarDays size={15} /><input type="text" value="13 ago 2026" readOnly /></div></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button className="soft-button" type="button" onClick={close}>Cancelar</button><button className={`primary-button modal-submit modal-submit--${type}`} type="submit"><Check size={15} /> {editing ? "Salvar alterações" : "Salvar transação"}</button></div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
