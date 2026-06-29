import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

export default function ProfileEditModal({ field, currentValue, onClose, onSave }) {
  const { user } = useAuth()
  const labels = { name: 'Nome', email: 'Email', username: 'Nome de usuário (@)' }
  const inputType = field === 'email' ? 'email' : 'text'
  const [value, setValue] = useState(currentValue ? currentValue.replace('@', '') : '')

  const handleSubmit = async () => {
    const val = value.trim()
    if (!val) return alert('Preencha o campo')
    const update = {}
    if (field === 'username') {
      update.username = '@' + val.replace('@', '')
      update.usernameChangedAt = serverTimestamp()
    } else if (field === 'name') {
      update.name = val
    } else if (field === 'email') {
      update.email = val
    }
    await setDoc(doc(db, 'profile', 'me'), update, { merge: true })
    if (user) await setDoc(doc(db, 'profile', user.uid), update, { merge: true })
    if (onSave) onSave()
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Editar {labels[field] || field}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">{labels[field] || field}</label>
        <input className="field-input" type={inputType} value={value} onChange={e => setValue(e.target.value)} placeholder={labels[field]} />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
      </div>
    </div>
  )
}
