import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function VehicleConfigModal({ vehicle, onClose }) {
  const [type, setType] = useState('carro')
  const [name, setName] = useState('')
  const [oilKm, setOilKm] = useState('')
  const [oilInterval, setOilInterval] = useState('')
  const [plateEnd, setPlateEnd] = useState('')
  const [consumo, setConsumo] = useState('')

  useEffect(() => {
    if (vehicle) {
      setType(vehicle.type || 'carro')
      setName(vehicle.name || '')
      setOilKm(vehicle.oilKm?.toString() || '')
      setOilInterval(vehicle.oilInterval?.toString() || '')
      setPlateEnd(vehicle.plateEnd?.toString() ?? '')
      setConsumo(vehicle.consumo?.toString() || '')
    }
  }, [vehicle])

  const handleSubmit = async () => {
    const data = {
      type,
      name: name.trim(),
      oilKm: parseInt(oilKm) || 0,
      oilInterval: parseInt(oilInterval) || 0,
      plateEnd: parseInt(plateEnd) || 0,
      consumo: parseFloat(consumo) || 0,
    }
    await setDoc(doc(db, 'vehicle', 'config'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Configurar Veículo
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Tipo</label>
        <select className="field-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>
        <label className="field-label">Nome / Apelido</label>
        <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Civic" />
        <label className="field-label">KM da Última Troca de Óleo</label>
        <input className="field-input" type="number" min="0" value={oilKm} onChange={e => setOilKm(e.target.value)} placeholder="5000" />
        <label className="field-label">Trocar Óleo a Cada (KM)</label>
        <input className="field-input" type="number" min="0" value={oilInterval} onChange={e => setOilInterval(e.target.value)} placeholder="10000" />
        <label className="field-label">Final da Placa (0-9)</label>
        <input className="field-input" type="number" min="0" max="9" value={plateEnd} onChange={e => setPlateEnd(e.target.value)} placeholder="5" />
        <label className="field-label">Consumo Manual (km/L, opcional)</label>
        <input className="field-input" type="number" step="0.1" min="0" value={consumo} onChange={e => setConsumo(e.target.value)} placeholder="12" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
      </div>
    </div>
  )
}
