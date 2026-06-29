import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function GoalModal({ editGoal, onClose }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name || '')
      setTarget(editGoal.target?.toString() || '')
      setSaved(editGoal.saved?.toString() || '')
    }
  }, [editGoal])

  const handleSubmit = async () => {
    if (!name.trim() || !target || parseFloat(target) <= 0) return alert('Preencha nome e valor alvo')
    const data = { name: name.trim(), target: parseFloat(target), saved: parseFloat(saved) || 0 }
    if (editGoal) {
      await updateDoc(doc(db, 'goals', editGoal.id), data)
    } else {
      await addDoc(collection(db, 'goals'), data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editGoal || !confirm('Excluir meta?')) return
    await deleteDoc(doc(db, 'goals', editGoal.id))
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editGoal ? 'Editar Meta' : 'Nova Meta'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Nome da Meta</label>
        <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem para Europa" />
        <label className="field-label">Valor Alvo (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={target} onChange={e => setTarget(e.target.value)} placeholder="10000" />
        <label className="field-label">Já guardado (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar Meta</button>
        {editGoal && <button className="submit-btn" style={{ background: '#c0392b', marginTop: 10 }} onClick={handleDelete}>Excluir Meta</button>}
      </div>
    </div>
  )
}
