import { useData } from '../context/DataContext'
import { formatBRL } from '../utils/format'

export default function GoalsPage({ onNavigate, onEditGoal }) {
  const { goals } = useData()

  return (
    <div className="app page active">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Metas de Economia</span>
        <div style={{ flex: 1 }}></div>
        <button className="icon-btn" onClick={() => onEditGoal?.(null)} title="Nova Meta"><i className="ti ti-plus"></i></button>
      </div>
      <div className="page-content">
        {goals.length > 0 ? goals.map(g => {
          const pct = g.target > 0 ? Math.min((g.saved || 0) / g.target * 100, 100) : 0
          return (
            <div key={g.id} className="goal-item-new" style={{ cursor: 'pointer' }} onClick={() => onEditGoal?.(g)}>
              <div className="g-name">{g.name}</div>
              <div className="goal-progress-new">
                <div className="gp-bar"><div className="gp-fill" style={{ width: pct + '%' }}></div></div>
                <span className="gp-pct">{pct.toFixed(0)}%</span>
              </div>
              <div className="goal-values-new">R$ {formatBRL(g.saved || 0)} de R$ {formatBRL(g.target || 0)}</div>
            </div>
          )
        }) : <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhuma meta</div>}
      </div>
    </div>
  )
}
