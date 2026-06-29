import { useData } from '../context/DataContext'

export default function ProfilePage({ onNavigate, onEditProfile, onToggleTheme, onSignOut, onEditAvatar }) {
  const { profile } = useData()
  const canChangeUsername = !profile.usernameChangedAt || (Date.now() - (profile.usernameChangedAt?.toDate?.()?.getTime() || 0)) > 90 * 24 * 60 * 60 * 1000
  const daysLeft = profile.usernameChangedAt ? Math.ceil(90 - (Date.now() - (profile.usernameChangedAt?.toDate?.()?.getTime() || 0)) / (24 * 60 * 60 * 1000)) : 0

  return (
    <div className="app page">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Perfil</span>
      </div>
      <div className="page-content">
        <div className="profile-header" id="profile-header">
          <div className="profile-avatar" style={{ cursor: 'pointer' }} onClick={() => onEditAvatar?.()}>
            {profile.photoURL ? <img src={profile.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (profile.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-name" id="profile-name">{profile.name || 'Usuário'}</div>
          <div className="profile-email" id="profile-email">{profile.email || ''}</div>
        </div>
        <div id="profile-fields">
          <div className="profile-field">
            <label>Nome</label>
            <div className="value">
              <span>{profile.name}</span>
              <button className="edit-btn" onClick={() => onEditProfile('name')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Sobrenome</label>
            <div className="value">
              <span>{profile.lastName || ''}</span>
              <button className="edit-btn" onClick={() => onEditProfile('lastName')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <div className="value">
              <span>{profile.email}</span>
              <button className="edit-btn" onClick={() => onEditProfile('email')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Usuário</label>
            <div className="value">
              <span>{profile.username}</span>
              <div>
                {canChangeUsername ? (
                  <button className="edit-btn" onClick={() => onEditProfile('username')}>Editar</button>
                ) : (
                  <span className="restriction">Altere em {daysLeft} dias</span>
                )}
              </div>
            </div>
          </div>
          <div className="profile-field">
            <label>Cidade</label>
            <div className="value">
              <span>{profile.cidade || 'Não definida'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('cidade')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Estado</label>
            <div className="value">
              <span>{profile.estado || 'Não definido'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('estado')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Fuso Horário</label>
            <div className="value">
              <span>{profile.fuso || 'America/Fortaleza'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('fuso')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Nascimento</label>
            <div className="value">
              <span>{profile.birthDate || 'Não definido'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('birthDate')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Peso (kg)</label>
            <div className="value">
              <span>{profile.weight || '-'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('weight')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Meta Água (ml)</label>
            <div className="value">
              <span>{profile.waterGoal || '3500'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('waterGoal')}>Editar</button>
            </div>
          </div>
          <div className="profile-field">
            <label>Limite Cafeína (mg)</label>
            <div className="value">
              <span>{profile.cafGoal || '400'}</span>
              <button className="edit-btn" onClick={() => onEditProfile('cafGoal')}>Editar</button>
            </div>
          </div>
        </div>
        <div className="menu-list">
          <div className="menu-item" onClick={onToggleTheme}>
            <i className="ti ti-moon"></i>
            <span>Modo Escuro</span>
            <div className="toggle-switch"></div>
          </div>
          <div className="menu-item" style={{ border: 'none' }} onClick={onSignOut}>
            <i className="ti ti-logout" style={{ color: '#c0392b' }}></i>
            <span style={{ color: '#c0392b' }}>Sair da Conta</span>
          </div>
        </div>
      </div>
    </div>
  )
}
