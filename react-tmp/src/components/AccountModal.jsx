import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'

const BANKS = [
  { value: 'nubank', label: 'Nubank' }, { value: 'inter', label: 'Banco Inter' }, { value: 'caixa', label: 'Caixa' },
  { value: 'bb', label: 'Banco do Brasil' }, { value: 'bradesco', label: 'Bradesco' }, { value: 'santander', label: 'Santander' },
  { value: 'itau', label: 'Itaú' }, { value: 'c6', label: 'C6 Bank' }, { value: 'original', label: 'Banco Original' },
  { value: 'pagbank', label: 'PagBank' }, { value: 'picpay', label: 'PicPay' }, { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'neon', label: 'Neon' }, { value: 'next', label: 'Next' }, { value: 'sofisa', label: 'Sofisa' },
]

export default function AccountModal({ editAccount, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('carteira')
  const [bank, setBank] = useState('')
  const [color, setColor] = useState('#1a7a4a')
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name || '')
      setType(editAccount.type || 'carteira')
      setBank(editAccount.bank || '')
      setColor(editAccount.color || '#1a7a4a')
      setBalance(editAccount.balance?.toString() || '')
    } else {
      setType('carteira')
      setBank('')
      setColor('#1a7a4a')
      setBalance('')
    }
  }, [editAccount])

  const showBank = type === 'corrente' || type === 'digital'

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Nome obrigatório')
    const data = { name: name.trim(), type, color, balance: parseFloat(balance) || 0 }
    if (bank) data.bank = bank
    if (editAccount) {
      await updateDoc(doc(db, 'accounts', editAccount.id), data)
    } else {
      await addDoc(collection(db, 'accounts'), data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editAccount) return
    if (editAccount.name === 'Carteira') { alert('A conta Carteira não pode ser excluída'); return }
    if (!confirm('Excluir?')) return
    await updateDoc(doc(db, 'accounts', editAccount.id), { deleted: true })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {editAccount ? 'Editar' : 'Adicionar'} Conta
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Nome</label>
        <input className="field-input" placeholder="Ex: Carteira, Nubank" value={name} onChange={e => setName(e.target.value)} />
        <label className="field-label">Tipo</label>
        <select className="field-input" value={type} onChange={e => { setType(e.target.value); if (e.target.value === 'carteira') setBank('') }}>
          <option value="carteira">Carteira</option>
          <option value="corrente">Conta Corrente</option>
          <option value="poupanca">Poupança</option>
          <option value="digital">Conta Digital</option>
        </select>
        {showBank && (
          <>
            <label className="field-label">Banco</label>
            <select className="field-input" value={bank} onChange={e => setBank(e.target.value)}>
              <option value="">Selecione</option>
              {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </>
        )}
        <label className="field-label">Cor</label>
        <input className="field-input" type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: 44, padding: 4 }} />
        <label className="field-label">Saldo Inicial (R$)</label>
        <input className="field-input" type="number" step="0.01" placeholder="0,00" value={balance} onChange={e => setBalance(e.target.value)} />
        <button className="submit-btn" onClick={handleSubmit}>Salvar</button>
        {editAccount && (
          <button className="submit-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 10 }}>Excluir Conta</button>
        )}
      </div>
    </div>
  )
}
