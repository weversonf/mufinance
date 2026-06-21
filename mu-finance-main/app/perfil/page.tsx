'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Save, User, Wallet, 
  Bike, MapPin, Search, ChevronDown, AtSign 
} from 'lucide-react';
import Link from 'next/link';

// Bancos de dados para Dropdowns condicionados
const LOCALIDADES_DB: Record<string, string[]> = {
  "CE": ["Fortaleza", "Caucaia", "Maracanaú", "Sobral", "Eusébio", "Aquiraz"],
  "SP": ["São Paulo", "Campinas", "Santos", "São Bernardo do Campo"],
  "RJ": ["Rio de Janeiro", "Niterói", "Duque de Caxias"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem"],
};

const VEICULOS_DB: Record<string, string[]> = {
  "Yamaha": ["Fazer 250", "Lander 250", "MT-03", "Factor 150", "NMAX", "R15"],
  "Honda": ["CG 160 Titan", "CB 300F Twister", "XRE 300", "PCX", "Biz 125", "Civic"],
  "Toyota": ["Corolla", "Hilux", "SW4", "Yaris"],
  "BMW": ["G 310 GS", "R 1250 GS", "320i"],
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  
  const [userData, setUserData] = useState({
    username: '',
    receitaFixa: '',
    horasMensais: '160',
    cidade: 'Fortaleza',
    estado: 'CE',
    marcaVeiculo: '',
    nomeVeiculo: '',
    consumoVeiculo: '29',
    precoCombustivel: '6.10',
    taxaCDB: '0.0085'
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(prev => ({ 
            ...prev, 
            ...data,
            receitaFixa: data.receitaFixa?.toString() || '',
            horasMensais: data.horasMensais?.toString() || '160',
            consumoVeiculo: data.consumoVeiculo?.toString() || '29',
            precoCombustivel: data.precoCombustivel?.toString() || '6.10'
          }));
          setMarcaSelecionada(data.marcaVeiculo || '');
        }
        setLoading(false);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Função para buscar preço automático (Simulando API)
  const sincronizarCombustivel = () => {
    if (!userData.cidade) return alert("Selecione uma cidade primeiro.");
    setSaving(true);
    
    setTimeout(() => {
      // Lógica de mock: Fortaleza tem um preço base, outras cidades outro
      const precoBase = userData.cidade === 'Fortaleza' ? 6.10 : 5.98;
      const variacao = (Math.random() * 0.15).toFixed(2);
      const novoPreco = (precoBase + parseFloat(variacao)).toFixed(2);
      
      setUserData(prev => ({ ...prev, precoCombustivel: novoPreco }));
      setSaving(false);
      alert(`Preço em ${userData.cidade} sincronizado com sucesso!`);
    }, 1000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, {
        ...userData,
        receitaFixa: Number(userData.receitaFixa),
        horasMensais: Number(userData.horasMensais),
        consumoVeiculo: Number(userData.consumoVeiculo),
        precoCombustivel: Number(userData.precoCombustivel),
        taxaCDB: Number(userData.taxaCDB),
        marcaVeiculo: marcaSelecionada,
        updatedAt: new Date()
      });
      router.push('/dashboard');
    } catch (error) {
      alert("Erro ao salvar dados.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white italic animate-pulse tracking-widest">
      MUCURIPE FINANCE
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-ubuntu pb-24">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-10">
        <Link href="/dashboard" className="p-3 bg-[#0a1220] rounded-2xl border border-slate-900 text-slate-400">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Meu Perfil</h1>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSave} className="space-y-8 max-w-md mx-auto">
        
        {/* IDENTIDADE */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">
            <AtSign size={14} /> Identidade
          </label>
          <div className="bg-[#050b18] border border-slate-900 p-5 rounded-[2.5rem] flex items-center gap-4">
            <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 shadow-inner">
              <User size={28} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Usuário Ativo</p>
              <p className="text-xl font-black italic tracking-tight text-white">@{userData.username}</p>
            </div>
          </div>
        </div>

        {/* RESIDÊNCIA */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-sky-500 tracking-widest px-2">
            <MapPin size={14} /> Residência
          </label>
          <div className="bg-[#050b18] border border-slate-900 p-5 rounded-[2.5rem] space-y-5">
            <div className="flex gap-3">
              <div className="flex-[1.2] relative">
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold">UF</p>
                <select 
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm outline-none appearance-none focus:border-sky-500/40"
                  value={userData.estado}
                  onChange={(e) => setUserData({ ...userData, estado: e.target.value, cidade: '' })}
                >
                  <option value="">UF</option>
                  {Object.keys(LOCALIDADES_DB).map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-[72%] -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
              <div className="flex-[3] relative">
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold">Cidade</p>
                <select 
                  disabled={!userData.estado}
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm outline-none appearance-none disabled:opacity-20 focus:border-sky-500/40"
                  value={userData.cidade}
                  onChange={(e) => setUserData({ ...userData, cidade: e.target.value })}
                >
                  <option value="">Selecionar cidade...</option>
                  {userData.estado && LOCALIDADES_DB[userData.estado].map(cid => <option key={cid} value={cid}>{cid}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-[72%] -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
            </div>
            <button 
              type="button" 
              onClick={sincronizarCombustivel}
              className="w-full p-4 bg-transparent border border-sky-500/20 rounded-2xl flex items-center justify-center gap-3 active:bg-sky-500/5 transition-all group"
            >
              <Search size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
              <span className="text-sky-500 text-[11px] font-black uppercase tracking-[0.15em]">Sincronizar Preço Local</span>
            </button>
          </div>
        </div>

        {/* VEÍCULO */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-orange-500 tracking-widest px-2">
            <Bike size={14} /> Veículo
          </label>
          <div className="bg-[#050b18] border border-slate-900 p-5 rounded-[2.5rem] space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold">Marca</p>
                <select 
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm outline-none appearance-none focus:border-orange-500/40"
                  value={marcaSelecionada}
                  onChange={(e) => { setMarcaSelecionada(e.target.value); setUserData({...userData, nomeVeiculo: ''}); }}
                >
                  <option value="">Marca...</option>
                  {Object.keys(VEICULOS_DB).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-[72%] -translate-y-1/2 text-slate-600" />
              </div>
              <div className="relative">
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold">Modelo</p>
                <select 
                  disabled={!marcaSelecionada}
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm outline-none appearance-none disabled:opacity-20 focus:border-orange-500/40"
                  value={userData.nomeVeiculo}
                  onChange={(e) => setUserData({...userData, nomeVeiculo: e.target.value})}
                >
                  <option value="">Modelo...</option>
                  {marcaSelecionada && VEICULOS_DB[marcaSelecionada].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-[72%] -translate-y-1/2 text-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold text-center">Média (KM/L)</p>
                <input 
                  type="number" 
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm text-center outline-none focus:border-orange-500/40" 
                  value={userData.consumoVeiculo}
                  onChange={(e) => setUserData({...userData, consumoVeiculo: e.target.value})}
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold text-center">R$ / Litro</p>
                {/* CAMPO TRAVADO PARA EDIÇÃO MANUAL */}
                <div className="w-full p-4 bg-[#0a1220]/40 border border-slate-800/40 rounded-2xl text-sm text-center text-slate-400 font-black">
                  {userData.precoCombustivel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCEIRO */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest px-2">
            <Wallet size={14} /> Financeiro
          </label>
          <div className="bg-[#050b18] border border-slate-900 p-5 rounded-[2.5rem] space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold text-center">Renda Fixa</p>
                <input 
                  type="number" 
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm text-center outline-none focus:border-emerald-500/40" 
                  value={userData.receitaFixa}
                  onChange={(e) => setUserData({...userData, receitaFixa: e.target.value})}
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5 ml-2 uppercase font-bold text-center">Horas/Mês</p>
                <input 
                  type="number" 
                  className="w-full p-4 bg-[#0a1220] border border-slate-800 rounded-2xl text-sm text-center outline-none focus:border-emerald-500/40" 
                  value={userData.horasMensais}
                  onChange={(e) => setUserData({...userData, horasMensais: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <button 
          type="submit" 
          disabled={saving}
          className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {saving ? 'Processando...' : 'Salvar Alterações'}
        </button>

      </form>
    </div>
  );
}