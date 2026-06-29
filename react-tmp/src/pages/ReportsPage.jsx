import { useEffect, useRef } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL, formatCurrency } from '../utils/format'

export default function ReportsPage({ onNavigate, onNavigateGoals, onNavigateBudget }) {
  const { transactions, categories } = useData()
  const canvasRef = useRef(null)

  const totalIncome = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
  const totalExpense = transactions.filter(t => t.type === 'saída').reduce((s, t) => s + Math.abs(t.amount || 0), 0)

  const catTotals = {}
  transactions.forEach(t => {
    const allCats = [...(categories.saída || []), ...(categories.entrada || [])]
    const cat = allCats.find(c => c.id === t.cat)
    if (!cat) return
    const key = cat.id
    if (!catTotals[key]) catTotals[key] = { name: cat.name, icon: cat.icon, color: cat.color, total: 0, count: 0 }
    catTotals[key].total += Math.abs(t.amount || 0)
    catTotals[key].count += 1
  })
  const catEntries = Object.values(catTotals).sort((a, b) => b.total - a.total)
  const maxTotal = catEntries.length > 0 ? catEntries[0].total : 1

  const year = new Date().getFullYear()
  const monthly = {}
  for (let m = 0; m < 12; m++) monthly[m] = { income: 0, expense: 0 }
  transactions.forEach(t => {
    const d = t.createdAt ? t.createdAt.toDate() : new Date()
    if (d.getFullYear() !== year) return
    const m = d.getMonth()
    if (t.amount > 0) monthly[m].income += t.amount
    else monthly[m].expense += Math.abs(t.amount)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.parentElement.clientWidth || 320
    const h = 160
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const pad = { top: 16, bottom: 20, left: 4, right: 4 }
    const cw = w - pad.left - pad.right
    const ch = h - pad.top - pad.bottom

    const maxVal = Math.max(1, ...Object.values(monthly).map(m => Math.max(m.income, m.expense)))
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    const bodyStyle = getComputedStyle(document.body)
    const borderColor = bodyStyle.getPropertyValue('--border').trim() || '#eee'
    const textMuted = bodyStyle.getPropertyValue('--text-muted').trim() || '#999'
    const textMain = bodyStyle.getPropertyValue('--text-main').trim() || '#111'
    const colorIncome = bodyStyle.getPropertyValue('--primary').trim() || '#2ecc71'
    const colorExpense = '#c0392b'

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(w - pad.right, y)
      ctx.stroke()
      ctx.fillStyle = textMuted
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('R$' + Math.round(maxVal - (maxVal / 4) * i), pad.left - 2, y + 3)
    }

    ctx.fillStyle = textMuted
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    monthLabels.forEach((l, i) => ctx.fillText(l, pad.left + (cw / 11) * i, h - 4))

    function drawPoints(arr, color) {
      ctx.beginPath()
      arr.forEach((v, i) => {
        const x = pad.left + (cw / 11) * i
        const y = pad.top + ch - (v / maxVal) * ch
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.stroke()
      arr.forEach((v, i) => {
        const x = pad.left + (cw / 11) * i
        const y = pad.top + ch - (v / maxVal) * ch
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
    }

    drawPoints(Object.values(monthly).map(m => m.income), colorIncome)
    drawPoints(Object.values(monthly).map(m => m.expense), colorExpense)

    ctx.font = '10px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillStyle = colorIncome
    ctx.fillRect(w - 80, 4, 8, 8)
    ctx.fillStyle = textMain
    ctx.fillText('Receitas', w - 68, 12)
    ctx.fillStyle = colorExpense
    ctx.fillRect(w - 80, 18, 8, 8)
    ctx.fillStyle = textMain
    ctx.fillText('Despesas', w - 68, 26)
  }, [transactions])

  return (
    <div className="app page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Relatórios</span>
      </div>
      <div className="page-content">
        <div className="two-col" style={{ marginBottom: 16 }}>
          <div className="income-card">
            <div className="income-label">Receitas</div>
            <div className="income-amount" style={{ color: 'var(--primary)' }}>R$ {formatBRL(totalIncome)}</div>
          </div>
          <div className="income-card">
            <div className="income-label">Despesas</div>
            <div className="income-amount" style={{ color: '#c0392b' }}>R$ {formatBRL(totalExpense)}</div>
          </div>
        </div>
        <div className="annual-chart-wrap">
          <h4>Receitas vs Despesas · <span>{year}</span></h4>
          <canvas ref={canvasRef} id="annual-chart"></canvas>
        </div>
        <div className="section-row">
          <span className="section-label">Por categoria</span>
        </div>
        <div id="report-by-category">
          {catEntries.map(c => (
            <div key={c.name} className="report-cat-item">
              <div className="report-cat-icon" style={{ background: c.color + '22', color: c.color }}><i className={'ti ' + c.icon}></i></div>
              <div className="report-cat-info">
                <div className="report-cat-name">{c.name}</div>
                <div className="report-cat-count">{c.count} transação{c.count !== 1 ? 'ões' : ''}</div>
                <div className="report-cat-bar"><div className="report-cat-fill" style={{ width: ((c.total / maxTotal) * 100).toFixed(0) + '%', background: c.color }}></div></div>
              </div>
              <div className="report-cat-amount">R$ {formatBRL(c.total)}</div>
            </div>
          ))}
          {catEntries.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhuma transação</p>
          )}
        </div>
        <div className="section-title-new" style={{ marginTop: 16 }}><i className="ti ti-layers"></i> Ferramentas</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn side" style={{ flex: 1 }} onClick={onNavigateGoals}><i className="ti ti-target"></i> Metas</button>
          <button className="action-btn side" style={{ flex: 1 }} onClick={onNavigateBudget}><i className="ti ti-chart-pie"></i> Orçamento</button>
        </div>
      </div>
    </div>
  )
}
