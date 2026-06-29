import { useState } from 'react'
import { addDoc, collection, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

export default function TransferModal({ accounts, onClose }) {
  const { user } = useAuth()
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')

  const available = accounts.filter(a => !a.deleted)

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!fromId || !toId || !amt || amt <= 0) return alert('Preencha todos os campos')
    if (fromId === toId) return alert('Selecione contas diferentes')
    const from = available.find(a => a.id === fromId)
    const to = available.find(a => a.id === toId)
    if (!from || !to) return

    await addDoc(collection(db, 'transactions'), {
      name: `Transferência: ${from.name} → ${to.name}`,
      amount: -amt,
      cat: 'transfer',
      icon: 'ti-arrows-exchange',
      bg: '#7C3AED22',
      color: '#7C3AED',
      date: 'Agora',
      group: 'Hoje',
      uid: user.uid,
      type: 'transfer',
      status: 'efetivada',
      createdAt: serverTimestamp(),
    })

    await updateDoc(doc(db, 'accounts', fromId), { balance: (from.balance || 0) - amt })
    await updateDoc(doc(db, 'accounts', toId), { balance: (to.balance || 0) + amt })

    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Transferir entre Contas
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">De</label>
        <select className="field-input" value={fromId} onChange={e => setFromId(e.target.value)}>
          <option value="">Selecione</option>
          {available.map(a => <option key={a.id} value={a.id}>{a.name} (R$ {(a.balance || 0).toFixed(2)})</option>)}
        </select>
        <label className="field-label">Para</label>
        <select className="field-input" value={toId} onChange={e => setToId(e.target.value)}>
          <option value="">Selecione</option>
          {available.map(a => <option key={a.id} value={a.id}>{a.name} (R$ {(a.balance || 0).toFixed(2)})</option>)}
        </select>
        <label className="field-label">Valor (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} />
        <button className="submit-btn" onClick={handleSubmit}>Transferir</button>
      </div>
    </div>
  )
}
