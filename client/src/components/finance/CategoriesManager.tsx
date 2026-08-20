"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Plus, Save, Tag, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "../../../../actions/finance";
import { defaultFinanceCategories, type FinanceCategory } from "@/lib/financeData";

type CategoryRecord = FinanceCategory & { ownerId?: string };

export function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [busy, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch("/api/finance/snapshot").then((response) => response.ok ? response.json() : null).then((data) => {
      if (data?.categories?.length) setCategories(data.categories);
      else setCategories(defaultFinanceCategories);
    }).catch(() => setCategories(defaultFinanceCategories));
  }, []);

  const reset = () => { setName(""); setType("expense"); setEditing(null); };
  const save = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const payload = { name, type, tone: type === "income" ? "mint" : "blue", active: true } as const;
        if (editing) {
          const updated = await updateCategory(editing.id, payload);
          setCategories((current) => current.map((item) => item.id === editing.id ? { ...item, ...updated } : item));
          setFeedback("Categoria atualizada.");
        } else {
          const created = await createCategory(payload);
          setCategories((current) => [...current, created as CategoryRecord]);
          setFeedback("Categoria criada.");
        }
        reset();
      } catch {
        setFeedback("Não foi possível salvar a categoria.");
      }
    });
  };
  const remove = (category: CategoryRecord) => {
    if (!category.ownerId) { setFeedback("Categorias padrão não podem ser removidas."); return; }
    if (!window.confirm(`Excluir a categoria ${category.name}?`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(category.id);
        setCategories((current) => current.filter((item) => item.id !== category.id));
        setFeedback("Categoria excluída.");
      } catch { setFeedback("Não foi possível excluir a categoria."); }
    });
  };

  return (
    <main className="categories-page"><section className="categories-card"><header className="categories-heading"><div><p className="eyebrow">PERSONALIZAÇÃO</p><h1>Suas categorias.</h1><p>Crie e organize categorias de Receita e Despesa sem misturar dados entre usuários.</p></div><a className="soft-button" href="/">Voltar</a></header>
      <div className="category-form"><label><span>Nome</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Saúde" /></label><label><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value as "income" | "expense")}><option value="expense">Despesa</option><option value="income">Receita</option></select></label><div className="category-form__actions">{editing && <button className="soft-button" type="button" onClick={reset}><X size={15} /> Cancelar</button>}<button className="primary-button" type="button" onClick={save} disabled={busy}>{editing ? <Save size={15} /> : <Plus size={15} />}{editing ? "Salvar" : "Adicionar categoria"}</button></div></div>
      {feedback && <p className="category-feedback" role="status">{feedback}</p>}
      <div className="category-list">{categories.map((category) => <article className="category-row" key={category.id}><span className={`category-row__icon category-row__icon--${category.tone}`}><Tag size={16} /></span><div><strong>{category.name}</strong><small>{category.type === "income" ? "Receita" : "Despesa"}{category.ownerId ? " · personalizada" : " · padrão"}</small></div><span className="category-row__usage">{category.usage ?? 0} usos</span><div className="category-row__actions"><button type="button" className="icon-button" onClick={() => { setEditing(category); setName(category.name); setType(category.type); }} aria-label={`Editar ${category.name}`}><Pencil size={15} /></button><button type="button" className="icon-button icon-button--danger" onClick={() => remove(category)} aria-label={`Excluir ${category.name}`}><Trash2 size={15} /></button></div></article>)}</div>
    </section></main>
  );
}
