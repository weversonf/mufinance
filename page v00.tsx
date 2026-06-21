'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  doc, getDoc, collection, query, where, 
  onSnapshot, deleteDoc, updateDoc, addDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  LogOut, CircleDollarSign, ReceiptText, 
  Fuel, Utensils, ShoppingBag, CreditCard, 
  Settings, Eye, EyeOff, Target, ChevronRight, Plus,
  Check, X, Trash2, Edit2, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'value' | 'percent' | 'hidden'>('value');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editValor, setEditValor] = useState<number>(0);

  const [valorGasto, setValorGasto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [tipoLancamento, setTipoLancamento] = useState<'despesa' | 'receita'>('despesa');
  
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any>({});
  
  const router = useRouter();

  const categorias = [
    { nome: 'Combustível', icon: <Fuel size={18} />, color: 'bg-sky-500' },
    { nome: 'Comida', icon: <Utensils size={18} />, color: 'bg-orange-500' },
    { nome: 'Compras', icon: <ShoppingBag size={18} />, color: 'bg-emerald-500' },
    { nome: 'Fixo', icon: <CreditCard size={18} />, color: 'bg-purple-500' },
    { nome: 'Outros', icon: <ReceiptText size={18} />, color: 'bg-slate-500' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());

        const qTrans = query(collection(db, "transactions"), where("userId", "==", user.uid));
        onSnapshot(qTrans, (snapshot) => {
          let receitas = 0; let despesas = 0; let lista: any[] = [];
          let catSoma: any = {};

          snapshot.forEach((doc) => {
            const data = doc.data();
            const v = Number(data.valor || 0);
            if (data.tipo === 'receita') {
              receitas += v;
            } else {
              despesas += v;
              catSoma[data.categoria] = (catSoma[data.categoria] || 0) + v;
            }
            lista.push({ id: doc.id, ...data });
          });

          lista.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
          setTotalReceitas(receitas);
          setTotalDespesas(despesas);
          setGastosPorCategoria(catSoma);
          setTransacoes(lista.slice(0, 10));
          setLoading(false);
        });
      } else { router.push('/'); }
    });
    return () => unsubscribe();
  }, [router]);

  const saldoReal = totalReceitas - totalDespesas;

  const formatDisplay = (valor: number) => {
    if (displayMode === 'hidden') return '••••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic animate-pulse">MUCURIPE FINANCE</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-ubuntu antialiased pb-40">
      {/* Container 80% no Desktop */}
      <div className="max-w-6xl mx-auto p-6">
        
        <header className="flex justify-between items-center mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50">
          <div className="flex gap-2">
            <Link href="/perfil" className="p-2.5 bg-slate-800 rounded-xl text-slate-400"><Settings size={20} /></Link>
            <Link href="/metas" className="p-2.5 bg-slate-800 rounded-xl text-slate-400"><Target size={20} /></Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDisplayMode(displayMode === 'value' ? 'hidden' : 'value')} className="p-2.5 bg-slate-800 rounded-xl text-slate-400">
              {displayMode === 'value' ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <ThemeToggle />
            <button onClick={() => signOut(auth)} className="p-2.5 bg-slate-800/50 rounded-xl text-slate-500"><LogOut size={20} /></button>
          </div>
        </header>

        {/* 3 CARDS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <section className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] border border-blue-400/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CircleDollarSign size={60} /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100/60 mb-1">Caixa Atual</p>
            <h2 className="text-4xl font-bold">{formatDisplay(saldoReal)}</h2>
          </section>

          <section className="bg-slate-900/60 p-8 rounded-[2rem] border border-emerald-500/10 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Receitas</p>
              <h2 className="text-3xl font-bold text-emerald-400">{formatDisplay(totalReceitas)}</h2>
            </div>
            <ArrowUpCircle className="text-emerald-500/20" size={40} />
          </section>

          <section className="bg-slate-900/60 p-8 rounded-[2rem] border border-rose-500/10 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Despesas</p>
              <h2 className="text-3xl font-bold text-rose-400">{formatDisplay(totalDespesas)}</h2>
            </div>
            <ArrowDownCircle className="text-rose-500/20" size={40} />
          </section>
        </div>

        {/* SEÇÃO DE GRÁFICOS (POR CATEGORIA) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Gastos por Categoria</h3>
            <div className="space-y-6">
              {categorias.map(cat => {
                const valor = gastosPorCategoria[cat.nome] || 0;
                const perc = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;
                return (
                  <div key={cat.nome}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                        {cat.nome}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">R$ {valor.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: `${perc}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FLUXO RECENTE */}
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Fluxo Recente</h3>
              <Link href="/extrato" className="text-[10px] font-bold uppercase text-sky-500 flex items-center gap-1">Ver Tudo <ChevronRight size={12} /></Link>
            </div>
            <div className="space-y-3">
              {transacoes.map((t) => (
                <div key={t.id} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex justify-between items-center group hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${t.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-sky-400'}`}>
                      {t.tipo === 'receita' ? <ArrowUpCircle size={18} /> : (categorias.find(c => c.nome === t.categoria)?.icon || <ReceiptText size={18} />)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-200">{t.descricao}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">{t.categoria}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-sm ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatDisplay(t.valor)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTÃO "+" DISCRETO */}
        <div className="fixed bottom-8 right-8 z-40">
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-slate-950 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* MODAL DE LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-700">
             <div className="flex gap-2 mb-6">
                <button type="button" onClick={() => setTipoLancamento('despesa')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] ${tipoLancamento === 'despesa' ? 'bg-rose-600' : 'bg-slate-800 text-slate-400'}`}>Despesa</button>
                <button type="button" onClick={() => setTipoLancamento('receita')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] ${tipoLancamento === 'receita' ? 'bg-emerald-600' : 'bg-slate-800 text-slate-400'}`}>Receita</button>
              </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await addDoc(collection(db, "transactions"), {
                userId: auth.currentUser?.uid,
                valor: Number(valorGasto),
                descricao: descricao || categoria,
                categoria,
                tipo: tipoLancamento,
                date: new Date()
              });
              setIsModalOpen(false);
              setValorGasto(''); setDescricao('');
            }} className="space-y-4">
              <input type="number" step="0.01" autoFocus className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-3xl font-bold text-center text-white" placeholder="0,00" value={valorGasto} onChange={(e) => setValorGasto(e.target.value)} required />
              
              <select className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {categorias.map(c => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
              </select>

              <input type="text" placeholder="Descrição" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              
              <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest ${tipoLancamento === 'despesa' ? 'bg-rose-600 shadow-lg shadow-rose-900/20' : 'bg-emerald-600 shadow-lg shadow-emerald-900/20'}`}>Confirmar Lançamento</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 text-[10px] font-bold uppercase text-center mt-2">Fechar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
