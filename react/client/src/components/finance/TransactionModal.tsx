// MuFinance React — modal editorial compacto, com campos claros, foco acessível e movimento curto.

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, FileText, Plus, Wallet, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { Transaction } from "@/lib/financeData";

export type NewTransactionPayload = Omit<Transaction, "date">;

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: NewTransactionPayload) => void;
};

const categories = ["Alimentação", "Moradia", "Transporte", "Assinaturas", "Trabalho", "Receitas", "Outros"];
const accounts = ["Conta •7045", "Cartão •3391", "Reserva •2208"];

function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

export function TransactionModal({ open, onClose, onSubmit }: TransactionModalProps) {
  const [type, setType] = useState<Transaction["type"]>("expense");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [account, setAccount] = useState(accounts[0]);
  const [error, setError] = useState("");

  const close = () => {
    setError("");
    onClose();
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

    onSubmit({ payee: payee.trim(), amount: numericAmount, category, account, type });
    setPayee("");
    setAmount("");
    setError("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <motion.div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <div className="modal-header">
              <div className="modal-heading"><span className="modal-icon"><Plus size={17} /></span><div><p className="eyebrow">MOVIMENTAÇÃO MANUAL</p><h2 id="transaction-modal-title">Adicionar transação</h2><p>Registre uma entrada ou saída na sua carteira.</p></div></div>
              <button className="modal-close" type="button" onClick={close} aria-label="Fechar modal"><X size={18} /></button>
            </div>

            <form className="transaction-form" onSubmit={submit}>
              <div className="transaction-type-toggle" aria-label="Tipo de transação">
                <button type="button" className={type === "expense" ? "is-active is-expense" : ""} onClick={() => setType("expense")}><ArrowUpRight size={15} /><span>Despesa</span>{type === "expense" && <Check size={14} />}</button>
                <button type="button" className={type === "income" ? "is-active is-income" : ""} onClick={() => setType("income")}><ArrowDownLeft size={15} /><span>Receita</span>{type === "income" && <Check size={14} />}</button>
              </div>

              <label className="form-field form-field--wide"><span>Descrição</span><div className="input-shell"><FileText size={15} /><input autoFocus value={payee} onChange={(event) => { setPayee(event.target.value); setError(""); }} placeholder="Ex.: Mercado do mês" /></div></label>
              <label className="form-field form-field--amount"><span>Valor</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} placeholder="0,00" /></div></label>
              <div className="form-grid">
                <label className="form-field"><span>Categoria</span><div className="select-shell"><Wallet size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label>
                <label className="form-field"><span>Conta</span><div className="select-shell"><Wallet size={15} /><select value={account} onChange={(event) => setAccount(event.target.value)}>{accounts.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label>
              </div>
              <label className="form-field form-field--wide"><span>Data</span><div className="input-shell"><CalendarDays size={15} /><input type="text" value="13 ago 2026" readOnly /></div></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button className="soft-button" type="button" onClick={close}>Cancelar</button><button className={`primary-button modal-submit modal-submit--${type}`} type="submit"><Plus size={15} /> Salvar transação</button></div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
