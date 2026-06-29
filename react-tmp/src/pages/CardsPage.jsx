import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function CardsPage({ onNavigate, onEditCard }) {
  const { cards, transactions, accounts } = useData()

  const cardSpending = useMemo(() => {
    const map = {}
    cards.forEach(c => { map[c.id] = 0 })
    transactions.forEach(t => {
      const acc = accounts.find(a => a.name === t.account || a.cardId === t.cat)
      if (!acc) return
      const card = cards.find(c => c.id === acc.cardId || c.name === acc.name)
      if (card && t.amount < 0) map[card.id] = (map[card.id] || 0) + Math.abs(t.amount)
    })
    return map
  }, [cards, transactions, accounts])

  const totalSpent = Object.values(cardSpending).reduce((s, v) => s + v, 0)

  return (
    <div className="app page" id="cards-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Cartões de Crédito</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn" onClick={() => onEditCard(null)} title="Adicionar Cartão"><i className="ti ti-plus" /></button>
      </div>
      <div className="page-content">
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}><i className="ti ti-credit-card" /></div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Nenhum cartão cadastrado</div>
            <div style={{ fontSize: 12, marginBottom: 20 }}>Adicione seus cartões de crédito para controlar gastos.</div>
            <button className="submit-btn" onClick={() => onEditCard(null)} style={{ width: 'auto', padding: '10px 24px' }}><i className="ti ti-plus" /> Adicionar</button>
          </div>
        ) : (
          <>
            <div className="card-carousel-wrapper" style={{ overflowX: 'auto', display: 'flex', gap: 12, padding: '4px 0 12px', scrollSnapType: 'x mandatory' }}>
              {cards.map(c => (
                <div key={c.id}
                  className="card-item"
                  style={{
                    background: `linear-gradient(135deg, ${c.color || '#1a7a4a'}, ${c.colorDark || '#2d5a43'})`,
                    minWidth: 240, padding: 18, borderRadius: 16, cursor: 'pointer', scrollSnapAlign: 'start',
                    position: 'relative', overflow: 'hidden'
                  }}
                  onClick={() => onEditCard(c)}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 16 }}>{c.type || 'Visa'}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{c.number || '**** **** **** 0000'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 8, opacity: 0.6, textTransform: 'uppercase' }}>Titular</div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{(c.holder || '').toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{c.expiry || '00/00'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="income-card" style={{ padding: 16 }}>
              <div className="section-label">Resumo de Gastos</div>
              {cards.map(c => {
                const spent = cardSpending[c.id] || 0
                const pct = cards.reduce((s, cc) => s + (cardSpending[cc.id] || 0), 0) > 0
                  ? (spent / totalSpent) * 100 : 0
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color || '#1a7a4a', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ fontWeight: 600 }}>{c.holder || c.type}</span>
                        <span style={{ fontWeight: 700 }}>R$ {formatBRL(spent)}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: pct + '%', height: '100%', background: c.color || '#1a7a4a', borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {cards.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>Nenhum gasto registrado</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
