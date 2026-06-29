import { useState } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function HomePage({ onNavigate, onOpenTx, onOpenNotif }) {
  const { transactions, notifications, profile } = useData()
  const [waterIntake, setWaterIntake] = useState(0)
  const [cafIntake, setCafIntake] = useState(0)
  const waterGoal = parseInt(profile.waterGoal) || 3500
  const cafGoal = parseInt(profile.cafGoal) || 400
  const balance = transactions.reduce((s, t) => s + (t.amount || 0), 0)
  const unreadNotifs = notifications.filter(n => !n.read).length

  const handleOpenNotif = () => { if (onOpenNotif) onOpenNotif() }

  return (
    <div className="app">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="greeting">
          <div className="greeting-left">
            <div className="profile-avatar-top">M</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Olá!</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bem-vindo à sua carteira</span>
            </div>
          </div>
          <div className="icons">
            <NotifBell count={unreadNotifs} onClick={handleOpenNotif} />
          </div>
        </div>
        <div className="balance-section">
          <div className="currency-badge"><i className="ti ti-coin" style={{ fontSize: 13 }} /> BRL</div>
          <div className="balance">
            <sup>R$</sup>
            {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[0]}
            <small>,{balance.toFixed(2).split('.')[1]}</small>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="action-btn side" onClick={() => onOpenTx?.('receive')}><i className="ti ti-plus" /></button>
        <button className="action-btn center-btn" onClick={() => onOpenTx?.('transfer')}><i className="ti ti-arrows-exchange" /></button>
        <button className="action-btn side" onClick={() => onOpenTx?.('send')}><i className="ti ti-minus" /></button>
      </div>

      {/* Content */}
      <div className="content">
        <IncomeExpenseCards transactions={transactions} />
        <MiniChart transactions={transactions} />
        <HealthSection
          waterIntake={waterIntake} setWaterIntake={setWaterIntake}
          cafIntake={cafIntake} setCafIntake={setCafIntake}
          waterGoal={waterGoal} cafGoal={cafGoal}
        />
        <RecentTransactions transactions={transactions} />
      </div>

    </div>
  )
}

function NotifBell({ count, onClick }) {
  return (
    <button className="icon-btn" style={{ position: 'relative' }} onClick={onClick}>
      <i className="ti ti-bell" />
      <span className={'notif-badge' + (count > 0 ? ' show' : '')} />
    </button>
  )
}

function IncomeExpenseCards({ transactions }) {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  return (
    <div className="two-col" style={{ marginBottom: 8 }}>
      <div className="income-card">
        <div className="income-label">Receitas</div>
        <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>R$ {formatBRL(income)}</div>
      </div>
      <div className="income-card">
        <div className="income-label">Despesas</div>
        <div className="income-amount" style={{ color: '#c0392b', fontSize: 16 }}>R$ {formatBRL(expense)}</div>
      </div>
    </div>
  )
}

function MiniChart({ transactions }) {
  const now = new Date()
  const monthIncome = transactions.filter(t => t.amount > 0 && t.createdAt?.toDate?.()?.getMonth() === now.getMonth()).reduce((s, t) => s + t.amount, 0)
  return (
    <div className="income-card" style={{ marginTop: 12 }}>
      <div className="income-label">Sua renda · Este mês</div>
      <div className="income-amount">R$ {formatBRL(monthIncome)}</div>
    </div>
  )
}

function HealthSection({ waterIntake, setWaterIntake, cafIntake, setCafIntake, waterGoal, cafGoal }) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const day = now.getDate()
  const month = now.toLocaleString('pt-BR', { month: 'long' })
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const waterPct = Math.min(100, (waterIntake / waterGoal) * 100)
  const cafPct = Math.min(100, (cafIntake / cafGoal) * 100)

  return (
    <div style={{ marginTop: 16 }}>
      <div className="section-title-new"><i className="ti ti-heartbeat" /> Saúde</div>
      <div className="two-col" style={{ marginBottom: 8 }}>
        <div className="income-card">
          <div className="income-label"><i className="ti ti-droplet" style={{ color: '#3B82F6' }} /> Água</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{waterIntake}ml / {waterGoal}ml</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${waterPct}%`, background: '#3B82F6', borderRadius: 4, transition: 'width .3s' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button className="filter-chip" onClick={() => setWaterIntake(Math.max(0, waterIntake - 200))}>-200ml</button>
            <button className="filter-chip" onClick={() => setWaterIntake(waterIntake + 200)}>+200ml</button>
            <button className="filter-chip" onClick={() => setWaterIntake(waterIntake + 500)}>+500ml</button>
          </div>
        </div>
        <div className="income-card">
          <div className="income-label"><i className="ti ti-coffee" style={{ color: '#A855F7' }} /> Cafeína</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{cafIntake}mg / {cafGoal}mg</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${cafPct}%`, background: cafPct > 80 ? '#c0392b' : '#A855F7', borderRadius: 4, transition: 'width .3s' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button className="filter-chip" onClick={() => setCafIntake(Math.max(0, cafIntake - 50))}>-50mg</button>
            <button className="filter-chip" onClick={() => setCafIntake(cafIntake + 50)}>+50mg</button>
            <button className="filter-chip" onClick={() => setCafIntake(cafIntake + 100)}>+100mg</button>
          </div>
        </div>
      </div>
      {/* Mini Calendar */}
      <div className="income-card" style={{ marginTop: 8 }}>
        <div className="income-label"><i className="ti ti-calendar" /> {month.charAt(0).toUpperCase() + month.slice(1)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginTop: 8, fontSize: 11, textAlign: 'center' }}>
          {weekDays.map(d => <div key={d} style={{ fontWeight: 700, color: 'var(--text-muted)', padding: 4 }}>{d}</div>)}
          {calendarDays.map((d, i) => (
            <div key={i} style={{
              padding: 6, borderRadius: 6, fontSize: 12, fontWeight: d === day ? 700 : 400,
              background: d === day ? 'var(--primary)' : 'transparent',
              color: d === day ? '#fff' : d ? 'var(--text-main)' : 'transparent',
            }}>{d || ''}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecentTransactions({ transactions }) {
  const recent = transactions.slice(0, 5)
  return (
    <div style={{ marginTop: 16 }}>
      <div className="section-title-new"><i className="ti ti-history" /> Recentes</div>
      {recent.map(t => (
        <div key={t.id} className="tx-item" style={{ opacity: t.status === 'prevista' ? 0.6 : 1 }}>
          <div className="tx-logo" style={{ background: t.bg || 'var(--card-bg)', color: t.color || 'var(--text-sec)' }}>
            <i className={'ti ' + (t.icon || 'ti-receipt')} />
          </div>
          <div className="tx-info">
            <div className="tx-name">{t.name || 'Transação'}</div>
            <div className="tx-cat">{t.status === 'prevista' ? 'Previsto' : 'Hoje'}</div>
          </div>
          <div className="tx-amount" style={{ color: t.amount < 0 ? '#c0392b' : 'var(--primary)' }}>
            {t.amount < 0 ? '-' : '+'}R$ {formatBRL(Math.abs(t.amount))}
          </div>
        </div>
      ))}
    </div>
  )
}


