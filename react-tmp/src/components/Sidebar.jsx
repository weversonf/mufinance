export default function Sidebar({ activePage, onNavigate }) {
  const tabs = [
    { page: 'home', icon: 'ti ti-home', label: 'Início' },
    { page: 'transactions', icon: 'ti ti-chart-bar', label: 'Extrato' },
    { page: 'reports', icon: 'ti ti-report', label: 'Relatórios' },
    { page: 'cards', icon: 'ti ti-credit-card', label: 'Cartões' },
    { page: 'goals', icon: 'ti ti-target', label: 'Metas' },
    { page: 'budget', icon: 'ti ti-chart-pie', label: 'Orçamento' },
    { page: 'profile', icon: 'ti ti-user', label: 'Perfil' },
  ]

  return (
    <nav className="desktop-sidebar">
      <div className="brand">
        <div className="brand-mark"><i className="ti ti-wallet"></i></div>
        <div className="brand-name">Mu Finance</div>
      </div>
      <nav>
        {tabs.map(tab => (
          <button
            key={tab.page}
            className={`d-tab${activePage === tab.page ? ' active' : ''}`}
            data-page={tab.page}
            onClick={() => onNavigate(tab.page)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className={`d-tab${activePage === 'settings' ? ' active' : ''}`}
          data-page="settings"
          onClick={() => onNavigate('settings')}
        >
          <i className="ti ti-settings"></i>
          <span>Configurações</span>
        </button>
      </div>
    </nav>
  )
}
