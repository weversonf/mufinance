import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useData } from '../context/DataContext'

export default function CardModal({ editCard, onClose }) {
  const { profile } = useData()
  const [type, setType] = useState('Visa')
  const [number, setNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')

  useEffect(() => {
    if (editCard) {
      setType(editCard.type || 'Visa')
      setNumber(editCard.number || '')
      setHolder(editCard.holder || '')
      setExpiry(editCard.expiry || '')
    } else {
      setHolder(profile.name || '')
    }
  }, [editCard, profile])

  const handleSubmit = async () => {
    if (!number.trim() || !holder.trim() || !expiry.trim()) return alert('Preencha todos os campos')
    const colors = { Visa: ['#1a7a4a', '#2d5a43'], Mastercard: ['#333', '#111'], Elo: ['#c0392b', '#7a1a1a'], Amex: ['#2c3e50', '#1a252f'] }
    const [color, colorDark] = colors[type] || ['#1a7a4a', '#2d5a43']
    const data = { type, number: number.trim(), holder: holder.trim(), expiry: expiry.trim(), color, colorDark }
    if (editCard) {
      await updateDoc(doc(db, 'cards', editCard.id), data)
    } else {
      await addDoc(collection(db, 'cards'), data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editCard) return
    if (!confirm('Excluir este cartão?')) return
    await updateDoc(doc(db, 'cards', editCard.id), { deleted: true })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editCard ? 'Editar Cartão' : 'Adicionar Cartão'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Bandeira</label>
        <select className="field-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="Elo">Elo</option>
          <option value="Amex">Amex</option>
        </select>
        <label className="field-label">Número do Cartão</label>
        <input className="field-input" placeholder="**** **** **** 0000" maxLength={19} value={number} onChange={e => setNumber(e.target.value)} />
        <label className="field-label">Titular</label>
        <input className="field-input" placeholder="Nome do titular" value={holder} onChange={e => setHolder(e.target.value)} />
        <label className="field-label">Validade (MM/AA)</label>
        <input className="field-input" placeholder="12/28" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)} />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
        {editCard && (
          <button className="submit-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 10 }}>Excluir Cartão</button>
        )}
      </div>
    </div>
  )
}
