"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL, type Transaction } from "@/lib/financeData";

type Snapshot = { transactions?: Array<Transaction & { date?: string }>; accounts?: unknown[] };
const chartColors = ["#63bca9", "#7892d2", "#d9966e", "#9a8ed2", "#6aa7c8", "#7e909b"];

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ReportsDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/finance/snapshot")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os dados.");
        return response.json() as Promise<Snapshot>;
      })
      .then((data) => { if (active) setSnapshot(data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar os relatórios."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const transactions = snapshot?.transactions ?? [];
  const monthlyFlow = useMemo(() => {
    const totals = new Map<string, { month: string; income: number; expenses: number }>();
    transactions.forEach((item) => {
      const date = parseDate(item.dateISO ?? item.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = totals.get(key) ?? { month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), income: 0, expenses: 0 };
      if (item.type === "income") current.income += item.amount;
      if (item.type === "expense") current.expenses += item.amount;
      totals.set(key, current);
    });
    return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, value]) => ({ ...value, net: value.income - value.expenses }));
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.filter((item) => item.type === "expense").forEach((item) => totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount));
    return [...totals.entries()].sort(([, a], [, b]) => b - a).map(([name, value], index) => ({ name, value, color: chartColors[index % chartColors.length] }));
  }, [transactions]);

  const totals = useMemo(() => transactions.reduce((result, item) => {
    if (item.type === "income") result.income += item.amount;
    if (item.type === "expense") result.expenses += item.amount;
    return result;
  }, { income: 0, expenses: 0 }), [transactions]);

  return (
    <main className="reports-page">
      <header className="reports-heading"><div><p className="eyebrow">ANÁLISE FINANCEIRA</p><h1>Relatórios que ajudam você a decidir.</h1><p>Os gráficos abaixo usam somente seus lançamentos sincronizados. Sem movimentações, mostramos um estado vazio em vez de dados fictícios.</p></div><a className="soft-button" href="/">Voltar ao dashboard</a></header>
      {loading && <div className="reports-empty">Carregando seus dados…</div>}
      {!loading && error && <div className="reports-empty reports-empty--error">{error}</div>}
      {!loading && !error && transactions.length === 0 && <div className="reports-empty"><strong>Sem lançamentos para analisar.</strong><span>Adicione uma receita ou despesa no dashboard para começar a visualizar seus relatórios.</span></div>}
      {!loading && !error && transactions.length > 0 && (
        <>
          <section className="reports-kpis"><article><span>Receitas acumuladas</span><strong className="income-text">{formatBRL(totals.income)}</strong></article><article><span>Despesas acumuladas</span><strong className="expense-text">{formatBRL(totals.expenses)}</strong></article><article><span>Resultado líquido</span><strong>{formatBRL(totals.income - totals.expenses)}</strong></article></section>
          <section className="reports-grid">
            <article className="reports-card reports-card--wide"><div className="reports-card__heading"><div><span>Fluxo mensal</span><strong>Receitas vs. despesas</strong></div></div><div className="reports-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyFlow}><CartesianGrid strokeDasharray="3 3" stroke="#edf1f3" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#82919c", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#82919c", fontSize: 11 }} tickFormatter={(value) => `R$${Math.round(Number(value) / 1000)}K`} /><Tooltip formatter={(value) => formatBRL(Number(value))} /><Area type="monotone" dataKey="income" name="Receitas" stroke="#63bca9" fill="#63bca9" fillOpacity={0.14} strokeWidth={2} /><Area type="monotone" dataKey="expenses" name="Despesas" stroke="#d9966e" fill="#d9966e" fillOpacity={0.12} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></article>
            <article className="reports-card"><div className="reports-card__heading"><div><span>Distribuição</span><strong>Gastos por categoria</strong></div></div><div className="reports-chart reports-chart--donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryTotals} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="78%" paddingAngle={3}>{categoryTotals.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => formatBRL(Number(value))} /></PieChart></ResponsiveContainer></div><div className="reports-legend">{categoryTotals.slice(0, 6).map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{formatBRL(item.value)}</b></span>)}</div></article>
            <article className="reports-card reports-card--wide"><div className="reports-card__heading"><div><span>Comparativo</span><strong>Resultado líquido por mês</strong></div></div><div className="reports-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyFlow}><CartesianGrid strokeDasharray="3 3" stroke="#edf1f3" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#82919c", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#82919c", fontSize: 11 }} tickFormatter={(value) => `R$${Math.round(Number(value) / 1000)}K`} /><Tooltip formatter={(value) => formatBRL(Number(value))} /><Bar dataKey="net" name="Resultado líquido" fill="#7892d2" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
          </section>
        </>
      )}
    </main>
  );
}
