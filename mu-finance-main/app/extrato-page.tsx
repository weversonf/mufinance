'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  ArrowLeft, Plus, Trash2, Clock, 
  ArrowUpCircle, ArrowDownCircle, Check
} from 'lucide-react';
import Link from 'next/link';

export default function Extrato() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados do Formulário
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [isEfetivada, setIsEfetivada] = useState(true);

  const categorias = ['Combustível', 'Comida', 'Compras', 'Fixo', 'Outros'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        onSnapshot(q, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          lista.sort((a: any, b: any) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
          setTransacoes(lista);
          setLoading(false);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Excluir esta transação?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
      <div className="animate-pulse font-black text-sky-500 uppercase tracking-widest">Carregando Extrato...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white p-4 md:p-8 pb-32 relative">
      <div className="max-w-4xl mx-auto">
        
        <header className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-sky-500 transition-colors group">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
               <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Extrato de Lançamentos</h1>
        </header>

        {/* LISTAGEM */}
        <div className="space-y-3">
          {transacoes.length === 0 ? (
            <div className="text-center py-20 opacity-20 font-black uppercase text-xs tracking-[0.3em]">Nenhum lançamento encontrado</div>
          ) : (
            transacoes.map((t: any) => {
              const venc = t.date?.toDate() || new Date();
              const realizada = t.status === 'realizado';

              return (
                <div key={t.id} className={`group bg-white dark:bg-[#0f172a]/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/50 flex justify-between items-center transition-all ${!realizada ? 'border-dashed opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${t.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {realizada ? (t.tipo === 'receita' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />) : <Clock size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-none mb-1">{t.descricao}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                        {venc.toLocaleDateString('pt-BR')} • {t.categoria} • {realizada ? 'EFETUADO' : 'PREVISTO'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-black text-sm ${t.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-500 transition-colors md:opacity-0 group-hover:opacity-100 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTÃO FLUTUANTE (FIXADO NA TELA) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-sky-600 text-white w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[90] border-4 border-white dark:border-[#020617]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
              
              <div className="flex gap-2 mb-6">
                <button type="button" onClick={() => setTipo('despesa')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${tipo === 'despesa' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Despesa</button>
                <button type="button" onClick={() => setTipo('receita')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${tipo === 'receita' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Receita</button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await addDoc(collection(db, "transactions"), {
                    userId: auth.currentUser?.uid,
                    valor: Number(valor),
                    descricao,
                    categoria,
                    tipo,
                    createdAt: new Date(dataLancamento + 'T12:00:00'),
                    date: new Date(dataVencimento + 'T12:00:00'),
                    status: isEfetivada ? 'realizado' : 'pendente'
                  });
                  setIsModalOpen(false);
                  setValor(''); setDescricao('');
                } catch (error) {
                  alert("Erro ao salvar: " + error);
                }
              }} className="space-y-4">
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">R$</span>
                  <input type="number" step="0.01" className="w-full p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-3xl font-black text-center outline-none focus:border-sky-500" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-3 mb-1 block tracking-widest">Lançamento</label>
                    <input type="date" className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-3 mb-1 block tracking-widest">Vencimento</label>
                    <input type="date" className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsEfetivada(!isEfetivada)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isEfetivada 
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' 
                    : 'border-orange-500 bg-orange-500/5 text-orange-500'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isEfetivada ? 'Dinheiro já saiu/entrou' : 'Apenas planejado'}
                  </span>
                  {isEfetivada ? <Check size={18} strokeWidth={3}/> : <Clock size={18} strokeWidth={3}/>}
                </button>

                <select className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <input type="text" placeholder="Descrição (Ex: Gasolina Fazer 250)" className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />

                <div className="pt-4 flex flex-col gap-2">
                   <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-xs text-white tracking-[0.2em] shadow-xl ${tipo === 'despesa' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>Confirmar Registro</button>
                   <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-colors">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
