import { collection, addDoc, doc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function NotifModal({ open, onClose }) {
  const { user } = useAuth()
  const { notifications, profile } = useData()

  const handleAccept = async (requestId, fromUid, fromName, amount, desc) => {
    const now = serverTimestamp()
    await addDoc(collection(db, 'transactions'), {
      name: desc || `Pagamento para ${fromName}`, cat: 'p2p', subcat: null, date: 'Agora', amount: -amount, type: 'saida', icon: 'ti-hand-stop',
      bg: '#e67e2222', color: '#e67e22', group: 'Hoje', status: 'prevista', uid: user.uid,
      p2pSenderUid: fromUid, p2pCounterpartName: fromName, createdAt: now,
    })
    await addDoc(collection(db, 'transactions'), {
      name: desc || `Recebido de ${profile.name}`, cat: 'p2p', subcat: null, date: 'Agora', amount: amount, type: 'entrada', icon: 'ti-hand-stop',
      bg: '#e67e2222', color: '#e67e22', group: 'Hoje', status: 'prevista', uid: fromUid,
      p2pTargetUid: user.uid, p2pCounterpartName: profile.name, createdAt: now,
    })
    await addDoc(collection(db, 'notifications'), {
      uid: fromUid, message: `${profile.name} aceitou sua cobrança de R$ ${formatBRL(amount)}`, amount, type: 'recebido',
      from: profile.name, read: false, createdAt: now,
    })
    await deleteDoc(doc(db, 'p2p_requests', requestId))
    const notifSnap = await getDocs(query(collection(db, 'notifications'), where('p2pRequestId', '==', requestId)))
    notifSnap.forEach(d => deleteDoc(d.ref))
  }

  const handleReject = async (requestId) => {
    await deleteDoc(doc(db, 'p2p_requests', requestId))
    const notifSnap = await getDocs(query(collection(db, 'notifications'), where('p2pRequestId', '==', requestId)))
    notifSnap.forEach(d => deleteDoc(d.ref))
  }

  const handleMarkRead = async (id) => {
    const { updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  return (
    <div className={'modal-overlay' + (open ? ' open' : '')} onClick={e => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal">
        <h2>
          Notificações
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <div id="notif-list">
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhuma notificação</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="tx-item" style={n.read && n.type !== 'p2p_request' ? { opacity: 0.5 } : {}}>
                <div className="tx-logo" style={{
                  background: n.type === 'recebido' ? 'var(--primary-light)' : n.type === 'p2p_request' ? '#fff3e0' : '#f0e8fa',
                  color: n.type === 'recebido' ? 'var(--primary)' : n.type === 'p2p_request' ? '#e67e22' : '#7a4ab0'
                }}>
                  <i className={'ti ' + (n.type === 'recebido' ? 'ti-arrow-down-left' : n.type === 'p2p_request' ? 'ti-hand-stop' : 'ti-arrow-up-right')} />
                </div>
                <div className="tx-info" style={{ flex: 1 }}>
                  <div className="tx-name" onClick={() => handleMarkRead(n.id)}>{n.message}</div>
                  <div className="tx-date">{n.createdAt?.toDate?.()?.toLocaleString('pt-BR') || ''}</div>
                  {n.type === 'p2p_request' && (
                    <div className="notif-actions" style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button className="accept" onClick={() => handleAccept(n.p2pRequestId, n.fromUid, n.fromName, n.amount, n.desc)}
                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                        Aceitar
                      </button>
                      <button className="reject" onClick={() => handleReject(n.p2pRequestId)}
                        style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
                {!n.read && n.type !== 'p2p_request' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
