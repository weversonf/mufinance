import { useState } from 'react'

export default function BudgetLimitModal({ currentLimit, onClose, onSave }) {
  const [limit, setLimit] = useState(currentLimit?.toString() || '')

  const handleSubmit = () => {
    onSave(parseFloat(limit) || 0)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Limite Mensal Total
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Limite (R$)</label>
        <input className="field-input" type="number" step="0.01" min="0" value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000" />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
      </div>
    </div>
  )
}
