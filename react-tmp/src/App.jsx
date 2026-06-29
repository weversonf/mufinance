import { useState, useEffect } from 'react'
import { doc, updateDoc, setDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase/config'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useData } from './context/DataContext'
import { ToastProvider, useToast } from './components/Toast'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TransactionsPage from './pages/TransactionsPage'
import CardsPage from './pages/CardsPage'
import ProfilePage from './pages/ProfilePage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import BudgetPage from './pages/BudgetPage'
import GoalsPage from './pages/GoalsPage'
import VehiclePage from './pages/VehiclePage'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import FabMenu from './components/FabMenu'
import PwaInstallBanner from './components/PwaInstallBanner'
import TxModal from './components/TxModal'
import CardModal from './components/CardModal'
import ProfileEditModal from './components/ProfileEditModal'
import NotifModal from './components/NotifModal'
import AccountModal from './components/AccountModal'
import GoalModal from './components/GoalModal'
import BudgetLimitModal from './components/BudgetLimitModal'
import BudgetCatModal from './components/BudgetCatModal'
import VehicleConfigModal from './components/VehicleConfigModal'
import RefuelModal from './components/RefuelModal'
import MaintModal from './components/MaintModal'
import RouteModal from './components/RouteModal'
import TripModal from './components/TripModal'
import TransferModal from './components/TransferModal'
import SubcatModal from './components/SubcatModal'
import AvatarModal from './components/AvatarModal'
import './index.css'

function AppShell() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <LoginPage />

  return (
    <DataProvider>
      <ToastProvider>
        <AppCore />
      </ToastProvider>
    </DataProvider>
  )
}

function AppCore() {
  const { user, logout } = useAuth()
  const { categories, profile, cards, accounts, goals, budget, vehicle, modules } = useData()
  const { showToast } = useToast()
  const [page, setPage] = useState('home')
  const [theme, setTheme] = useState(localStorage.getItem('mu_theme') || 'light')
  const [fabOpen, setFabOpen] = useState(false)
  const [pwaDeferred, setPwaDeferred] = useState(null)
  const [pwaDismissed, setPwaDismissed] = useState(false)

  // Modal states
  const [txModal, setTxModal] = useState({ open: false, type: 'send', editTx: null })
  const [cardModal, setCardModal] = useState({ open: false, editCard: null })
  const [profileEditModal, setProfileEditModal] = useState({ open: false, field: null, value: '' })
  const [notifModal, setNotifModal] = useState(false)
  const [accountModal, setAccountModal] = useState({ open: false, editAccount: null })
  const [goalModal, setGoalModal] = useState({ open: false, editGoal: null })
  const [budgetLimitModal, setBudgetLimitModal] = useState(false)
  const [budgetCatModal, setBudgetCatModal] = useState({ open: false, editBudgetCat: null })
  const [vehicleConfigModal, setVehicleConfigModal] = useState(false)
  const [refuelModal, setRefuelModal] = useState(false)
  const [maintModal, setMaintModal] = useState(false)
  const [routeModal, setRouteModal] = useState(false)
  const [tripModal, setTripModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [subcatModal, setSubcatModal] = useState({ open: false, categoryId: null, editSubcat: null })
  const [avatarModal, setAvatarModal] = useState(false)

  // Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('mu_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  // PWA
  useEffect(() => {
    const handler = e => { e.preventDefault(); setPwaDeferred(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installPWA = async () => {
    if (!pwaDeferred) return
    pwaDeferred.prompt()
    const result = await pwaDeferred.userChoice
    if (result.outcome === 'accepted') showToast('Instalado!')
    setPwaDeferred(null)
  }

  // Vehicle module toggle
  const toggleVehicleModule = async () => {
    const newVal = !modules?.vehicleActive
    await setDoc(doc(db, 'settings', 'modules'), { vehicleActive: newVal }, { merge: true })
    showToast(newVal ? 'Veículo ativado!' : 'Veículo desativado')
  }

  // FAB
  const handleFabClick = () => setFabOpen(o => !o)
  const handleFabSelect = type => {
    setFabOpen(false)
    if (type === 'send' || type === 'receive') setTxModal({ open: true, type, editTx: null })
    else if (type === 'transfer') setTransferModal(true)
    else if (type === 'vehicle') navigate('vehicle')
  }

  // Navigation
  const navigate = p => { setPage(p); setFabOpen(false) }

  // Page components map (render active page inside app for desktop sidebar)
  const renderPage = () => {
    const commonProps = { onNavigate: navigate }
    switch (page) {
      case 'home': return <HomePage key="home" {...commonProps} onOpenTx={t => { if (t === 'transfer') setTransferModal(true); else setTxModal({ open: true, type: t, editTx: null }) }} onOpenNotif={() => setNotifModal(true)} />
      case 'transactions': return <TransactionsPage key="tx" {...commonProps} onEditTransaction={tx => setTxModal({ open: true, type: tx.type || 'send', editTx: tx })} />
      case 'cards': return <CardsPage key="cards" {...commonProps} onEditCard={c => setCardModal({ open: true, editCard: c })} />
      case 'profile': return <ProfilePage key="profile" {...commonProps} onEditProfile={f => setProfileEditModal({ open: true, field: f, value: profile[f] || '' })} onToggleTheme={toggleTheme} onSignOut={logout} onEditAvatar={() => setAvatarModal(true)} />
      case 'reports': return <ReportsPage key="reports" {...commonProps} onNavigateGoals={() => navigate('goals')} onNavigateBudget={() => navigate('budget')} />
      case 'settings': return <SettingsPage key="settings" {...commonProps} onEditAccount={a => setAccountModal({ open: true, editAccount: a })} onEditCard={c => setCardModal({ open: true, editCard: c })} onToggleVehicleModule={toggleVehicleModule} onEditSubcat={(catId, sub) => setSubcatModal({ open: true, categoryId: catId, editSubcat: sub })} />
      case 'budget': return <BudgetPage key="budget" {...commonProps} onEditBudgetLimit={() => setBudgetLimitModal(true)} onEditBudgetCat={bc => setBudgetCatModal({ open: true, editBudgetCat: bc })} />
      case 'goals': return <GoalsPage key="goals" {...commonProps} onEditGoal={g => setGoalModal({ open: true, editGoal: g })} />
      case 'vehicle': return <VehiclePage key="vehicle" {...commonProps} onEditVehicle={() => setVehicleConfigModal(true)} onRefuel={() => setRefuelModal(true)} onMaint={() => setMaintModal(true)} onRoute={() => setRouteModal(true)} onCalcTrip={() => setTripModal(true)} />
      default: return <HomePage key="home" {...commonProps} />
    }
  }

  return (
    <div className="app-wrapper">
      <Sidebar activePage={page} onNavigate={navigate} />
      {renderPage()}

      {/* TabBar (mobile) */}
      <TabBar activePage={page} onNavigate={navigate} onFabClick={handleFabClick} />

      {/* FAB Menu */}
      <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} onSelect={handleFabSelect} />

      {/* PWA Install Banner */}
      {pwaDeferred && !pwaDismissed && (
        <div className="pwa-install-banner" style={{ display: 'flex' }} onClick={installPWA}>
          <i className="ti ti-download"></i>
          <span>Instalar Mu Finance</span>
          <button className="close-banner" onClick={e => { e.stopPropagation(); setPwaDismissed(true) }}>&times;</button>
        </div>
      )}

      {/* MODALS */}
      {txModal.open && <TxModal type={txModal.type} editTx={txModal.editTx} onClose={() => setTxModal({ open: false, type: 'send', editTx: null })} />}
      {cardModal.open && <CardModal editCard={cardModal.editCard} onClose={() => setCardModal({ open: false, editCard: null })} />}
      {profileEditModal.open && <ProfileEditModal field={profileEditModal.field} currentValue={profileEditModal.value} onClose={() => setProfileEditModal({ open: false, field: null, value: '' })} />}
      {notifModal && <NotifModal onClose={() => setNotifModal(false)} />}
      {accountModal.open && <AccountModal editAccount={accountModal.editAccount} onClose={() => setAccountModal({ open: false, editAccount: null })} />}
      {goalModal.open && <GoalModal editGoal={goalModal.editGoal} onClose={() => setGoalModal({ open: false, editGoal: null })} />}
      {budgetLimitModal && <BudgetLimitModal currentLimit={budget?.totalLimit || 0} onClose={() => setBudgetLimitModal(false)} onSave={async val => { await setDoc(doc(db, 'budget', 'current'), { totalLimit: val }, { merge: true }); setBudgetLimitModal(false); showToast('Limite salvo!') }} />}
      {budgetCatModal.open && <BudgetCatModal categories={categories.saida || []} editBudgetCat={budgetCatModal.editBudgetCat} onClose={() => setBudgetCatModal({ open: false, editBudgetCat: null })} onSave={async data => { const b = budget; b.cats[data.catId] = data.limit; await setDoc(doc(db, 'budget', 'current'), b, { merge: true }); setBudgetCatModal({ open: false, editBudgetCat: null }); showToast('Salvo!') }} />}
      {vehicleConfigModal && <VehicleConfigModal vehicle={vehicle} accounts={accounts} onClose={() => setVehicleConfigModal(false)} />}
      {refuelModal && <RefuelModal accounts={accounts} onClose={() => setRefuelModal(false)} />}
      {maintModal && <MaintModal accounts={accounts} onClose={() => setMaintModal(false)} />}
      {routeModal && <RouteModal accounts={accounts} onClose={() => setRouteModal(false)} />}
      {tripModal && <TripModal onClose={() => setTripModal(false)} />}
      {transferModal && <TransferModal accounts={accounts} onClose={() => setTransferModal(false)} />}
      {subcatModal.open && <SubcatModal categoryId={subcatModal.categoryId} editSubcat={subcatModal.editSubcat} onClose={() => setSubcatModal({ open: false, categoryId: null, editSubcat: null })} />}
      {avatarModal && <AvatarModal currentAvatar={profile.avatar} onClose={() => setAvatarModal(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
