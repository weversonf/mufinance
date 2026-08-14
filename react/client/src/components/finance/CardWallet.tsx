// Soft Swiss Fintech / editorial dashboard: carteira empilhada com profundidade calma, linhas de maré e controles de criação acessíveis.

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, CreditCard as CreditCardIcon, Plus, Sparkles, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { CardBrand, CardColor, CreditCard } from "@/lib/financeData";

export type NewCreditCardPayload = Omit<CreditCard, "id">;

type CardWalletProps = {
  cards: CreditCard[];
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

export function CardWallet({ cards, onAddCard, onSelectCard }: CardWalletProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [last4, setLast4] = useState("");
  const [brand, setBrand] = useState<CardBrand>("Visa");
  const [color, setColor] = useState<CardColor>("plum");
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setError("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Dê um nome para identificar este cartão.");
      return;
    }
    if (!/^\d{4}$/.test(last4)) {
      setError("Digite os quatro últimos números do cartão.");
      return;
    }
    onAddCard({ name: name.trim(), last4, brand, color, balance: "R$ 0,00", dueDate: "sem vencimento definido" });
    setName("");
    setLast4("");
    setBrand("Visa");
    setColor("plum");
    close();
  };

  return (
    <>
      <motion.article id="cards" className="surface-card card-wallet-card" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.42 }}>
        <div className="card-header"><div><p className="eyebrow">CARTEIRA DIGITAL</p><h2>Seus cartões</h2><p className="card-subtitle">Escolha um cartão para acompanhar seus gastos.</p></div><button className="soft-button soft-button--small" type="button" onClick={() => setOpen(true)}><Plus size={14} /> Novo cartão</button></div>
        <div className="card-wallet-layout">
          <div className="card-stack" aria-label={`${cards.length} cartões cadastrados`}>
            {cards.length ? cards.map((card, index) => <motion.button type="button" className={`wallet-card wallet-card--${card.color}`} style={{ "--card-index": index } as React.CSSProperties} key={card.id} onClick={() => onSelectCard?.(card)} whileHover={{ y: index === 0 ? -5 : -2, rotate: index === 0 ? -1 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} aria-label={`Abrir ${card.name}`}>
              <span className="wallet-card-glow" /><span className="wallet-card-line wallet-card-line--one" /><span className="wallet-card-line wallet-card-line--two" />
              <span className="wallet-card-head"><strong>MuFinance</strong><span>{card.brand}</span></span><span className="wallet-card-chip"><span /><span /><span /></span><span className="wallet-card-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;{card.last4}</span><span className="wallet-card-foot"><span><small>{card.name}</small><strong>{card.balance}</strong></span><span><small>{card.dueDate}</small><strong>{card.brand === "Mastercard" ? "MC" : card.brand}</strong></span></span>
            </motion.button>) : <div className="card-stack-empty"><CreditCardIcon size={22} /><strong>Seu primeiro cartão começa aqui</strong><span>Adicione um cartão para acompanhar o limite e os lançamentos.</span></div>}
          </div>
          <div className="card-wallet-summary"><div className="wallet-summary-kicker"><Sparkles size={14} /> RASTRO DE MARÉ</div><strong>{cards.length} cartões ativos</strong><p>Organize diferentes bandeiras e veja cada gasto no contexto certo.</p><button className="text-button" type="button" onClick={() => setOpen(true)}>Adicionar cartão <ChevronRight size={14} /></button></div>
        </div>
      </motion.article>

      <AnimatePresence>
        {open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <motion.div className="modal-panel card-creator-panel" role="dialog" aria-modal="true" aria-labelledby="card-creator-title" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <div className="modal-header"><div className="modal-heading"><span className="modal-icon"><CreditCardIcon size={17} /></span><div><p className="eyebrow">NOVA CARTEIRA</p><h2 id="card-creator-title">Adicionar cartão</h2><p>Escolha uma identidade para reconhecer seus lançamentos.</p></div></div><button className="modal-close" type="button" onClick={close} aria-label="Fechar modal"><X size={18} /></button></div>
            <div className={`card-preview card-preview--${color}`}><div><strong>MuFinance</strong><span>{brand}</span></div><span className="card-preview-chip" /><strong className="card-preview-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;{last4 || "0000"}</strong><small>{name || "Nome do cartão"}</small></div>
            <form className="transaction-form" onSubmit={submit}><label className="form-field form-field--wide"><span>Nome do cartão</span><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Ex.: Cartão viagens" /></label><div className="form-grid"><label className="form-field"><span>Últimos 4 números</span><input inputMode="numeric" maxLength={4} value={last4} onChange={(event) => { setLast4(event.target.value.replace(/\D/g, "")); setError(""); }} placeholder="0000" /></label><label className="form-field"><span>Bandeira</span><select value={brand} onChange={(event) => setBrand(event.target.value as CardBrand)}>{brands.map((item) => <option key={item}>{item}</option>)}</select></label></div><fieldset className="card-color-field"><legend>Cor do cartão</legend><div className="card-color-options">{colors.map((item) => <button type="button" key={item.value} className={`color-swatch color-swatch--${item.value} ${color === item.value ? "is-selected" : ""}`} onClick={() => setColor(item.value)} aria-label={item.label} aria-pressed={color === item.value}>{color === item.value && <Check size={14} />}</button>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="soft-button" type="button" onClick={close}>Cancelar</button><button className="primary-button modal-submit" type="submit"><Plus size={15} /> Criar cartão</button></div></form>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}
