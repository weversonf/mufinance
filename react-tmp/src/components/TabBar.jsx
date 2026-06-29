export default function TabBar({ activePage, onNavigate, onFabClick }) {
  return (
    <div className="tab-bar">
      <button className={`tab${activePage === 'home' ? ' active' : ''}`} onClick={() => onNavigate('home')}>
        <i className="ti ti-home"></i>
        <span>Home</span>
      </button>

      <div className="tab-fab-wrap">
        <button className="tab-fab" onClick={onFabClick}><i className="ti ti-plus"></i></button>
      </div>

      <button className={`tab${activePage === 'profile' ? ' active' : ''}`} onClick={() => onNavigate('profile')}>
        <i className="ti ti-user"></i>
        <span>Profile</span>
      </button>
    </div>
  )
}
