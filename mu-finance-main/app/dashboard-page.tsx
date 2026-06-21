'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection, query, where, onSnapshot, addDoc,
  Timestamp, orderBy, limit
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  LogOut, CircleDollarSign, ReceiptText,
  Eye, EyeOff, Plus,
  Check, Clock, ArrowUpCircle, ArrowDownCircle,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'value' | 'hidden'>('value');

  const [valorGasto, setValorGasto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [tipoLancamento, setTipoLancamento] = useState<'despesa' | 'receita'>('despesa');

  const hoje = new Date().toISOString().split('T')[0];
  const [dataLancamento, setDataLancamento] = useState(hoje);
  const [dataVencimento, setDataVencimento] = useState(hoje);
  const [isRealizada, setIsRealizada] = useState(true);

  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [transacoes, setTransacoes] = useState<any[]>([]);

  const router = useRouter();
  const categorias = ['Combustível', 'Comida', 'Compras', 'Fixo', 'Outros'];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return router.push('/');

      const qTrans = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(10)
      );

      const unsubSnap = onSnapshot(qTrans, (snapshot) => {
        let rec = 0;
        let des = 0;
        let lista: any[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const v = Number(data.valor || 0);

          if (data.status === 'realizado') {
            if (data.tipo === 'receita') rec += v;
            else des += v;
          }

          lista.push({ id: doc.id, ...data });
        });

        setTotalReceitas(rec);
        setTotalDespesas(des);
        setTransacoes(lista);
        setLoading(false);
      });

      return () => unsubSnap();
    });

    return () => unsubscribeAuth();
  }, [router]);

  const formatDisplay = (valor: number) => {
    if (displayMode === 'hidden') return '••••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center font-bold animate-pulse">CARREGANDO...</div>;

  return (
    <div className="antialiased pb-40 p-4 md:p-8 bg-slate-50 dark:bg-[#020617] min-h-screen text-slate-900 dark:text-white">
      
      <header className="flex justify-between items-center mb-10 bg-white dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex gap-2">
          <Link href="/relatorio-anual" className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-orange-500"><BarChart3 size={20} /></Link>
          <Link href="/extrato" className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><ReceiptText size={20} /></Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDisplayMode(displayMode === 'value' ? 'hidden' : 'value')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
            {displayMode === 'value' ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <ThemeToggle />
          <button onClick={() => signOut(auth)} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-rose-500"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] text-white dark:text-slate-950 shadow-2xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Saldo em Caixa</p>
          <h2 className="text-4xl font-black">{formatDisplay(totalReceitas - totalDespesas)}</h2>
          <CircleDollarSign size={80} className="absolute -right-4 -bottom-4 opacity-5" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {transacoes.map((t) => (
          <div key={t.id} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <p className="font-bold text-sm">{t.descricao}</p>
              <p className="text-xs text-slate-500">
                Venc: {t.date instanceof Timestamp ? t.date.toDate().toLocaleDateString('pt-BR') : '--'}
              </p>
            </div>
            <p className={`font-black ${t.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {t.tipo === 'receita' ? '+' : '-'}{formatDisplay(t.valor)}
            </p>
          </div>
        ))}
      </div>

      {/* Modal e botão continuam iguais, só corrigido no salvamento */}

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 bg-sky-600 text-white w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center">
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const valor = Number(valorGasto);
              if (!valor || valor <= 0) return;

              await addDoc(collection(db, 'transactions'), {
                userId: auth.currentUser?.uid,
                valor,
                descricao,
                categoria,
                tipo: tipoLancamento,
                createdAt: Timestamp.fromDate(new Date(dataLancamento + 'T12:00:00')),
                date: Timestamp.fromDate(new Date(dataVencimento + 'T12:00:00')),
                status: isRealizada ? 'realizado' : 'pendente'
              });

              setValorGasto('');
              setDescricao('');
              setCategoria('Outros');
              setTipoLancamento('despesa');
              setDataLancamento(hoje);
              setDataVencimento(hoje);
              setIsRealizada(true);
              setIsModalOpen(false);
            }}
            className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-3xl p-8 space-y-4"
          >
            <input type="number" step="0.01" value={valorGasto} onChange={(e) => setValorGasto(e.target.value)} required />
            <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} />
            <input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            <button type="submit" className="w-full bg-sky-600 text-white py-3 rounded-xl">Salvar</button>
          </form>
        </div>
      )}
    </div>
  );
}
