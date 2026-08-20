"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarClock, Plus, Target, Wallet } from "lucide-react";
import { createGoal, upsertBudget } from "../../../../actions/finance";
import { formatBRL, type FinanceCategory } from "@/lib/financeData";

type Goal = { id: string; name: string; targetAmount: number; currentAmount: number; dueDate?: string };
type Budget = { id: string; month: string; categoryId: string; limitAmount: number };

type Snapshot = { goals?: Goal[]; budgets?: Budget[]; categories?: FinanceCategory[] };

export function PlanningDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot>({});
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/finance/snapshot").then((response) => response.ok ? response.json() : null).then((data) => {
      if (data) {
        setSnapshot(data);
        if (!budgetCategory && data.categories?.length) setBudgetCategory(data.categories.find((item: FinanceCategory) => item.type === "expense")?.id ?? "");
      }
    }).catch(() => setFeedback("Não foi possível carregar o planejamento."));
  }, [budgetCategory]);

  const expenseCategories = useMemo(() => (snapshot.categories ?? []).filter((item) => item.type === "expense"), [snapshot.categories]);

  const saveGoal = () => {
    startTransition(async () => {
      try {
        const created = await createGoal({ name: goalName, targetAmount: Number(goalTarget.replace(",", ".")), currentAmount: 0, color: "mint" });
        setSnapshot((current) => ({ ...current, goals: [...(current.goals ?? []), created as Goal] }));
        setGoalName(""); setGoalTarget(""); setFeedback("Meta criada.");
      } catch { setFeedback("Informe um nome e um valor válido para a meta."); }
    });
  };

  const saveBudget = () => {
    startTransition(async () => {
      try {
        const created = await upsertBudget({ month: budgetMonth, categoryId: budgetCategory, limitAmount: Number(budgetLimit.replace(",", ".")) });
        setSnapshot((current) => ({ ...current, budgets: [...(current.budgets ?? []).filter((item) => item.id !== created.id), created as Budget] }));
        setBudgetLimit(""); setFeedback("Orçamento salvo.");
      } catch { setFeedback("Informe categoria, mês e limite válidos para o orçamento."); }
    });
  };

  return <main className="planning-page"><header className="planning-heading"><div><p className="eyebrow">PLANEJAMENTO</p><h1>Metas e orçamento no mesmo ritmo.</h1><p>Crie objetivos e acompanhe limites por categoria com dados separados por usuário.</p></div><a className="soft-button" href="/">Voltar ao dashboard</a></header>
    {feedback && <p className="planning-feedback" role="status">{feedback}</p>}
    <section className="planning-grid">
      <article className="planning-card"><div className="planning-card__heading"><span className="planning-card__icon planning-card__icon--mint"><Target size={18} /></span><div><p className="eyebrow">OBJETIVOS</p><h2>Metas financeiras</h2></div></div><div className="planning-form"><label><span>Nome da meta</span><input value={goalName} onChange={(event) => setGoalName(event.target.value)} placeholder="Ex.: Reserva de emergência" /></label><label><span>Valor alvo</span><input inputMode="decimal" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} placeholder="R$ 10.000,00" /></label><button className="primary-button" type="button" onClick={saveGoal} disabled={busy}><Plus size={15} /> Criar meta</button></div><div className="planning-list">{(snapshot.goals ?? []).length === 0 ? <div className="planning-empty">Você ainda não criou uma meta.</div> : snapshot.goals?.map((goal) => { const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)); return <div className="planning-item" key={goal.id}><div><strong>{goal.name}</strong><small>{formatBRL(goal.currentAmount)} de {formatBRL(goal.targetAmount)}</small></div><b>{progress}%</b><div className="planning-progress"><span style={{ width: `${progress}%` }} /></div></div>; })}</div></article>
      <article className="planning-card"><div className="planning-card__heading"><span className="planning-card__icon planning-card__icon--blue"><Wallet size={18} /></span><div><p className="eyebrow">LIMITES</p><h2>Orçamento mensal</h2></div></div><div className="planning-form"><label><span>Mês</span><input type="month" value={budgetMonth} onChange={(event) => setBudgetMonth(event.target.value)} /></label><label><span>Categoria</span><select value={budgetCategory} onChange={(event) => setBudgetCategory(event.target.value)}><option value="">Selecione</option>{expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span>Limite</span><input inputMode="decimal" value={budgetLimit} onChange={(event) => setBudgetLimit(event.target.value)} placeholder="R$ 1.000,00" /></label><button className="primary-button" type="button" onClick={saveBudget} disabled={busy}><Plus size={15} /> Salvar limite</button></div><div className="planning-list">{(snapshot.budgets ?? []).length === 0 ? <div className="planning-empty">Nenhum limite configurado para este usuário.</div> : snapshot.budgets?.map((budget) => <div className="planning-item" key={budget.id}><div><strong>{expenseCategories.find((item) => item.id === budget.categoryId)?.name ?? budget.categoryId}</strong><small>{budget.month}</small></div><b>{formatBRL(budget.limitAmount)}</b><CalendarClock size={16} /></div>)}</div></article>
    </section>
  </main>;
}
