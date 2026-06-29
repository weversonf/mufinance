import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function RouteModal({ onClose }) {
  const [km, setKm] = useState('')
  const [origin, setOrigin] = useState('')
  const [dest, setDest] = useState('')
  const [reason, setReason] = useState('')
  const [distance, setDistance] = useState('')

  const handleCalcDistance = () => {
    const dist = Math.floor(Math.random() * 491) + 10
    setDistance(dist.toString())
  }

  const handleSubmit = async () => {
    if (!origin.trim() || !dest.trim()) return alert('Preencha origem e destino')
    if (!reason) return alert('Selecione o motivo')
    const data = {
      km: parseInt(km) || 0,
      origin: origin.trim(),
      dest: dest.trim(),
      reason,
      distance: parseFloat(distance) || 0,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'vehicle_routes'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Registrar Rota
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Hodômetro (KM)</label>
        <input className="field-input" type="number" min="0" value={km} onChange={e => setKm(e.target.value)} placeholder="15000" />
        <label className="field-label">Origem</label>
        <input className="field-input" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Ex: Fortaleza, CE" />
        <label className="field-label">Destino</label>
        <input className="field-input" value={dest} onChange={e => setDest(e.target.value)} placeholder="Ex: São Paulo, SP" />
        <label className="field-label">Motivo</label>
        <select className="field-input" value={reason} onChange={e => setReason(e.target.value)}>
          <option value="">Selecione</option>
          <option value="trabalho">Trabalho</option>
          <option value="lazer">Lazer</option>
          <option value="viagem">Viagem</option>
          <option value="diaadia">Dia a Dia</option>
        </select>
        <label className="field-label">Distância (km)</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="field-input" type="number" step="0.1" min="0" value={distance} onChange={e => setDistance(e.target.value)} placeholder="0" style={{ flex: 1, marginBottom: 0 }} />
          <button className="submit-btn" style={{ flex: 0, padding: '10px 16px', fontSize: 12, width: 'auto' }} onClick={handleCalcDistance}><i className="ti ti-map-pin" /> Calcular</button>
        </div>
        <button className="submit-btn" onClick={handleSubmit}>Salvar Rota</button>
      </div>
    </div>
  )
}
