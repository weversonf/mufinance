import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, CreditCard, Plus, ShieldCheck, Trash2, UserRound, Wallet } from "lucide-react";
import type { Account, CardBrand, CardColor, CreditCard as CreditCardData } from "@/lib/financeData";

export type SetupProfile = {
  name: string;
  email: string;
  username: string;
  usernameChangedAt: string | null;
};

export type InitialSetupData = {
  profile: SetupProfile;
  accounts: Account[];
  cards: CreditCardData[];
};

type AccountDraft = { name: string; last4: string; balance: string };
type CardDraft = { name: string; last4: string; brand: CardBrand; limit: string; closingDay: string; dueDay: string; color: CardColor };

const accountTones: Account["tone"][] = ["mint", "lavender", "peach", "blue"];
const cardColors: { value: CardColor; label: string }[] = [
  { value: "ocean", label: "Oceano" },
  { value: "forest", label: "Floresta" },
  { value: "plum", label: "Ameixa" },
  { value: "sunset", label: "Pôr do sol" },
  { value: "graphite", label: "Grafite" },
];
const cardBrands: CardBrand[] = ["Visa", "Mastercard", "Elo", "Amex"];

const emptyAccount = (): AccountDraft => ({ name: "", last4: "", balance: "0" });
const emptyCard = (): CardDraft => ({ name: "", last4: "", brand: "Visa", limit: "", closingDay: "20", dueDay: "28", color: "ocean" });

function parseBRL(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
}

export function InitialSetupScreen({ email, onComplete }: { email: string; onComplete: (data: InitialSetupData) => void }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<SetupProfile>({ name: "", email, username: "", usernameChangedAt: null });
  const [accounts, setAccounts] = useState<AccountDraft[]>([emptyAccount()]);
  const [cards, setCards] = useState<CardDraft[]>([]);
  const [error, setError] = useState("");

  const stepCopy = useMemo(() => [
    { eyebrow: "PRIMEIRO ACESSO", title: "Vamos preparar seu espaço", description: "Comece com seus dados básicos. Você poderá ajustar tudo depois em Configurações.", icon: UserRound },
    { eyebrow: "SEU DINHEIRO", title: "Quais contas você usa?", description: "Cadastre suas contas bancárias e comece com os saldos atuais. Se preferir, deixe para depois.", icon: Building2 },
    { eyebrow: "CARTEIRA DE CRÉDITO", title: "Você usa cartão?", description: "Adicione seus cartões de crédito para acompanhar limites e faturas. Esta etapa é opcional.", icon: CreditCard },
  ][step], [step]);
  const Icon = stepCopy.icon;

  const updateAccount = (index: number, field: keyof AccountDraft, value: string) => {
    setAccounts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    setError("");
  };
  const updateCard = (index: number, field: keyof CardDraft, value: string) => {
    setCards((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    setError("");
  };

  const validateProfile = () => {
    const username = profile.username.trim().replace(/^@/, "").toLowerCase();
    if (profile.name.trim().length < 2) return "Informe seu nome completo para continuar.";
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return "O @usuário deve ter de 3 a 20 caracteres usando letras, números, ponto ou sublinhado.";
    setProfile((current) => ({ ...current, name: current.name.trim(), username }));
    return "";
  };

  const buildAccounts = () => {
    const filled = accounts.filter((item) => item.name.trim() || item.last4.trim() || parseBRL(item.balance) !== 0);
    for (const item of filled) {
      if (!item.name.trim()) return { error: "Informe um nome para cada conta preenchida." };
      if (!/^\d{4}$/.test(item.last4)) return { error: `Digite os quatro últimos números da conta ${item.name}.` };
    }
    return {
      error: "",
      value: filled.map((item, index) => {
        const balance = parseBRL(item.balance);
        return {
          name: item.name.trim(),
          number: `•••• ${item.last4}`,
          value: formatBRL(balance),
          balance,
          change: "",
          tone: accountTones[index % accountTones.length],
          icon: "bank",
        } satisfies Account;
      }),
    };
  };

  const buildCards = () => {
    for (const item of cards) {
      if (!item.name.trim() || !/^\d{4}$/.test(item.last4)) return { error: "Preencha o nome e os quatro últimos números de cada cartão." };
      if (parseBRL(item.limit) <= 0) return { error: `Informe um limite maior que zero para ${item.name}.` };
      const closingDay = Number(item.closingDay);
      const dueDay = Number(item.dueDay);
      if (closingDay < 1 || closingDay > 28 || dueDay < 1 || dueDay > 28) return { error: "Use dias entre 1 e 28 para fechamento e vencimento do cartão." };
    }
    return {
      error: "",
      value: cards.map((item, index) => ({
        id: `card-${Date.now()}-${index}`,
        name: item.name.trim(),
        last4: item.last4,
        brand: item.brand,
        color: item.color,
        balance: "R$ 0,00",
        dueDate: `vence em ${String(Number(item.dueDay)).padStart(2, "0")} ago`,
        limit: parseBRL(item.limit),
        closingDay: Number(item.closingDay),
        dueDay: Number(item.dueDay),
      } satisfies CreditCardData)),
    };
  };

  const next = (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    if (step === 0) {
      const validation = validateProfile();
      if (validation) { setError(validation); return; }
      setStep(1);
      return;
    }
    if (step === 1) {
      const result = buildAccounts();
      if (result.error) { setError(result.error); return; }
      setStep(2);
      return;
    }
    const accountResult = buildAccounts();
    const cardResult = buildCards();
    if (accountResult.error || cardResult.error) { setError(accountResult.error || cardResult.error); return; }
    onComplete({ profile: { ...profile, name: profile.name.trim(), username: profile.username.trim().replace(/^@/, "").toLowerCase() }, accounts: accountResult.value ?? [], cards: cardResult.value ?? [] });
  };

  const back = () => { setError(""); setStep((current) => Math.max(0, current - 1)); };

  return (
    <main className="setup-screen">
      <div className="setup-orbit setup-orbit--one" />
      <div className="setup-orbit setup-orbit--two" />
      <section className="setup-card" aria-labelledby="setup-title">
        <header className="setup-header">
          <div className="setup-brand"><span className="setup-brand-mark">Mu</span><strong>Finance</strong></div>
          <span className="setup-step-label">Etapa {step + 1} de 3</span>
        </header>
        <div className="setup-progress" aria-label={`Etapa ${step + 1} de 3`}><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
        <div className="setup-heading"><span className="setup-icon"><Icon size={20} /></span><div><p className="setup-eyebrow">{stepCopy.eyebrow}</p><h1 id="setup-title">{stepCopy.title}</h1><p>{stepCopy.description}</p></div></div>

        {step === 0 && <form className="setup-form" onSubmit={next}>
          <label className="setup-field"><span>Seu nome</span><input autoFocus value={profile.name} onChange={(event) => { setProfile((current) => ({ ...current, name: event.target.value })); setError(""); }} placeholder="Ex.: Maria Silva" /></label>
          <label className="setup-field"><span>Como as pessoas encontrarão você?</span><div className="setup-input-prefix"><b>@</b><input value={profile.username} onChange={(event) => { setProfile((current) => ({ ...current, username: event.target.value.replace(/^@/, "") })); setError(""); }} placeholder="seu.usuario" /></div><small>Use de 3 a 20 caracteres, sem espaços.</small></label>
          <label className="setup-field"><span>E-mail da conta</span><input value={profile.email} disabled /></label>
          {error && <p className="setup-error" role="alert">{error}</p>}
          <button className="setup-primary" type="submit">Continuar <ArrowRight size={16} /></button>
        </form>}

        {step === 1 && <form className="setup-form" onSubmit={next}>
          <div className="setup-list">{accounts.map((account, index) => <div className="setup-item" key={`account-${index}`}><div className="setup-item-heading"><div><strong>Conta {index + 1}</strong><small>Saldo inicial opcional</small></div>{accounts.length > 1 && <button type="button" className="setup-remove" onClick={() => setAccounts((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remover conta ${index + 1}`}><Trash2 size={15} /></button>}</div><div className="setup-grid"><label className="setup-field"><span>Nome da conta</span><input autoFocus={index === 0} value={account.name} onChange={(event) => updateAccount(index, "name", event.target.value)} placeholder="Ex.: Nubank" /></label><label className="setup-field"><span>Últimos 4 números</span><input inputMode="numeric" maxLength={4} value={account.last4} onChange={(event) => updateAccount(index, "last4", event.target.value.replace(/\D/g, ""))} placeholder="0000" /></label><label className="setup-field setup-field--wide"><span>Saldo atual</span><div className="setup-input-prefix"><b>R$</b><input inputMode="decimal" value={account.balance} onChange={(event) => updateAccount(index, "balance", event.target.value)} placeholder="0,00" /></div></label></div></div>)}</div><button type="button" className="setup-secondary setup-secondary--full" onClick={() => setAccounts((current) => [...current, emptyAccount()])}><Plus size={15} /> Adicionar outra conta</button>{error && <p className="setup-error" role="alert">{error}</p>}<div className="setup-actions"><button type="button" className="setup-back" onClick={back}><ArrowLeft size={15} /> Voltar</button><button className="setup-primary" type="submit">Continuar <ArrowRight size={16} /></button></div></form>}

        {step === 2 && <form className="setup-form" onSubmit={next}>
          {cards.length === 0 && <div className="setup-empty"><CreditCard size={22} /><strong>Nenhum cartão cadastrado</strong><span>Você pode começar sem cartões e adicioná-los depois.</span></div>}
          <div className="setup-list">{cards.map((card, index) => <div className="setup-item" key={`card-${index}`}><div className="setup-item-heading"><div><strong>Cartão {index + 1}</strong><small>Limite e datas da fatura</small></div><button type="button" className="setup-remove" onClick={() => setCards((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remover cartão ${index + 1}`}><Trash2 size={15} /></button></div><div className="setup-grid"><label className="setup-field"><span>Nome do cartão</span><input autoFocus={index === 0} value={card.name} onChange={(event) => updateCard(index, "name", event.target.value)} placeholder="Ex.: Cartão principal" /></label><label className="setup-field"><span>Últimos 4 números</span><input inputMode="numeric" maxLength={4} value={card.last4} onChange={(event) => updateCard(index, "last4", event.target.value.replace(/\D/g, ""))} placeholder="0000" /></label><label className="setup-field"><span>Bandeira</span><select value={card.brand} onChange={(event) => updateCard(index, "brand", event.target.value)}>{cardBrands.map((brand) => <option key={brand}>{brand}</option>)}</select></label><label className="setup-field"><span>Limite total</span><div className="setup-input-prefix"><b>R$</b><input inputMode="decimal" value={card.limit} onChange={(event) => updateCard(index, "limit", event.target.value)} placeholder="0,00" /></div></label><label className="setup-field"><span>Fecha dia</span><input inputMode="numeric" maxLength={2} value={card.closingDay} onChange={(event) => updateCard(index, "closingDay", event.target.value.replace(/\D/g, ""))} /></label><label className="setup-field"><span>Vence dia</span><input inputMode="numeric" maxLength={2} value={card.dueDay} onChange={(event) => updateCard(index, "dueDay", event.target.value.replace(/\D/g, ""))} /></label></div><div className="setup-color-row"><span>Cor do cartão</span><div>{cardColors.map((color) => <button type="button" key={color.value} className={`setup-swatch setup-swatch--${color.value} ${card.color === color.value ? "is-selected" : ""}`} onClick={() => updateCard(index, "color", color.value)} aria-label={color.label} aria-pressed={card.color === color.value}>{card.color === color.value && <Check size={13} />}</button>)}</div></div></div>)}</div>
          <button type="button" className="setup-secondary setup-secondary--full" onClick={() => setCards((current) => [...current, emptyCard()])}><Plus size={15} /> Adicionar cartão</button>
          {error && <p className="setup-error" role="alert">{error}</p>}
          <div className="setup-actions"><button type="button" className="setup-back" onClick={back}><ArrowLeft size={15} /> Voltar</button><button className="setup-primary" type="submit">Entrar no meu espaço <Check size={16} /></button></div>
        </form>}
        <footer className="setup-footer"><ShieldCheck size={14} /> Seus dados ficam vinculados somente à sua conta.</footer>
      </section>
    </main>
  );
}
