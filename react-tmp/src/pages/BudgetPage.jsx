import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function BudgetPage({ onNavigate, onEditBudgetLimit, onEditBudgetCat }) {
  const { budget, transactions, categories } = useData()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthSpent = useMemo(() => {
    return transactions.filter(t => {
      const d = t.createdAt ? t.createdAt.toDate() : null
      return d && t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).reduce((s, t) => s + Math.abs(t.amount), 0)
  }, [transactions, currentMonth, currentYear])

  const totalLimit = budget?.totalLimit || 0
  const pct = totalLimit > 0 ? Math.min((monthSpent / totalLimit) * 100, 100) : 0
  const barColor = pct > 90 ? '#c0392b' : pct > 70 ? '#e07a3a' : 'var(--primary)'
  const available = totalLimit - monthSpent

  const allCats = [...(categories.saída || []), ...(categories.entrada || [])]
  const budgetCats = budget?.cats || {}

  return (
    <div className="app page active">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Orçamento</span>
        <div style={{ flex: 1 }}></div>
        <button className="icon-btn" onClick={onEditBudgetLimit} title="Limite Total"><i className="ti ti-settings"></i></button>
      </div>
      <div className="page-content">
        <div className="income-card">
          <div className="section-row">
            <span className="section-label">Limite Mensal Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>R$ {formatBRL(totalLimit)}</span>
          </div>
          <div className="progress-bar-new">
            <div className="progress-fill-new" style={{ width: pct + '%', background: barColor }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>Gasto: <strong>R$ {formatBRL(monthSpent)}</strong></span>
            <span>Disponível: <strong>R$ {formatBRL(available)}</strong></span>
          </div>
        </div>

        <div className="section-title-new"><i className="ti ti-category"></i> Por Categoria</div>

        {Object.keys(budgetCats).length > 0 ? Object.entries(budgetCats).map(([catId, lim]) => {
          const cat = allCats.find(c => c.id === catId)
          const spent = transactions.filter(t => {
            const d = t.createdAt ? t.createdAt.toDate() : null
            return d && t.cat === catId && t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear
          }).reduce((s, t) => s + Math.abs(t.amount), 0)
          const cp = lim > 0 ? Math.min((spent / lim) * 100, 100) : 0
          const col = cp > 90 ? '#c0392b' : cp > 70 ? '#e07a3a' : 'var(--primary)'
          return (
            <div key={catId} className="budget-item-new">
              <div className="budget-header-new">
                <span className="b-name"><i className={'ti ' + (cat?.icon || 'ti-category')} style={{ color: cat?.color || '#888', marginRight: 4 }}></i> {cat?.name || catId}</span>
                <span className="b-amt"><span className="spent">R$ {formatBRL(spent)}</span> / R$ {formatBRL(lim)}</span>
              </div>
              <div className="progress-bar-new"><div className="progress-fill-new" style={{ width: cp + '%', background: col }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>{cp.toFixed(0)}%</span>
                <button className="section-link" onClick={() => onEditBudgetCat?.(catId)}>Editar</button>
              </div>
            </div>
          )
        }) : <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>Nenhum orçamento por categoria</div>}

        <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', fontSize: 13 }} onClick={() => onEditBudgetCat?.(null)}><i className="ti ti-plus"></i> Adicionar Categoria</button>
      </div>
    </div>
  )
}
