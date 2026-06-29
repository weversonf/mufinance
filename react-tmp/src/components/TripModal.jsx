import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

export default function TripModal({ onClose }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [origin, setOrigin] = useState('')
  const [dest, setDest] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const calcTrip = async () => {
    if (!origin.trim() || !dest.trim()) return alert('Preencha origem e destino')
    setLoading(true)
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${encodeURIComponent(origin)};${encodeURIComponent(dest)}?overview=false`
      )
      const data = await res.json()
      if (data.code !== 'Ok' || !data.routes?.length) {
        setResult({ error: 'Não foi possível calcular a rota. Tente novamente.' })
        return
      }
      const distKm = data.routes[0].distance / 1000
      const durationMin = data.routes[0].duration / 60
      const fuelCost = distKm * 0.7
      setResult({ distKm, durationMin, fuelCost })
    } catch {
      setResult({ error: 'Erro ao calcular rota. Verifique sua conexão.' })
    }
    setLoading(false)
  }

  const saveAsGoal = async () => {
    if (!result || result.error) return
    await addDoc(collection(db, 'goals'), {
      name: `Viagem: ${origin} → ${dest}`,
      target: Math.ceil(result.fuelCost * 2),
      saved: 0,
      uid: user.uid,
      createdAt: new Date(),
    })
    showToast('Meta salva!')
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Calculadora de Viagem
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Origem</label>
        <input className="field-input" placeholder="Cidade de origem" value={origin} onChange={e => setOrigin(e.target.value)} />
        <label className="field-label">Destino</label>
        <input className="field-input" placeholder="Cidade de destino" value={dest} onChange={e => setDest(e.target.value)} />
        <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', marginBottom: 8 }} onClick={calcTrip} disabled={loading}>
          <i className="ti ti-map-pin" /> {loading ? 'Calculando...' : 'Calcular Rota'}
        </button>
        {result && (
          <div style={{ fontSize: 13, color: 'var(--text-sec)', padding: '12px 0' }}>
            {result.error ? (
              <span style={{ color: '#c0392b' }}>{result.error}</span>
            ) : (
              <>
                <div><i className="ti ti-road" /> {result.distKm.toFixed(1)} km</div>
                <div><i className="ti ti-clock" /> {result.durationMin >= 60 ? `${Math.floor(result.durationMin / 60)}h ${Math.round(result.durationMin % 60)}min` : `${Math.round(result.durationMin)} min`}</div>
                <div><i className="ti ti-gas-station" /> ~R$ {result.fuelCost.toFixed(2)} (combustível)</div>
              </>
            )}
          </div>
        )}
        {result && !result.error && (
          <button className="submit-btn" onClick={saveAsGoal}>
            <i className="ti ti-target" /> Salvar Custo como Meta
          </button>
        )}
      </div>
    </div>
  )
}
