// MuFinance — central de configurações editorial; categorias são tratadas como parte essencial da carteira.
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Bell, Bike, CarFront, Check, ChevronRight, CreditCard, Eye, FolderOpen, Landmark, Pencil, Plus, RotateCcw, Settings2, ShieldAlert, Trash2, Wallet, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { FinanceCategory, VehicleType } from "@/lib/financeData";
import { ActionDialog } from "./ActionDialog";

type SettingsSection = "overview" | "categories" | "wallets" | "preferences";
type CategoryType = FinanceCategory["type"];
type CategoryTone = FinanceCategory["tone"];
type DangerAction = "reset" | "clear-history" | "remove-duplicates";

type SettingsPanelProps = {
  open: boolean;
  categories: FinanceCategory[];
  accountCount: number;
  cardCount: number;
  compactMode: boolean;
  alertsEnabled: boolean;
  onClose: () => void;
  onCreateCategory: (name: string, type: CategoryType, tone: CategoryTone) => void;
  onUpdateCategory: (id: string, name: string, tone: CategoryTone) => void;
  onToggleCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onCompactMode: () => void;
  onAlerts: () => void;
  onOpenAccounts: () => void;
  onOpenCards: () => void;
  onOpenVehicle: () => void;
  vehicleType: VehicleType;
  onDangerAction: (action: DangerAction) => void;
};

const toneOptions: Array<{ value: CategoryTone; label: string }> = [
  { value: "mint", label: "Verde" },
  { value: "blue", label: "Azul" },
  { value: "lavender", label: "Lavanda" },
  { value: "peach", label: "Pêssego" },
  { value: "coral", label: "Coral" },
];

function categoryIcon(type: CategoryType) {
  return type === "income" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />;
}

function TonePicker({ value, onChange }: { value: CategoryTone; onChange: (value: CategoryTone) => void }) {
  return <div className="tone-picker">{toneOptions.map((tone) => <button type="button" key={tone.value} className={`tone-option tone-option--${tone.value} ${value === tone.value ? "is-selected" : ""}`} onClick={() => onChange(tone.value)} aria-label={tone.label} aria-pressed={value === tone.value} />)}</div>;
}

function CategoryEditor({ type, name, tone, editing, onName, onTone, onCancel, onSave }: { type: CategoryType; name: string; tone: CategoryTone; editing: boolean; onName: (value: string) => void; onTone: (value: CategoryTone) => void; onCancel: () => void; onSave: () => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave(); };
  return <motion.form className={`category-editor ${editing ? "category-editor--editing" : "category-editor--new"}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submit}><div className="category-editor-title"><span className="category-color category-color--mint">{editing ? <Pencil size={15} /> : <Plus size={15} />}</span><div><strong>{editing ? "Editar categoria" : `Nova categoria de ${type === "expense" ? "despesa" : "receita"}`}</strong><small>{editing ? "Altere o nome ou a cor sem perder o histórico." : "Ela aparecerá no modal de lançamento."}</small></div></div><label className="form-field"><span>Nome</span><div className="input-shell"><FolderOpen size={15} /><input autoFocus value={name} onChange={(event) => onName(event.target.value)} placeholder={type === "expense" ? "Ex.: Saúde" : "Ex.: Dividendos"} /></div></label><label className="form-field"><span>Cor de identificação</span><TonePicker value={tone} onChange={onTone} /></label><div className="category-editor-actions"><button className="soft-button" type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit" disabled={!name.trim()}><Check size={14} /> {editing ? "Salvar" : "Criar categoria"}</button></div></motion.form>;
}

function CategoryList({ categories, editingId, editingName, editingTone, onEdit, onName, onTone, onCancelEdit, onSaveEdit, onToggle, onDelete }: { categories: FinanceCategory[]; editingId: string | null; editingName: string; editingTone: CategoryTone; onEdit: (category: FinanceCategory) => void; onName: (value: string) => void; onTone: (value: CategoryTone) => void; onCancelEdit: () => void; onSaveEdit: () => void; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return <div className="category-list" aria-live="polite">{categories.map((category) => editingId === category.id ? <CategoryEditor key={category.id} type={category.type} name={editingName} tone={editingTone} editing onName={onName} onTone={onTone} onCancel={onCancelEdit} onSave={onSaveEdit} /> : <motion.div className={`category-row ${category.active ? "" : "is-inactive"}`} key={category.id} layout><span className={`category-color category-color--${category.tone}`}>{categoryIcon(category.type)}</span><span className="category-row-info"><strong>{category.name}</strong><small>{category.usage ? `${category.usage} lançamento${category.usage === 1 ? "" : "s"} no histórico` : "Ainda sem lançamentos"}</small></span><span className={`status-pill ${category.active ? "status-pill--on" : ""}`}>{category.active ? "Ativa" : "Desativada"}</span><div className="category-row-actions"><button className="icon-button" type="button" onClick={() => onEdit(category)} aria-label={`Editar ${category.name}`}><Pencil size={14} /></button><button className="icon-button" type="button" onClick={() => onToggle(category.id)} aria-label={`${category.active ? "Desativar" : "Ativar"} ${category.name}`}><Eye size={14} /></button><button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(category.id)} aria-label={`Excluir ${category.name}`}><Trash2 size={14} /></button></div></motion.div>)}</div>;
}

function SettingsOverview({ activeCount, expenseCount, incomeCount, accountCount, cardCount, vehicleType, onCategories, onWallets, onCards, onVehicle }: { activeCount: number; expenseCount: number; incomeCount: number; accountCount: number; cardCount: number; vehicleType: VehicleType; onCategories: () => void; onWallets: () => void; onCards: () => void; onVehicle: () => void }) {
  const VehicleIcon = vehicleType === "motorcycle" ? Bike : CarFront;
  return <motion.div className="settings-section" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}><div className="settings-section-heading"><div><p className="eyebrow">MAPA DA CARTEIRA</p><h3>Organize o MuFinance do seu jeito</h3><p>Encontre rapidamente contas, cartões, categorias e preferências que sustentam o seu dia a dia.</p></div></div><div className="settings-overview-grid"><button className="settings-overview-card settings-overview-card--mint" onClick={onCategories}><span><FolderOpen size={18} /></span><strong>{activeCount} categorias ativas</strong><small>{expenseCount} de despesas · {incomeCount} de receitas</small><ChevronRight size={15} /></button><button className="settings-overview-card settings-overview-card--blue" onClick={onWallets}><span><Landmark size={18} /></span><strong>{accountCount} contas conectadas</strong><small>Contas bancárias e reservas locais</small><ChevronRight size={15} /></button><button className="settings-overview-card settings-overview-card--lavender" onClick={onCards}><span><CreditCard size={18} /></span><strong>{cardCount} cartões acompanhados</strong><small>Faturas, limites e lançamentos</small><ChevronRight size={15} /></button><button className="settings-overview-card settings-overview-card--peach" onClick={onVehicle}><span><VehicleIcon size={18} /></span><strong>Módulo veículo</strong><small>Abastecimento e manutenção</small><ChevronRight size={15} /></button></div><div className="settings-callout"><Bell size={17} /><div><strong>Uma carteira mais clara começa por categorias consistentes.</strong><p>Use nomes que você reconhece no extrato e desative o que não faz mais sentido, sem apagar o histórico.</p></div><button className="primary-button primary-button--small" onClick={onCategories}><FolderOpen size={14} /> Gerenciar categorias</button></div></motion.div>;
}

function SettingsWallets({ accountCount, cardCount, vehicleType, onAccounts, onCards, onVehicle }: { accountCount: number; cardCount: number; vehicleType: VehicleType; onAccounts: () => void; onCards: () => void; onVehicle: () => void }) {
  const VehicleIcon = vehicleType === "motorcycle" ? Bike : CarFront;
  return <motion.div className="settings-section" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}><div className="settings-section-heading"><div><p className="eyebrow">CARTEIRAS</p><h3>Contas bancárias e cartões</h3><p>O MuFinance separa as fontes de dinheiro para que cada saldo possa ser acompanhado com clareza.</p></div></div><div className="settings-resource-list"><button onClick={onAccounts}><span className="settings-resource-icon settings-resource-icon--blue"><Landmark size={17} /></span><span><strong>Contas bancárias</strong><small>{accountCount} contas locais com saldo e número mascarado.</small></span><ChevronRight size={16} /></button><button onClick={onCards}><span className="settings-resource-icon settings-resource-icon--lavender"><CreditCard size={17} /></span><span><strong>Cartões de crédito</strong><small>{cardCount} cartões com fatura, limite e histórico.</small></span><ChevronRight size={16} /></button><button onClick={onVehicle}><span className="settings-resource-icon settings-resource-icon--peach"><VehicleIcon size={17} /></span><span><strong>Veículo</strong><small>Controle de abastecimento, manutenção e quilometragem.</small></span><ChevronRight size={16} /></button></div><div className="settings-callout settings-callout--subtle"><Wallet size={17} /><div><strong>Sem conexão bancária nesta demonstração</strong><p>As contas e cartões exibidos são locais e não movimentam dinheiro real.</p></div></div></motion.div>;
}

function SettingsPreferences({ compactMode, alertsEnabled, onCompactMode, onAlerts }: { compactMode: boolean; alertsEnabled: boolean; onCompactMode: () => void; onAlerts: () => void }) {
  return <motion.div className="settings-section" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}><div className="settings-section-heading"><div><p className="eyebrow">EXPERIÊNCIA</p><h3>Preferências da sessão</h3><p>Ajuste a densidade e os alertas do dashboard sem sair desta central.</p></div></div><div className="settings-preference-list"><button onClick={onCompactMode}><span className="settings-preference-icon"><Eye size={16} /></span><span><strong>Modo compacto</strong><small>Reduz o espaçamento entre módulos e tabelas.</small></span><span className={`status-pill ${compactMode ? "status-pill--on" : ""}`}>{compactMode ? "Ligado" : "Desligado"}</span><ChevronRight size={15} /></button><button onClick={onAlerts}><span className="settings-preference-icon"><Bell size={16} /></span><span><strong>Alertas prioritários</strong><small>Orçamentos acima do limite e faturas próximas.</small></span><span className={`status-pill ${alertsEnabled ? "status-pill--on" : ""}`}>{alertsEnabled ? "Ligados" : "Desligados"}</span><ChevronRight size={15} /></button></div></motion.div>;
}

export function SettingsPanel({ open, categories, accountCount, cardCount, compactMode, alertsEnabled, onClose, onCreateCategory, onUpdateCategory, onToggleCategory, onDeleteCategory, onCompactMode, onAlerts, onOpenAccounts, onOpenCards, onOpenVehicle, vehicleType, onDangerAction }: SettingsPanelProps) {
  const [section, setSection] = useState<SettingsSection>("categories");
  const [categoryType, setCategoryType] = useState<CategoryType>("expense");
  const [showCreate, setShowCreate] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftTone, setDraftTone] = useState<CategoryTone>("mint");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingTone, setEditingTone] = useState<CategoryTone>("mint");
  const [pendingDanger, setPendingDanger] = useState<DangerAction | null>(null);
  const activeCount = categories.filter((item) => item.active).length;
  const expenseCount = categories.filter((item) => item.type === "expense").length;
  const incomeCount = categories.filter((item) => item.type === "income").length;
  const groupedCategories = useMemo(() => categories.filter((item) => item.type === categoryType), [categories, categoryType]);
  const dangerLabel: Record<DangerAction, string> = { reset: "Restaurar dados demonstrativos", "clear-history": "Limpar histórico de transações", "remove-duplicates": "Remover lançamentos duplicados" };

  const selectSection = (next: SettingsSection) => { setSection(next); setShowCreate(false); setEditingId(null); setPendingDanger(null); };
  const createCategory = () => { const name = draftName.trim(); if (!name) return; onCreateCategory(name, categoryType, draftTone); setDraftName(""); setDraftTone("mint"); setShowCreate(false); };
  const startEdit = (category: FinanceCategory) => { setEditingId(category.id); setEditingName(category.name); setEditingTone(category.tone); setShowCreate(false); };
  const saveEdit = () => { if (!editingId || !editingName.trim()) return; onUpdateCategory(editingId, editingName.trim(), editingTone); setEditingId(null); setEditingName(""); };

  const content = <div className="settings-workspace"><aside className="settings-rail" aria-label="Seções de configurações"><p className="settings-rail-label">ORGANIZAÇÃO</p><button className={section === "overview" ? "is-active" : ""} onClick={() => selectSection("overview")}><Settings2 size={15} /><span>Visão geral</span><ChevronRight size={14} /></button><button className={section === "categories" ? "is-active" : ""} onClick={() => selectSection("categories")}><FolderOpen size={15} /><span>Categorias</span><em>{activeCount}</em></button><button className={section === "wallets" ? "is-active" : ""} onClick={() => selectSection("wallets")}><Wallet size={15} /><span>Carteiras</span><ChevronRight size={14} /></button><p className="settings-rail-label settings-rail-label--spaced">PREFERÊNCIAS</p><button className={section === "preferences" ? "is-active" : ""} onClick={() => selectSection("preferences")}><Eye size={15} /><span>Experiência</span><ChevronRight size={14} /></button><div className="settings-rail-note"><ShieldAlert size={14} /><span>Os dados desta versão ficam somente nesta sessão.</span></div></aside><div className="settings-main">
    {section === "overview" && <SettingsOverview activeCount={activeCount} expenseCount={expenseCount} incomeCount={incomeCount} accountCount={accountCount} cardCount={cardCount} vehicleType={vehicleType} onCategories={() => selectSection("categories")} onWallets={() => selectSection("wallets")} onCards={onOpenCards} onVehicle={onOpenVehicle} />}
    {section === "categories" && <motion.div className="settings-section" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}><div className="settings-section-heading settings-section-heading--row"><div><p className="eyebrow">CATEGORIAS</p><h3>Receitas e despesas</h3><p>Crie uma taxonomia que faça sentido no seu extrato. Categorias desativadas não aparecem em novos lançamentos.</p></div><button className="primary-button primary-button--small" onClick={() => { setShowCreate((value) => !value); setEditingId(null); }}><Plus size={14} /> Nova categoria</button></div><div className="settings-category-toolbar"><div className="settings-type-tabs" role="tablist" aria-label="Tipo de categoria"><button className={categoryType === "expense" ? "is-active is-expense" : ""} onClick={() => setCategoryType("expense")} role="tab" aria-selected={categoryType === "expense"}><ArrowUpRight size={14} /> Despesas <em>{expenseCount}</em></button><button className={categoryType === "income" ? "is-active is-income" : ""} onClick={() => setCategoryType("income")} role="tab" aria-selected={categoryType === "income"}><ArrowDownLeft size={14} /> Receitas <em>{incomeCount}</em></button></div><span className="settings-category-hint">{groupedCategories.filter((item) => item.active).length} ativas nesta lista</span></div><AnimatePresence>{showCreate && <CategoryEditor type={categoryType} name={draftName} tone={draftTone} editing={false} onName={setDraftName} onTone={setDraftTone} onCancel={() => setShowCreate(false)} onSave={createCategory} />}</AnimatePresence><CategoryList categories={groupedCategories} editingId={editingId} editingName={editingName} editingTone={editingTone} onEdit={startEdit} onName={setEditingName} onTone={setEditingTone} onCancelEdit={() => setEditingId(null)} onSaveEdit={saveEdit} onToggle={onToggleCategory} onDelete={onDeleteCategory} />{groupedCategories.length === 0 && <div className="settings-empty"><FolderOpen size={18} /><strong>Nenhuma categoria nesta seção</strong><span>Crie a primeira categoria para começar a organizar seus lançamentos.</span></div>}<div className="settings-category-footnote"><ShieldAlert size={14} /><span>Desativar preserva o histórico. A exclusão só é permitida quando não há lançamentos vinculados.</span></div></motion.div>}
    {section === "wallets" && <SettingsWallets accountCount={accountCount} cardCount={cardCount} vehicleType={vehicleType} onAccounts={onOpenAccounts} onCards={onOpenCards} onVehicle={onOpenVehicle} />}
    {section === "preferences" && <SettingsPreferences compactMode={compactMode} alertsEnabled={alertsEnabled} onCompactMode={onCompactMode} onAlerts={onAlerts} />}
    <div className="settings-danger-zone"><div><span className="settings-danger-icon"><ShieldAlert size={17} /></span><div><p className="eyebrow">ZONA DE PERIGO</p><strong>Operações irreversíveis nesta sessão</strong><small>Use com cuidado. Nenhuma dessas ações atinge dados bancários reais.</small></div></div><div className="settings-danger-actions">{pendingDanger ? <div className="settings-confirm"><span>Confirmar “{dangerLabel[pendingDanger]}”?</span><button className="soft-button" onClick={() => setPendingDanger(null)}>Cancelar</button><button className="danger-button" onClick={() => { onDangerAction(pendingDanger); setPendingDanger(null); }}>Confirmar</button></div> : <><button onClick={() => setPendingDanger("remove-duplicates")}><RotateCcw size={14} /> Remover duplicados</button><button onClick={() => setPendingDanger("clear-history")}><Trash2 size={14} /> Limpar histórico</button><button onClick={() => setPendingDanger("reset")}><X size={14} /> Restaurar sessão</button></>}</div></div>
  </div></div>;
  return <ActionDialog open={open} onClose={onClose} eyebrow="CENTRAL DE CONTROLE" title="Configurações" description="Organize categorias, carteiras e preferências da sua experiência MuFinance." icon={<Settings2 size={17} />} footer={<button className="primary-button" type="button" onClick={onClose}>Concluir</button>}>{content}</ActionDialog>;
}

export type { DangerAction };
