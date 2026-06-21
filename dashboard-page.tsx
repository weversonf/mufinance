'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  collection, query, where, onSnapshot, addDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  LogOut, CircleDollarSign, ReceiptText, 
  Settings, Eye, EyeOff, Plus,
  Check, Clock, ArrowUpCircle, ArrowDownCircle,
  BarChart3, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'value' | 'hidden'>('value');
  
  // --- ESTADOS DO FORMULÁRIO ---
  const [valorGasto, setValorGasto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [tipoLancamento, setTipoLancamento] = useState<'despesa' | 'receita'>('despesa');
  
  // 1. AQUI ESTÃO AS DUAS DATAS QUE VOCÊ PEDIU
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  
  // 2. AQUI ESTÁ O ESTADO DO CHECKBOX (REALIZADO OU NÃO)
  const [isRealizada, setIsRealizada] = useState(true); 

  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  
  const router = useRouter();
  const categorias = ['Combustível', 'Comida', 'Compras', 'Fixo', 'Outros'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const qTrans = query(collection(db, "transactions"), where("userId", "==", user.uid));
        onSnapshot(qTrans, (snapshot) => {
          let rec = 0; let des = 0; let lista: any[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const v = Number(data.valor || 0);
            
            // Só soma no saldo do topo se estiver marcado como REALIZADO ('status' == 'realizado')
            if (data.status === 'realizado') {
              if (data.tipo === 'receita') rec += v;
              else des += v;
            }
            lista.push({ id: doc.id, ...data });
          });

          // Ordena pela data de VENCIMENTO (campo 'date')
          lista.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
          
          setTotalReceitas(rec);
          setTotalDespesas(des);
          setTransacoes(lista.slice(0, 10)); // Pega as 10 últimas
          setLoading(false);
        });
      } else { router.push('/'); }
    });
    return () => unsubscribe();
  }, [router]);

  const formatDisplay = (valor: number) => {
    if (displayMode === 'hidden') return '••••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold animate-pulse">CARREGANDO...</div>;

  return (
    <div className="antialiased pb-40 p-4 md:p-8 bg-slate-50 dark:bg-[#020617] min-h-screen text-slate-900 dark:text-white">
      
      {/* HEADER */}
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

      {/* CARDS DE SALDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] text-white dark:text-slate-950 shadow-2xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Saldo em Caixa (Realizado)</p>
          <h2 className="text-4xl font-black">{formatDisplay(totalReceitas - totalDespesas)}</h2>
          <CircleDollarSign size={80} className="absolute -right-4 -bottom-4 opacity-5" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div><p className="text-emerald-500 text-[10px] font-black uppercase mb-1">Receitas Confirmadas</p><h2 className="text-2xl font-bold">{formatDisplay(totalReceitas)}</h2></div>
          <ArrowUpCircle className="text-emerald-500/20" size={40} />
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div><p className="text-rose-500 text-[10px] font-black uppercase mb-1">Despesas Pagas</p><h2 className="text-2xl font-bold">{formatDisplay(totalDespesas)}</h2></div>
          <ArrowDownCircle className="text-rose-500/20" size={40} />
        </div>
      </div>

      {/* LISTA RESUMIDA */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Últimas Movimentações</h3>
        <div className="space-y-3">
          {transacoes.map((t) => (
            <div key={t.id} className={`bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center ${t.status !== 'realizado' ? 'opacity-60 border-dashed' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${t.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.status === 'realizado' ? (t.tipo === 'receita' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />) : <Clock size={18} />}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.descricao}</p>
                  <div className="flex gap-2">
                     <p className="text-[9px] text-slate-500 font-bold uppercase">Venc: {t.date?.toDate().toLocaleDateString('pt-BR')}</p>
                     <p className="text-[9px] font-bold uppercase text-sky-500">{t.status === 'realizado' ? 'Efetuado' : 'Pendente'}</p>
                  </div>
                </div>
              </div>
              <p className={`font-black text-sm ${t.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {t.tipo === 'receita' ? '+' : '-'}{formatDisplay(t.valor)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÃO FLUTUANTE */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 bg-sky-600 text-white w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* MODAL DE NOVO LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <h2 className="text-center font-black uppercase tracking-widest text-xs mb-6 text-slate-400">Novo Lançamento</h2>

            {/* TIPO: RECEITA OU DESPESA */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => setTipoLancamento('despesa')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${tipoLancamento === 'despesa' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Despesa</button>
              <button onClick={() => setTipoLancamento('receita')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${tipoLancamento === 'receita' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Receita</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await addDoc(collection(db, "transactions"), {
                userId: auth.currentUser?.uid,
                valor: Number(valorGasto),
                descricao,
                categoria,
                tipo: tipoLancamento,
                createdAt: new Date(dataLancamento + 'T12:00:00'), // Data que preencheu
                date: new Date(dataVencimento + 'T12:00:00'),      // Data de VENCIMENTO
                status: isRealizada ? 'realizado' : 'pendente'     // STATUS CHECKBOX
              });
              setIsModalOpen(false);
              setValorGasto(''); setDescricao('');
            }} className="space-y-4">
              
              {/* CAMPO VALOR */}
              <input type="number" step="0.01" className="w-full p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-3xl font-black text-center outline-none focus:border-sky-500" placeholder="0,00" value={valorGasto} onChange={(e) => setValorGasto(e.target.value)} required />

              {/* --- AQUI ESTÃO OS CAMPOS DE DATA --- */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-3 mb-1 block">Lançamento</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold" 
                    value={dataLancamento} 
                    onChange={(e) => setDataLancamento(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-sky-500 uppercase ml-3 mb-1 block">Vencimento</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-sky-500/10 border border-sky-500 rounded-2xl text-xs font-bold text-sky-600 dark:text-sky-400" 
                    value={dataVencimento} 
                    onChange={(e) => setDataVencimento(e.target.value)} 
                  />
                </div>
              </div>

              {/* --- AQUI ESTÁ O CHECKBOX/BOTÃO DE CONFIRMAÇÃO --- */}
              <button 
                type="button" 
                onClick={() => setIsRealizada(!isRealizada)} 
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isRealizada ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-orange-500 bg-orange-500/5 text-orange-500'}`}
              >
                <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest block">
                        {isRealizada ? 'CONCLUÍDO / PAGO' : 'PENDENTE / AGENDADO'}
                    </span>
                    <span className="text-[9px] opacity-70">
                        {isRealizada ? 'Já impacta o saldo atual' : 'Não impacta o saldo agora'}
                    </span>
                </div>
                {isRealizada ? <Check size={24} strokeWidth={3}/> : <Clock size={24} strokeWidth={3}/>}
              </button>

              <select className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase outline-none" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <input type="text" placeholder="Descrição" className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />

              <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-xs text-white tracking-[0.2em] shadow-xl ${tipoLancamento === 'despesa' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>SALVAR</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 text-[10px] font-black uppercase text-center mt-2">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
