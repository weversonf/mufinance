import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function MaintModal({ accounts, onClose }) {
  const [type, setType] = useState('oleo')
  const [desc, setDesc] = useState('')
  const [km, setKm] = useState('')
  const [value, setValue] = useState('')
  const [accountId, setAccountId] = useState('')
  const [oilFlag, setOilFlag] = useState(false)

  useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id)
  }, [accounts])

  const handleSubmit = async () => {
    if (!desc.trim()) return alert('Preencha a descrição')
    const data = {
      type,
      desc: desc.trim(),
      km: parseInt(km) || 0,
      value: parseFloat(value) || 0,
      oilFlag,
      accountId: accountId || null,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'vehicle_maintenance'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Manutenção
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Tipo</label>
        <select className="field-input" value={type} onChange={e => { setType(e.target.value); if (e.target.value === 'oleo') setOilFlag(true) }}>
          <option value="oleo">Troca de Óleo</option>
          <option value="pneus">Pneus</option>
          <option value="corrente">Corrente</option>
          <option value="freios">Freios</option>
          <option value="filtros">Filtros</option>
          <option value="suspensao">Suspensão</option>
          <option value="outro">Outro</option>
        </select>
        <label className="field-label">Descrição</label>
        <input className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Troca de óleo 5w30" />
        <label className="field-label">KM</label>
        <input className="field-input" type="number" min="0" value={km} onChange={e => setKm(e.target.value)} placeholder="15000" />
        <label className="field-label">Valor (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="250" />
        <label className="field-label">Conta (opcional)</label>
        <select className="field-input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="">Nenhuma</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sec)', margin: '8px 0' }}>
          <input type="checkbox" checked={oilFlag} onChange={e => setOilFlag(e.target.checked)} />
          Esta manutenção é troca de óleo
        </label>
        <button className="submit-btn" onClick={handleSubmit}>Registrar Manutenção</button>
      </div>
    </div>
  )
}
