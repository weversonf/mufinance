'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine 
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function RelatorioAnual() {
  const [dadosAnuais, setDadosAnuais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentMonthIndex = new Date().getMonth();

  const mesesNomes = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        
        onSnapshot(q, (snapshot) => {
          const transacoes = snapshot.docs.map(doc => doc.data());
          
          // Inicializa a estrutura dos 12 meses
          const mesesBase = mesesNomes.map((nome) => ({
            nome,
            receitas: 0,
            despesas: 0,
          }));

          // 1. Distribui os valores mês a mês (Não acumulativo)
          transacoes.forEach((t: any) => {
            const data = t.date?.toDate();
            // Filtra apenas transações do ano atual
            if (data && data.getFullYear() === new Date().getFullYear()) {
              const mesIndex = data.getMonth();
              const valor = Number(t.valor || 0);

              if (t.tipo === 'receita') {
                mesesBase[mesIndex].receitas += valor;
              } else {
                mesesBase[mesIndex].despesas += valor;
              }
            }
          });

          // 2. Calcula o Saldo Acumulado Progressivo
          let saldoCorrente = 0;
          const dadosFinais = mesesBase.map(mes => {
            const saldoDoMes = mes.receitas - mes.despesas;
            saldoCorrente += saldoDoMes;
            return {
              ...mes,
              saldoMensal: saldoDoMes,
              acumulado: saldoCorrente
            };
          });

          setDadosAnuais(dadosFinais);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">PROCESSANDO FLUXO ANUAL...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-sky-500 transition-all group">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
          </Link>
          <div className="text-right">
            <h1 className="text-2xl font-black italic tracking-tighter">MUCURIPE ANALYTICS</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Projeção {new Date().getFullYear()}</p>
          </div>
        </header>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-emerald-500">
              <TrendingUp size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Receitas do Ano</span>
            </div>
            <h3 className="text-3xl font-bold">
              R$ {dadosAnuais.reduce((acc, curr) => acc + curr.receitas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-rose-500">
              <TrendingDown size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Despesas do Ano</span>
            </div>
            <h3 className="text-3xl font-bold">
              R$ {dadosAnuais.reduce((acc, curr) => acc + curr.despesas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>

          <div className="bg-sky-600 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-20 transform rotate-12">
              <Wallet size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Calendar size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Previsão Dezembro</span>
              </div>
              <h3 className="text-3xl font-bold">
                R$ {dadosAnuais[11]?.acumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* GRÁFICO 1: RECEITAS E DESPESAS (MÊS A MÊS) */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm mb-10">
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Movimentação Mensal</h3>
            <p className="text-[10px] text-slate-400 uppercase mt-1">Valores brutos por mês (não acumulativos)</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosAnuais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.05} />
                <XAxis 
                  dataKey="nome" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(226, 232, 240, 0.2)'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="receitas" fill="#10b981" radius={[6, 6, 0, 0]} name="Receitas" barSize={25} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Despesas" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: EVOLUÇÃO DO SALDO (ACUMULATIVO) */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Evolução do Patrimônio</h3>
            <p className="text-[10px] text-slate-400 uppercase mt-1">Saldo final projetado mês a mês</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosAnuais} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.05} />
                <XAxis 
                  dataKey="nome" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0ea5e9', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="acumulado" 
                  stroke="#0ea5e9" 
                  strokeWidth={6} 
                  dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                  name="Saldo Acumulado" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
