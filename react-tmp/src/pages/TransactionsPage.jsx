import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

function formatDateBR(value) {
  if (!value) return ''
  let d
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    d = new Date(value + 'T00:00:00')
  } else if (value?.toDate) {
    d = value.toDate()
  } else {
    d = new Date(value)
  }
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

function txDateISO(tx) {
  if (tx.date && /^\d{4}-\d{2}-\d{2}/.test(tx.date)) return tx.date.slice(0, 10)
  if (tx.createdAt) {
    const cd = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt)
    return cd.toISOString().slice(0, 10)
  }
  return ''
}

function txGroupLabel(iso) {
  if (!iso) return 'Sem data'
  const d = new Date(iso + 'T00:00:00')
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const diff = Math.round((new Date(todayStr + 'T00:00:00') - d) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  if (diff === -1) return 'Amanhã'
  return formatDateBR(iso)
}

export default function TransactionsPage({ onNavigate, onEditTransaction }) {
  const { transactions } = useData()
  const [filter, setFilter] = useState('all')
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthLabel = targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const monthTxs = useMemo(() => {
    return transactions.filter(t => {
      const iso = txDateISO(t)
      if (!iso) return false
      return iso.startsWith(targetDate.getFullYear() + '-' + String(targetDate.getMonth() + 1).padStart(2, '0'))
    })
  }, [transactions, targetDate])

  const filtered = filter === 'all' ? monthTxs : monthTxs.filter(t => t.type === filter)

  const groups = [...new Set(filtered.map(txDateISO))].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))

  const income = monthTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expense = monthTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const balance = income - expense

  return (
    <div className="app page" id="transactions-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Extrato</span>
      </div>

      <div className="filter-row" id="filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card-bg)', borderRadius: 10, padding: '2px 6px' }}>
          <button className="icon-btn" onClick={() => setMonthOffset(m => m - 1)}><i className="ti ti-chevron-left" style={{ fontSize: 14 }} /></button>
          <span style={{ fontSize: 11, fontWeight: 700, minWidth: 100, textAlign: 'center', color: 'var(--text-main)' }}>{monthLabel}</span>
          <button className="icon-btn" onClick={() => setMonthOffset(m => m + 1)}><i className="ti ti-chevron-right" style={{ fontSize: 14 }} /></button>
        </div>
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>Todas</button>
        <button className={'filter-chip' + (filter === 'entrada' ? ' active' : '')} onClick={() => setFilter('entrada')}>Entradas</button>
        <button className={'filter-chip' + (filter === 'saída' ? ' active' : '')} onClick={() => setFilter('saída')}>Saídas</button>
        <button className="filter-chip" onClick={() => onNavigate('reports')} style={{ marginLeft: 'auto' }}><i className="ti ti-report" style={{ fontSize: 13 }}></i> Relatórios</button>
      </div>

      <div className="page-content" id="all-tx-list">
        {groups.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Nenhuma transação neste mês</p>
        ) : groups.map(g => (
          <div key={g}>
            <div className="tx-group-label">{txGroupLabel(g)}</div>
            {filtered.filter(t => txDateISO(t) === g).map(tx => {
              const dataExibicao = formatDateBR(tx.date) || (tx.createdAt ? formatDateBR(tx.createdAt) : tx.date || '')
              return (
                <div key={tx.id} className="tx-item" style={{ opacity: tx.status === 'prevista' ? 0.6 : 1 }} onClick={() => onEditTransaction(tx)}>
                  <div className="tx-logo" style={{ background: tx.bg || 'var(--card-bg)', color: tx.color || 'var(--text-sec)' }}>
                    <i className={'ti ' + (tx.icon || 'ti-receipt')}></i>
                  </div>
                  <div className="tx-info">
                    <div className="tx-name">{tx.name || 'Transação'}{tx.status === 'prevista' ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}> (Prevista)</span> : ''}</div>
                    <div className="tx-date">{dataExibicao}</div>
                  </div>
                  <div className="tx-amount" style={{ color: tx.amount < 0 ? '#c0392b' : 'var(--primary)' }}>
                    {tx.amount < 0 ? '-' : '+'}R$ {formatBRL(Math.abs(tx.amount))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {monthTxs.length > 0 && (
          <div className="income-card" style={{ marginTop: 20, padding: 16 }}>
            <div className="section-label">Balanço do Mês</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>Receitas</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>R$ {formatBRL(income)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>Despesas</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#c0392b' }}>R$ {formatBRL(expense)}</span>
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Saldo</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: balance >= 0 ? 'var(--primary)' : '#c0392b' }}>R$ {formatBRL(balance)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
