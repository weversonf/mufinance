import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { useData } from '../context/DataContext'
import { formatCurrency, formatBRL } from '../utils/format'

Chart.register(...registerables)

export default function VehiclePage({ onNavigate, onEditVehicle, onRefuel, onMaint, onRoute, onCalcTrip }) {
  const { vehicle, refuels, maintenances, routes, vehicleHistory, accounts } = useData()
  const [tab, setTab] = useState('resumo')

  const consumptionRef = useRef(null)
  const weeklyRef = useRef(null)
  const consumoChartRef = useRef(null)
  const gastosChartRef = useRef(null)
  const consumptionChart = useRef(null)
  const weeklyChart = useRef(null)
  const evoChart = useRef(null)
  const gastosChart = useRef(null)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  function calcOilHealth() {
    if (!vehicle || !vehicle.oilKm) return { pct: 100, color: 'var(--primary)' }
    const lastOil = maintenances.filter(m => m.oilFlag || m.type === 'oleo')
      .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))[0]
    const lastKm = lastOil?.km || vehicle.oilKm
    const currentKm = refuels[0]?.km || 0
    const diff = currentKm - lastKm
    const ideal = vehicle.oilInterval || 10000
    const pct = Math.max(0, Math.min(100, 100 - (diff / ideal) * 100))
    return { pct: Math.round(pct), color: pct > 50 ? 'var(--primary)' : pct > 25 ? '#e07a3a' : '#c0392b' }
  }

  function calcConsumivelHealth(tipo) {
    const intervals = { oleo: vehicle?.oilInterval || 10000, corrente: vehicle?.correnteInterval || 20000, pneus: vehicle?.pneusInterval || 15000 }
    const ultima = maintenances.filter(m => m.type === tipo || m.oilFlag && tipo === 'oleo')
      .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))[0]
    const ultimoKm = ultima?.km || vehicle?.[tipo === 'oleo' ? 'oilKm' : tipo === 'pneus' ? 'pneusKm' : 'correnteKm'] || 0
    const currentKm = refuels[0]?.km || 0
    const diff = currentKm - ultimoKm
    const ideal = intervals[tipo] || 10000
    const pct = Math.max(0, Math.min(100, 100 - (diff / ideal) * 100))
    return { pct: Math.round(pct), color: pct > 50 ? 'var(--primary)' : pct > 25 ? '#e07a3a' : '#c0392b' }
  }

  function calcMedia() {
    if (vehicle?.consumo) return vehicle.consumo
    const fulls = refuels.filter(r => r.full)
    if (fulls.length < 2) return vehicle?.consumo || 0
    const last = fulls[0], prev = fulls[1]
    const kmDiff = last.km - prev.km
    if (kmDiff <= 0) return vehicle?.consumo || 0
    return kmDiff / (prev.liters || 1)
  }

  const health = {
    oleo: { label: 'Óleo', ...calcConsumivelHealth('oleo') },
    corrente: { label: 'Corrente/Relação', ...calcConsumivelHealth('corrente') },
    pneus: { label: 'Pneus', ...calcConsumivelHealth('pneus') },
  }

  const totalKm = refuels[0]?.km || 0
  const totalGasto = [...refuels, ...maintenances].reduce((s, i) => s + Math.abs(i.total ?? i.value ?? 0), 0)
  const media = calcMedia()
  const ultimoAbast = refuels[0]
  const lastOilMaint = maintenances.filter(m => m.oilFlag || m.type === 'oleo')
    .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))[0]
  const nextOilKm = lastOilMaint ? (lastOilMaint.km || 0) + (vehicle?.oilInterval || 10000) : (vehicle?.oilKm || 0) + (vehicle?.oilInterval || 10000)

  const gastoRefuelMensal = refuels.filter(r => {
    const d = r.createdAt?.toDate?.()
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, r) => s + Math.abs(r.total || 0), 0)
  const gastoMaintMensal = maintenances.filter(m => {
    const d = m.createdAt?.toDate?.()
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, m) => s + Math.abs(m.value || 0), 0)
  const gastoMensal = gastoRefuelMensal + gastoMaintMensal

  const cpk = totalKm > 0 ? (refuels.reduce((s, r) => s + Math.abs(r.total || 0), 0) / totalKm) : 0

  const kmPorDia = Array(7).fill(0)
  routes.forEach(r => {
    const d = r.createdAt?.toDate?.()
    if (d) kmPorDia[d.getDay()] += r.distance || r.km || 0
  })
  const diasComRota = kmPorDia.filter(v => v > 0).length
  const mediaDiaria = diasComRota > 0 ? Math.round(routes.reduce((s, r) => s + (r.distance || r.km || 0), 0) / Math.max(1, diasComRota)) : 0
  const picoDia = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][kmPorDia.indexOf(Math.max(...kmPorDia))]

  useEffect(() => {
    if (!vehicle || !consumptionRef.current || !weeklyRef.current) return
    if (consumptionChart.current) { consumptionChart.current.destroy(); consumptionChart.current = null }
    if (weeklyChart.current) { weeklyChart.current.destroy(); weeklyChart.current = null }

    const fulls = [...refuels].filter(r => r.full).reverse()
    if (fulls.length >= 2) {
      const labels = fulls.slice(1).map((_, i) => '#' + (i + 2))
      const data = []
      for (let i = 1; i < fulls.length; i++) {
        const kmDiff = fulls[i].km - fulls[i - 1].km
        const litros = fulls[i - 1].liters || 1
        data.push(kmDiff > 0 ? kmDiff / litros : 0)
      }
      consumptionChart.current = new Chart(consumptionRef.current, {
        type: 'line',
        data: { labels, datasets: [{ label: 'km/L', data, borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      })
    }

    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    weeklyChart.current = new Chart(weeklyRef.current, {
      type: 'bar',
      data: { labels: dias, datasets: [{ label: 'km', data: kmPorDia, backgroundColor: '#7C3AED' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    })

    return () => {
      if (consumptionChart.current) consumptionChart.current.destroy()
      if (weeklyChart.current) weeklyChart.current.destroy()
    }
  }, [vehicle, refuels, routes])

  useEffect(() => {
    if (tab !== 'relatorio') return
    if (evoChart.current) { evoChart.current.destroy(); evoChart.current = null }
    if (gastosChart.current) { gastosChart.current.destroy(); gastosChart.current = null }

    const fulls = [...refuels].filter(r => r.full).reverse()
    if (fulls.length >= 2 && consumoChartRef.current) {
      const labels = fulls.slice(1).map((_, i) => '#' + (i + 2))
      const data = []
      for (let i = 1; i < fulls.length; i++) {
        const kmDiff = fulls[i].km - fulls[i - 1].km
        const litros = fulls[i - 1].liters || 1
        data.push(kmDiff > 0 ? kmDiff / litros : 0)
      }
      evoChart.current = new Chart(consumoChartRef.current, {
        type: 'line',
        data: { labels, datasets: [{ label: 'km/L', data, borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      })
    }

    if (gastosChartRef.current) {
      const totalComb = refuels.reduce((s, r) => s + Math.abs(r.total || 0), 0)
      const totalMaint = maintenances.reduce((s, m) => s + Math.abs(m.value || 0), 0)
      gastosChart.current = new Chart(gastosChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Combustível', 'Manutenção'],
          datasets: [{ data: [totalComb, totalMaint], backgroundColor: ['#e07a3a', '#7C3AED'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      })
    }

    return () => {
      if (evoChart.current) evoChart.current.destroy()
      if (gastosChart.current) gastosChart.current.destroy()
    }
  }, [tab, refuels, maintenances])

  function getHistoryDate(t) {
    const d = t.createdAt?.toDate?.()
    if (!d) return ''
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatValue(v) {
    return Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  if (!vehicle) {
    return (
      <div className="app page" id="vehicle-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left" /></button>
          <span className="page-title">Veículo</span>
          <div style={{ flex: 1 }} />
        </div>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}><i className="ti ti-car" /></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Nenhum veículo cadastrado</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Adicione um veículo para começar a controlar abastecimentos, manutenções e rotas.</div>
          <button className="submit-btn" onClick={onEditVehicle}><i className="ti ti-plus" /> Adicionar Veículo</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app page" id="vehicle-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left" /></button>
        <div>
          <div className="page-title">{vehicle.name || 'Veículo'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Total: {totalKm.toLocaleString('pt-BR')} km</div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="icon-btn" onClick={onEditVehicle} title="Configurar Veículo"><i className="ti ti-settings" /></button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '0 18px', marginBottom: 8 }}>
        <button className={'filter-chip' + (tab === 'resumo' ? ' active' : '')} onClick={() => setTab('resumo')}>Resumo</button>
        <button className={'filter-chip' + (tab === 'relatorio' ? ' active' : '')} onClick={() => setTab('relatorio')}>Relatório</button>
      </div>

      <div className="page-content">
        {tab === 'resumo' && (
          <>
            <div className="income-card">
              <div className="section-label">Saúde do Veículo</div>
              <div className="v-health">
                {Object.entries(health).map(([key, h]) => (
                  <div key={key} className="v-health-item">
                    <span className="v-lbl">{h.label}</span>
                    <div className="v-bar">
                      <div className="v-fill" style={{ width: h.pct + '%', background: h.color }} />
                    </div>
                    <span className="v-pct" style={{ color: h.color }}>{h.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="two-col">
              <div className="income-card">
                <span className="income-label">Média km/L</span>
                <div className="income-amount" style={{ color: '#e07a3a', fontSize: 16 }}>{media.toFixed(1)}</div>
              </div>
              <div className="income-card">
                <span className="income-label">Próx. Manutenção</span>
                <div className="income-amount" style={{ color: '#3b82f6', fontSize: 16 }}>{nextOilKm.toLocaleString('pt-BR')} km</div>
              </div>
            </div>

            <div className="two-col">
              <div className="income-card">
                <span className="income-label">Total Gasto</span>
                <div className="income-amount" style={{ color: '#c0392b', fontSize: 16 }}>{formatCurrency(totalGasto)}</div>
              </div>
              <div className="income-card">
                <span className="income-label">KM Total</span>
                <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>{totalKm.toLocaleString('pt-BR')} <small style={{ fontSize: 12, fontWeight: 400 }}>km</small></div>
              </div>
              <div className="income-card">
                <span className="income-label">Consumo Médio</span>
                <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>{media.toFixed(1)} <small style={{ fontSize: 12, fontWeight: 400 }}>km/L</small></div>
              </div>
              <div className="income-card">
                <span className="income-label">Último Abastecimento</span>
                <div className="income-amount" style={{ color: 'var(--text-sec)', fontSize: 14 }}>
                  {ultimoAbast ? (ultimoAbast.createdAt?.toDate?.() || new Date()).toLocaleDateString('pt-BR') : '---'}
                </div>
              </div>
            </div>

            <div className="action-row" style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onRefuel}><i className="ti ti-gas-station" /> <span style={{ fontSize: 10 }}>Abastecer</span></button>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onMaint}><i className="ti ti-tool" /> <span style={{ fontSize: 10 }}>Manutenção</span></button>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onRoute}><i className="ti ti-map-2" /> <span style={{ fontSize: 10 }}>Rota</span></button>
              <button className="action-btn side" style={{ flex: 1 }} onClick={onCalcTrip}><i className="ti ti-map-pin" /> <span style={{ fontSize: 10 }}>Viajar</span></button>
            </div>

            {routes.length > 0 && (
              <div className="income-card">
                <div className="section-row">
                  <span className="section-label">Inteligência de Rodagem</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                  <span>Média Diária: <strong>{mediaDiaria} km/dia</strong></span>
                  <span>Pico: <strong>{picoDia}</strong></span>
                </div>
                <div className="chart-wrap-new" style={{ marginTop: 8 }}>
                  <canvas ref={weeklyRef} style={{ height: 120 }} />
                </div>
                <div className="income-card" style={{ marginTop: 8, padding: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="ti ti-calendar" style={{ color: '#7C3AED' }} />
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#7C3AED' }}>Previsão de Manutenção</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Próxima troca de óleo estimada para: <span style={{ color: '#7C3AED' }}>~{nextOilKm.toLocaleString('pt-BR')} km</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="chart-wrap-new">
              <h4>Evolução do Consumo (km/L) · Meta: {vehicle.consumo || 29} km/L</h4>
              <div className="chart-canvas-box">
                <canvas ref={consumptionRef} />
              </div>
            </div>
          </>
        )}

        {tab === 'relatorio' && (
          <>
            <div className="section-title-new"><i className="ti ti-report" /> Relatório de Inteligência</div>
            <div className="two-col">
              <div className="income-card">
                <span className="income-label">Média Real</span>
                <div className="income-amount" style={{ color: '#e07a3a', fontSize: 16 }}>{media.toFixed(1)} km/L</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Meta: {vehicle.consumo || 29} km/L</div>
              </div>
              <div className="income-card">
                <span className="income-label">Custo por KM</span>
                <div className="income-amount" style={{ color: '#3b82f6', fontSize: 16 }}>R$ {cpk.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>R$ por km</div>
              </div>
              <div className="income-card">
                <span className="income-label">Próx. Troca Óleo</span>
                <div className="income-amount" style={{ color: 'var(--primary)', fontSize: 16 }}>{nextOilKm.toLocaleString('pt-BR')} km</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>km restantes</div>
              </div>
              <div className="income-card">
                <span className="income-label">Gasto Mensal</span>
                <div className="income-amount" style={{ color: '#c0392b', fontSize: 16 }}>R$ {formatCurrency(gastoMensal)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Combustível + Manutenção</div>
              </div>
            </div>

            <div className="income-card" style={{ padding: 12 }}>
              <span className="section-label" style={{ fontSize: 10 }}>Evolução do Consumo (km/L)</span>
              <div className="chart-canvas-box" style={{ height: 100 }}>
                <canvas ref={consumoChartRef} />
              </div>
            </div>

            <div className="income-card" style={{ padding: 12 }}>
              <span className="section-label" style={{ fontSize: 10 }}>Saúde dos Consumíveis</span>
              {Object.entries(health).map(([key, h]) => (
                <div key={key} style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-sec)' }}>{h.label}</span>
                    <span style={{ fontWeight: 700, color: h.color }}>{h.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: h.pct + '%', height: '100%', background: h.color, borderRadius: 6, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="income-card" style={{ padding: 12 }}>
              <span className="section-label" style={{ fontSize: 10 }}>Distribuição de Gastos</span>
              <div className="chart-canvas-box" style={{ height: 120 }}>
                <canvas ref={gastosChartRef} />
              </div>
            </div>
          </>
        )}

        <div className="section-title-new" style={{ marginTop: 16 }}><i className="ti ti-history" /> Histórico</div>
        <div id="v-timeline">
          {vehicleHistory.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: 8, fontSize: 13 }}>Nenhum registro</div>
          ) : (
            vehicleHistory.slice(0, 50).map(item => {
              const icons = { refuel: 'ti-gas-station', maintenance: 'ti-tool', route: 'ti-map-2' }
              const colors = { refuel: '#e07a3a', maintenance: '#c0392b', route: 'var(--primary)' }
              const titles = {
                refuel: 'Abastecimento',
                maintenance: 'Manutenção: ' + (item.desc || item.type || ''),
                route: 'Rota: ' + (item.origin || '') + ' → ' + (item.dest || '')
              }
              const isFin = item._type === 'refuel' || item._type === 'maintenance'
              return (
                <div key={item.id + '-' + item._type} className="v-hist-item">
                  <div className="v-hist-icon" style={{ background: colors[item._type] + '22', color: colors[item._type] }}>
                    <i className={'ti ' + (icons[item._type] || 'ti-car')} />
                  </div>
                  <div className="v-hist-info">
                    <div className="vh-t">{titles[item._type] || ''}</div>
                    <div className="vh-s">
                      {isFin ? 'R$ ' + formatValue(item.total ?? item.value ?? 0) + ' · ' : ''}
                      {item.km || ''} km · {getHistoryDate(item)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
