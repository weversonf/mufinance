import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function TxModal({ type, editTx, onClose, onSave }) {
  const { user } = useAuth()
  const { categories, profile } = useData()
  const isSend = type === 'send'
  const catType = isSend ? 'saida' : 'entrada'
  const catList = categories[catType] || []
  const isEditing = !!editTx

  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSubcat, setSelectedSubcat] = useState(null)
  const [status, setStatus] = useState('efetivada')
  const [p2pOn, setP2pOn] = useState(false)
  const [p2pQuery, setP2pQuery] = useState('')
  const [p2pUser, setP2pUser] = useState(null)
  const [p2pResults, setP2pResults] = useState([])
  const [recurring, setRecurring] = useState(false)
  const [recurMonths, setRecurMonths] = useState(12)
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (editTx) {
      setAmount(Math.abs(editTx.amount).toString())
      setDesc(editTx.name || '')
      setSelectedCat(editTx.cat || null)
      setSelectedSubcat(editTx.subcat || null)
      setStatus(editTx.status || 'efetivada')
      if (editTx.date && /^\d{4}-\d{2}-\d{2}/.test(editTx.date)) {
        setTxDate(editTx.date.slice(0, 10))
      } else if (editTx.createdAt) {
        const cd = editTx.createdAt.toDate ? editTx.createdAt.toDate() : new Date(editTx.createdAt)
        setTxDate(cd.toISOString().slice(0, 10))
      }
    }
  }, [editTx])

  const handleCatSelect = (id) => {
    setSelectedCat(id)
    setSelectedSubcat(null)
  }

  const handleP2pSearch = async (val) => {
    setP2pQuery(val)
    setP2pUser(null)
    if (!val || val.length < 1) { setP2pResults([]); return }
    const q = val.startsWith('@') ? val : '@' + val
    try {
      const snap = await getDocs(
        query(collection(db, 'profile'), where('username', '>=', q.toLowerCase()), where('username', '<=', q.toLowerCase() + '\uf8ff'), limit(5))
      )
      const users = []
      snap.forEach(d => { if (d.id !== user.uid) users.push({ uid: d.id, ...d.data() }) })
      setP2pResults(users)
    } catch (e) { console.error(e) }
  }

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!selectedCat || !amt || amt <= 0) return alert('Preencha os campos obrigatórios')
    const cat = catList.find(c => c.id === selectedCat)
    if (!cat) return

    let displayName = desc || cat.name
    if (selectedSubcat) {
      const sub = cat.subcats?.find(s => s.id === selectedSubcat)
      if (sub) displayName = desc ? `${desc} (${sub.name})` : sub.name
    }

    const txAmt = isSend ? -amt : amt

    const txData = {
      name: displayName,
      cat: selectedCat,
      subcat: selectedSubcat || null,
      date: txDate,
      amount: txAmt,
      type: catType,
      icon: cat.icon || 'ti-receipt',
      bg: (cat.color || '#888') + '22',
      color: cat.color || '#888',
      group: status === 'prevista' ? 'Previsto' : 'Hoje',
      status,
      uid: user.uid,
    }

    if (p2pUser) {
      txData.p2pCounterpartName = p2pUser.name
      if (isSend) txData.p2pTargetUid = p2pUser.uid
      else txData.p2pSenderUid = p2pUser.uid
    }

    if (isEditing) {
      await updateDoc(doc(db, 'transactions', editTx.id), txData)
    } else {
      const months = recurring ? Math.max(1, recurMonths) : 1
      const groupId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      const baseDate = new Date(txDate + 'T00:00:00')
      for (let i = 0; i < months; i++) {
        const parcela = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate())
        const parcelaISO = parcela.toISOString().slice(0, 10)
        const copy = { ...txData, date: parcelaISO, createdAt: i === 0 ? serverTimestamp() : serverTimestamp() }
        if (i > 0) { copy.status = 'prevista'; copy.group = 'Previsto' }
        if (recurring) copy.recurGroup = groupId
        await addDoc(collection(db, 'transactions'), copy)
      }

      if (p2pUser) {
        if (isSend) {
          await addDoc(collection(db, 'transactions'), {
            name: displayName, cat: selectedCat, subcat: selectedSubcat || null, date: txDate, amount: amt, type: 'entrada', icon: cat.icon || 'ti-receipt', bg: (cat.color || '#888') + '22', color: cat.color || '#888', group: 'Previsto', status: 'prevista', uid: p2pUser.uid, p2pCounterpartName: profile.name, p2pSenderUid: user.uid, createdAt: serverTimestamp(),
          })
          await addDoc(collection(db, 'notifications'), {
            uid: p2pUser.uid, message: `${profile.name} enviou R$ ${formatBRL(amt)}${desc ? ' — ' + desc : ''}`, amount: amt, type: 'recebido', from: profile.name, read: false, createdAt: serverTimestamp(),
          })
        } else {
          const reqRef = await addDoc(collection(db, 'p2p_requests'), {
            fromUid: user.uid, fromName: profile.name, fromEmail: user.email || '', toUid: p2pUser.uid, toEmail: '', amount: amt, desc: desc || `Cobrança de ${profile.name}`, status: 'pending', createdAt: serverTimestamp(),
          })
          await addDoc(collection(db, 'notifications'), {
            uid: p2pUser.uid, type: 'p2p_request', fromUid: user.uid, fromName: profile.name, amount: amt, desc: desc || `Cobrança de ${profile.name}`, message: `${profile.name} está cobrando R$ ${formatBRL(amt)}${desc ? ' — ' + desc : ''}`, p2pRequestId: reqRef.id, read: false, createdAt: serverTimestamp(),
          })
        }
      }
    }

    if (onSave) onSave()
    onClose()
  }

  const handleDelete = async () => {
    if (!editTx) return
    if (!confirm('Deseja excluir esta transação?')) return
    await updateDoc(doc(db, 'transactions', editTx.id), { deleted: true })
    if (onSave) onSave()
    onClose()
  }

  const selectedCatData = selectedCat ? catList.find(c => c.id === selectedCat) : null
  const hasSubcats = selectedCatData?.subcats?.length > 0

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          {isEditing ? 'Editar Transação' : isSend ? 'Nova Despesa' : 'Nova Receita'}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>

        <div className="tx-val-wrap">
          <input className="tx-val-input" type="number" placeholder="0,00" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          <span className="tx-val-currency">R$</span>
        </div>

        <label className="field-label">Data</label>
        <input className="field-input" type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />

        <label className="field-label">Categoria</label>
        <div className="category-scroll" id="modal-categories">
          {catList.map(c => (
            <div key={c.id} className={'cat-item' + (selectedCat === c.id ? ' selected' : '')} onClick={() => handleCatSelect(c.id)}>
              <div className="cat-icon"><i className={'ti ' + (c.icon || 'ti-question-mark')} /></div>
              <div className="cat-name">{c.name}</div>
            </div>
          ))}
        </div>

        {hasSubcats && (
          <>
            <label className="field-label">Subcategoria</label>
            <div className="category-scroll" id="modal-subcategories">
              {selectedCatData.subcats.map(sub => (
                <div key={sub.id} className={'cat-item' + (selectedSubcat === sub.id ? ' selected' : '')} onClick={() => setSelectedSubcat(sub.id)}>
                  <div className="cat-icon" style={{ fontSize: 14, width: 32, height: 32, borderRadius: 8 }}><i className="ti ti-corner-down-right" /></div>
                  <div className="cat-name">{sub.name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <label className="field-label">Descrição</label>
        <input className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Salário, Aluguel" />

        {!isEditing && (
          <>
            <div className="p2p-toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div className={'toggle-switch' + (p2pOn ? ' active' : '')} onClick={() => { setP2pOn(!p2pOn); setP2pUser(null); setP2pQuery(''); setP2pResults([]) }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{isSend ? 'Enviar para amigo' : 'Cobrar de amigo'}</span>
            </div>

            {p2pOn && (
              <div style={{ marginBottom: 12 }}>
                <input className="field-input" placeholder="@usuario" value={p2pQuery} onChange={e => handleP2pSearch(e.target.value)} autoComplete="off" />
                {p2pResults.length > 0 && p2pResults.map(u => (
                  <div key={u.uid} className={'p2p-search-result' + (p2pUser?.uid === u.uid ? ' selected' : '')} onClick={() => setP2pUser({ uid: u.uid, name: u.name || '', username: u.username || '' })}>
                    <div className="av">{(u.name || '?').charAt(0).toUpperCase()}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.username}</div></div>
                  </div>
                ))}
                {p2pUser && (
                  <div className="p2p-search-result selected" style={{ marginTop: 6 }}>
                    <div className="av" style={{ background: 'var(--primary)', color: '#fff' }}>{p2pUser.name.charAt(0).toUpperCase()}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{p2pUser.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p2pUser.username}</div></div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <button className={'filter-chip' + (status === 'efetivada' ? ' active' : '')} onClick={() => setStatus('efetivada')} style={{ fontSize: 11, padding: '5px 10px' }}>Efetivada</button>
            <button className={'filter-chip' + (status === 'prevista' ? ' active' : '')} onClick={() => setStatus('prevista')} style={{ fontSize: 11, padding: '5px 10px' }}>Prevista</button>
          </div>
          {!isEditing && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={'toggle-switch' + (recurring ? ' active' : '')} onClick={() => setRecurring(!recurring)} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-main)' }}>Recorrente</span>
              </div>
              {recurring && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input className="field-input" type="number" min="1" max="60" value={recurMonths} onChange={e => setRecurMonths(parseInt(e.target.value) || 1)} style={{ width: 44, padding: '3px 4px', textAlign: 'center', margin: 0, fontSize: 11 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>meses</span>
                </div>
              )}
            </>
          )}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>Confirmar</button>
        {isEditing && (
          <button className="submit-btn" onClick={handleDelete} style={{ background: '#c0392b', marginTop: 10 }}>Excluir Transação</button>
        )}
      </div>
    </div>
  )
}
