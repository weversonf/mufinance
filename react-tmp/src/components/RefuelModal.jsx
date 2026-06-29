import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function RefuelModal({ accounts, onClose }) {
  const [fuelType, setFuelType] = useState('gasolina')
  const [price, setPrice] = useState('')
  const [liters, setLiters] = useState('')
  const [total, setTotal] = useState('')
  const [km, setKm] = useState('')
  const [fullTank, setFullTank] = useState(false)
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id)
  }, [accounts])

  const calc = (changed) => {
    const p = parseFloat(price) || 0
    const l = parseFloat(liters) || 0
    const t = parseFloat(total) || 0
    if (changed === 'price' && l > 0) setTotal((p * l).toFixed(2))
    else if (changed === 'liters' && p > 0) setTotal((p * l).toFixed(2))
    else if (changed === 'total' && p > 0) setLiters((t / p).toFixed(2))
    else if (changed === 'total' && l > 0) setPrice((t / l).toFixed(3))
    else if (changed === 'price' && t > 0) setLiters((t / p).toFixed(2))
    else if (changed === 'liters' && t > 0) setPrice((t / l).toFixed(3))
  }

  const handleOcr = () => {
    console.log('OCR')
  }

  const handleSubmit = async () => {
    const val = parseFloat(total) || (parseFloat(price) || 0) * (parseFloat(liters) || 0)
    const odometer = parseInt(km) || 0
    if (!val || !odometer) return alert('Preencha valor e km')
    const data = {
      type: fuelType,
      price: parseFloat(price) || 0,
      liters: parseFloat(liters) || (parseFloat(price) > 0 ? val / parseFloat(price) : 0),
      value: val,
      km: odometer,
      tanqueCheio: fullTank,
      accountId: accountId || null,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'vehicle_refuels'), data)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Abastecimento
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Combustível</label>
        <select className="field-input" value={fuelType} onChange={e => setFuelType(e.target.value)}>
          <option value="gasolina">Gasolina</option>
          <option value="etanol">Etanol</option>
          <option value="diesel">Diesel</option>
          <option value="gnv">GNV</option>
        </select>
        <label className="field-label">Preço por Litro (R$)</label>
        <input className="field-input" type="number" step="0.001" min="0" value={price} onChange={e => { setPrice(e.target.value); calc('price') }} placeholder="5,49" />
        <label className="field-label">Litros</label>
        <input className="field-input" type="number" step="0.01" min="0" value={liters} onChange={e => { setLiters(e.target.value); calc('liters') }} placeholder="40" />
        <label className="field-label">Valor Total (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={total} onChange={e => { setTotal(e.target.value); calc('total') }} placeholder="0" />
        <label className="field-label">Hodômetro (KM)</label>
        <input className="field-input" type="number" min="0" value={km} onChange={e => setKm(e.target.value)} placeholder="15000" />
        <label className="field-label">Tanque Cheio?</label>
        <div className={'toggle-switch' + (fullTank ? ' active' : '')} onClick={() => setFullTank(!fullTank)} style={{ margin: '4px 0 10px' }} />
        <label className="field-label">Conta (opcional)</label>
        <select className="field-input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="">Nenhuma</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button className="submit-btn" style={{ flex: 0, padding: '10px 16px', fontSize: 12 }} onClick={handleOcr}><i className="ti ti-paperclip" /> Câmera</button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>fotografe a bomba para preenchimento automático</span>
        </div>
        <button className="submit-btn" onClick={handleSubmit}>Registrar Abastecimento</button>
      </div>
    </div>
  )
}
