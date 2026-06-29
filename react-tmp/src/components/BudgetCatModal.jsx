import { useState, useEffect } from 'react'

export default function BudgetCatModal({ categories, editBudgetCat, onClose, onSave }) {
  const [catId, setCatId] = useState('')
  const [limit, setLimit] = useState('')

  useEffect(() => {
    if (editBudgetCat) {
      setCatId(editBudgetCat.catId || '')
      setLimit(editBudgetCat.limit?.toString() || '')
    } else {
      setCatId(categories[0]?.id || '')
      setLimit('')
    }
  }, [editBudgetCat, categories])

  const handleSubmit = () => {
    if (!catId) return alert('Selecione uma categoria')
    onSave({ catId, limit: parseFloat(limit) || 0 })
    onClose()
  }

  const handleDelete = () => {
    if (!editBudgetCat || !confirm('Excluir?')) return
    onSave({ catId: editBudgetCat.catId, limit: 0, delete: true })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editBudgetCat ? 'Editar Categoria' : 'Nova Categoria'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Categoria (Despesa)</label>
        <select className="field-input" value={catId} onChange={e => setCatId(e.target.value)}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="field-label">Limite (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={limit} onChange={e => setLimit(e.target.value)} placeholder="1000" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
        {editBudgetCat && <button className="submit-btn" style={{ background: '#c0392b', marginTop: 10 }} onClick={handleDelete}>Excluir</button>}
      </div>
    </div>
  )
}
