import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const ICONS = [
  'ti-home', 'ti-car', 'ti-bus', 'ti-plane', 'ti-train', 'ti-gas-station', 'ti-tools',
  'ti-medical-cross', 'ti-heart', 'ti-apple', 'ti-briefcase', 'ti-building-bank',
  'ti-shopping-cart', 'ti-gift', 'ti-music', 'ti-device-gamepad', 'ti-shirt',
  'ti-dog', 'ti-plant', 'ti-book', 'ti-school', 'ti-coin', 'ti-credit-card',
  'ti-phone', 'ti-wifi', 'ti-droplet', 'ti-firetruck',
]

export default function SubcatModal({ categoryId, editSubcat, onClose }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('ti-category')

  useEffect(() => {
    if (editSubcat) {
      setName(editSubcat.name || '')
      setIcon(editSubcat.icon || 'ti-category')
    } else {
      setName('')
      setIcon('ti-category')
    }
  }, [editSubcat])

  const handleSave = async () => {
    if (!name.trim()) return alert('Nome obrigatório')
    const subcatData = { name: name.trim(), icon }
    const catRef = doc(db, 'categories', categoryId)

    if (editSubcat) {
      const snap = await import('firebase/firestore').then(m => m.getDoc(catRef))
      const data = snap.data()
      const subcats = (data.subcats || []).map(s => s.id === editSubcat.id ? { ...s, ...subcatData } : s)
      await updateDoc(catRef, { subcats })
    } else {
      const snap = await import('firebase/firestore').then(m => m.getDoc(catRef))
      const data = snap.data()
      const newSub = { id: Date.now().toString(), ...subcatData }
      await updateDoc(catRef, { subcats: [...(data.subcats || []), newSub] })
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editSubcat || !confirm('Excluir subcategoria?')) return
    const snap = await import('firebase/firestore').then(m => m.getDoc(doc(db, 'categories', categoryId)))
    const data = snap.data()
    const subcats = (data.subcats || []).filter(s => s.id !== editSubcat.id)
    await updateDoc(doc(db, 'categories', categoryId), { subcats })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <h2>
          {editSubcat ? 'Editar Subcategoria' : 'Nova Subcategoria'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Nome</label>
        <input className="field-input" placeholder="Nome da subcategoria" value={name} onChange={e => setName(e.target.value)} />
        <label className="field-label">Ícone</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <i className={'ti ' + icon} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{icon}</span>
        </div>
        <div className="icon-picker-grid">
          {ICONS.map(i => (
            <div key={i} className={'cat-item' + (icon === i ? ' selected' : '')} onClick={() => setIcon(i)}>
              <div className="cat-icon"><i className={'ti ' + i} /></div>
            </div>
          ))}
        </div>
        <button className="submit-btn" onClick={handleSave}>Salvar</button>
        {editSubcat && (
          <button className="submit-btn" id="subcat-delete-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 8 }}>Excluir Subcategoria</button>
        )}
      </div>
    </div>
  )
}
