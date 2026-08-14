// MuFinance P2P: fluxo editorial e seguro para enviar ou cobrar amigos em uma sessão demonstrativa.
// O componente não movimenta dinheiro real; ele registra estados locais até existir backend autenticado.

import { ArrowDownLeft, ArrowUpRight, Check, Clock3, HandCoins, Search, Send, UserRound, UsersRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatBRL } from "@/lib/financeData";
import { ActionDialog } from "./ActionDialog";

export type P2PContact = {
  id: string;
  name: string;
  username: string;
  initials: string;
  tone: "mint" | "lavender" | "peach" | "blue";
};

export type P2PRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  contact: P2PContact;
  amount: number;
  description: string;
  dateLabel: string;
  status: "pending" | "accepted" | "rejected";
};

export type P2PActivity = {
  id: string;
  mode: "send" | "request";
  contact: P2PContact;
  amount: number;
  description: string;
  dateLabel: string;
  status: "completed" | "pending" | "rejected";
};

type P2PDialogProps = {
  open: boolean;
  contacts: P2PContact[];
  requests: P2PRequest[];
  activities: P2PActivity[];
  onClose: () => void;
  onSend: (contact: P2PContact, amount: number, description: string) => void;
  onRequest: (contact: P2PContact, amount: number, description: string) => void;
  onAccept: (request: P2PRequest) => void;
  onReject: (request: P2PRequest) => void;
};

type P2PMode = "send" | "request";

function parseBRL(value: string) {
  return Number(value.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
}

const toneClass: Record<P2PContact["tone"], string> = {
  mint: "p2p-avatar--mint",
  lavender: "p2p-avatar--lavender",
  peach: "p2p-avatar--peach",
  blue: "p2p-avatar--blue",
};

export function P2PDialog({ open, contacts, requests, activities, onClose, onSend, onRequest, onAccept, onReject }: P2PDialogProps) {
  const [mode, setMode] = useState<P2PMode>("send");
  const [query, setQuery] = useState("");
  const [searchReady, setSearchReady] = useState(false);
  const [selectedContact, setSelectedContact] = useState<P2PContact | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode("send");
    setQuery("");
    setSearchReady(false);
    setSelectedContact(null);
    setAmount("");
    setDescription("");
    setError("");
  }, [open]);

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const usernameFragment = normalizedQuery.startsWith("@") ? normalizedQuery.slice(1) : "";
    const isReadyToSearch = normalizedQuery.startsWith("@") && usernameFragment.length >= 3;
    if (!isReadyToSearch) {
      setSearchReady(false);
      return;
    }
    const timer = window.setTimeout(() => setSearchReady(true), 260);
    return () => window.clearTimeout(timer);
  }, [query]);

  const interactedContactIds = useMemo(() => new Set([...requests.map((request) => request.contact.id), ...activities.map((activity) => activity.contact.id)]), [activities, requests]);

  const searchResults = useMemo(() => {
    if (!searchReady) return [];
    const normalized = query.trim().toLowerCase().slice(1);
    return contacts.filter((contact) => interactedContactIds.has(contact.id) && (contact.username.toLowerCase().includes(normalized) || contact.name.toLowerCase().toLowerCase().includes(normalized))).slice(0, 5);
  }, [contacts, interactedContactIds, query, searchReady]);

  const pendingRequests = requests.filter((request) => request.status === "pending");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = parseBRL(amount);
    if (!selectedContact) {
      setError("Escolha um contato para continuar.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    setError("");
    if (mode === "send") onSend(selectedContact, parsedAmount, description.trim() || "Transferência entre amigos");
    else onRequest(selectedContact, parsedAmount, description.trim() || "Cobrança entre amigos");
  };

  return (
    <ActionDialog open={open} onClose={onClose} eyebrow="COMPARTILHAMENTO P2P" title="Enviar ou cobrar um amigo" description="Use um @usuário para registrar a movimentação na sua rede MuFinance." icon={<UsersRound size={17} />} labelledBy="p2p-dialog-title">
      <div className="p2p-notice"><ShieldIcon /><span>Fluxo demonstrativo local. Nenhum pagamento bancário real é realizado.</span></div>
      <div className="p2p-mode-toggle" role="tablist" aria-label="Tipo de compartilhamento">
        <button type="button" role="tab" aria-selected={mode === "send"} className={mode === "send" ? "is-active" : ""} onClick={() => { setMode("send"); setError(""); }}><Send size={14} /> Enviar dinheiro</button>
        <button type="button" role="tab" aria-selected={mode === "request"} className={mode === "request" ? "is-active" : ""} onClick={() => { setMode("request"); setError(""); }}><HandCoins size={14} /> Cobrar amigo</button>
      </div>

      <form className="p2p-form" onSubmit={submit}>
        <label className="form-field form-field--wide"><span>{mode === "send" ? "Para quem você quer enviar?" : "De quem você quer cobrar?"}</span><div className="input-shell"><Search size={15} /><input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setSelectedContact(null); setError(""); }} placeholder="Digite @usuario ou nome" aria-label="Buscar contato P2P" /></div></label>
        {query.trim() && !selectedContact && <div className="p2p-search-results" aria-live="polite">{!query.trim().startsWith("@") ? <span className="p2p-search-state">Comece com @ para buscar um usuário.</span> : query.trim().slice(1).length < 3 ? <span className="p2p-search-state">Digite pelo menos 3 caracteres após @.</span> : !searchReady ? <span className="p2p-search-state"><Clock3 size={14} /> Buscando contatos…</span> : searchResults.length ? searchResults.map((contact) => <button type="button" className="p2p-contact-row" key={contact.id} onClick={() => { setSelectedContact(contact); setQuery(contact.username); setSearchReady(false); }}><span className={`p2p-avatar ${toneClass[contact.tone]}`}>{contact.initials}</span><span><strong>{contact.name}</strong><small>{contact.username}</small></span><ArrowUpRight size={14} /></button>) : <span className="p2p-search-state">Nenhum contato com histórico encontrado para esse usuário.</span>}</div>}
        {selectedContact && <div className="p2p-selected-contact"><span className={`p2p-avatar ${toneClass[selectedContact.tone]}`}>{selectedContact.initials}</span><span><strong>{selectedContact.name}</strong><small>{selectedContact.username}</small></span><button type="button" onClick={() => { setSelectedContact(null); setQuery(""); }} aria-label="Remover contato selecionado"><X size={14} /></button></div>}
        <div className="p2p-fields-row"><label className="form-field"><span>Valor</span><div className="amount-shell"><b>R$</b><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></div></label><label className="form-field"><span>Descrição</span><div className="input-shell"><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder={mode === "send" ? "Ex.: jantar" : "Ex.: metade da conta"} /></div></label></div>
        {error && <p className="form-error">{error}</p>}
        <div className="p2p-form-actions"><button className="soft-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit">{mode === "send" ? <><Send size={14} /> Enviar agora</> : <><HandCoins size={14} /> Enviar cobrança</>}</button></div>
      </form>

      {pendingRequests.length > 0 && <section className="p2p-requests"><div className="p2p-section-heading"><div><p className="eyebrow">PENDÊNCIAS</p><h3>Solicitações para revisar</h3></div><span>{pendingRequests.length}</span></div>{pendingRequests.map((request) => <div className="p2p-request-card" key={request.id}><span className={`p2p-avatar ${toneClass[request.contact.tone]}`}>{request.contact.initials}</span><div className="p2p-request-copy"><strong>{request.direction === "incoming" ? `${request.contact.name} está cobrando você` : `Cobrança enviada para ${request.contact.name}`}</strong><small>{request.description} · {request.dateLabel}</small></div><strong className="p2p-request-amount">{formatBRL(request.amount)}</strong>{request.direction === "incoming" && <div className="p2p-request-actions"><button className="p2p-accept-button" type="button" onClick={() => onAccept(request)}><Check size={13} /> Aceitar</button><button className="p2p-reject-button" type="button" onClick={() => onReject(request)}><X size={13} /> Recusar</button></div>}</div>)}</section>}

      <section className="p2p-activity"><div className="p2p-section-heading"><div><p className="eyebrow">ATIVIDADE RECENTE</p><h3>Seu histórico P2P</h3></div><span>{activities.length}</span></div>{activities.length ? <div className="p2p-activity-list">{activities.slice(0, 4).map((activity) => <div className="p2p-activity-row" key={activity.id}><span className={`p2p-activity-icon p2p-activity-icon--${activity.mode}`} >{activity.mode === "send" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}</span><span><strong>{activity.mode === "send" ? `Enviado para ${activity.contact.name}` : `Cobrança para ${activity.contact.name}`}</strong><small>{activity.description} · {activity.dateLabel}</small></span><span className={`p2p-activity-status p2p-activity-status--${activity.status}`}>{activity.status === "completed" ? "Concluído" : activity.status === "rejected" ? "Recusado" : "Pendente"}<b>{formatBRL(activity.amount)}</b></span></div>)}</div> : <div className="p2p-empty"><UserRound size={17} /><span>As movimentações entre amigos aparecerão aqui.</span></div>}</section>
    </ActionDialog>
  );
}

function ShieldIcon() {
  return <span className="p2p-notice-icon"><Check size={13} /></span>;
}
