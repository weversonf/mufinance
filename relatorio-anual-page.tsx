'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function RelatorioAnual() {
  const [dadosAnuais, setDadosAnuais] = useState<any[]>([]);
  const [anoAtual] = useState(new Date().getFullYear());

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
    
    return onSnapshot(q, (snapshot) => {
      const meses = Array(12).fill(0).map((_, i) => ({
        mes: i,
        nome: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }),
        receitas: 0,
        despesas: 0
      }));

      snapshot.forEach((doc) => {
        const d = doc.data();
        const dataTransacao = d.date?.toDate();
        if (dataTransacao && dataTransacao.getFullYear() === anoAtual) {
          const mesIndex = dataTransacao.getMonth();
          if (d.tipo === 'receita') meses[mesIndex].receitas += d.valor;
          else meses[mesIndex].despesas += d.valor;
        }
      });
      setDadosAnuais(meses);
    });
  }, [anoAtual]);

  const totalAnoReceita = dadosAnuais.reduce((acc, m) => acc + m.receitas, 0);
  const totalAnoDespesa = dadosAnuais.reduce((acc, m) => acc + m.despesas, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-ubuntu">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-slate-900 rounded-lg"><ChevronLeft /></Link>
        <h1 className="text-xl font-bold uppercase tracking-tighter">Performance {anoAtual}</h1>
      </div>

      {/* Resumo do Ano */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
          <TrendingUp className="text-emerald-400 mb-2" size={20} />
          <p className="text-[10px] uppercase font-bold text-emerald-500/60">Ganhos Anuais</p>
          <p className="text-lg font-bold">R$ {totalAnoReceita.toLocaleString()}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-right">
          <TrendingDown className="text-rose-400 mb-2 ml-auto" size={20} />
          <p className="text-[10px] uppercase font-bold text-rose-500/60">Gastos Anuais</p>
          <p className="text-lg font-bold">R$ {totalAnoDespesa.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabela de Meses */}
      <div className="bg-slate-900/40 rounded-[2rem] border border-slate-800/50 overflow-hidden">
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-2">
          <BarChart3 size={18} className="text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest">Fechamento Mensal</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {dadosAnuais.map((m) => (
            <div key={m.mes} className="p-4 flex justify-between items-center hover:bg-slate-800/20 transition-colors">
              <span className="text-sm font-bold capitalize text-slate-400">{m.nome}</span>
              <div className="text-right">
                <p className="text-[11px] font-bold text-emerald-400">+{m.receitas.toLocaleString()}</p>
                <p className="text-[11px] font-bold text-rose-400">-{m.despesas.toLocaleString()}</p>
                <p className={`text-xs font-black mt-1 ${m.receitas - m.despesas >= 0 ? 'text-sky-400' : 'text-orange-500'}`}>
                  Saldo: R$ {(m.receitas - m.despesas).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}