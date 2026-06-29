import { createContext, useContext, useEffect, useState } from 'react'
import { collection, onSnapshot, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({ saida: [], entrada: [] })
  const [profile, setProfile] = useState({ name: 'Usuário', email: '', username: '' })
  const [notifications, setNotifications] = useState([])
  const [cards, setCards] = useState([])
  const [contacts, setContacts] = useState([])
  const [goals, setGoals] = useState([])
  const [budget, setBudget] = useState({ totalLimit: 0, cats: {} })
  const [accounts, setAccounts] = useState([])
  const [vehicle, setVehicle] = useState(null)
  const [refuels, setRefuels] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [routes, setRoutes] = useState([])
  const [vehicleHistory, setVehicleHistory] = useState([])
  const [modules, setModules] = useState({ vehicleActive: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setNotifications([])
      setCards([])
      setContacts([])
      setGoals([])
      setBudget({ totalLimit: 0, cats: {} })
      setAccounts([])
      setVehicle(null)
      setRefuels([])
      setMaintenances([])
      setRoutes([])
      setVehicleHistory([])
      setModules({ vehicleActive: false })
      setLoading(false)
      return
    }
    setLoading(true)

    const unsubs = [
      onSnapshot(collection(db, 'transactions'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0
          const bT = b.createdAt?.toDate?.()?.getTime() || 0
          return bT - aT
        })
        setTransactions(list)
      }),

      onSnapshot(collection(db, 'categories'), snap => {
        const cats = { saida: [], entrada: [] }
        snap.forEach(d => {
          const data = d.data()
          const type = data.type === 'entrada' ? 'entrada' : 'saida'
          if (cats[type]) cats[type].push({ id: d.id, ...data })
        })
        setCategories(cats)
      }),

      onSnapshot(doc(db, 'profile', 'me'), snap => {
        if (snap.exists()) setProfile(prev => ({ ...prev, ...snap.data() }))
      }),

      onSnapshot(query(collection(db, 'notifications'), where('uid', '==', user.uid)), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0
          const bT = b.createdAt?.toDate?.()?.getTime() || 0
          return bT - aT
        })
        setNotifications(list)
      }),

      onSnapshot(collection(db, 'cards'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setCards(list)
      }),

      onSnapshot(collection(db, 'contacts'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setContacts(list)
      }),

      onSnapshot(collection(db, 'goals'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setGoals(list)
      }),

      onSnapshot(doc(db, 'budget', 'current'), snap => {
        if (snap.exists()) setBudget(snap.data())
        else setBudget({ totalLimit: 0, cats: {} })
      }),

      onSnapshot(collection(db, 'accounts'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        setAccounts(list)
      }),

      onSnapshot(doc(db, 'vehicle', 'config'), snap => {
        if (snap.exists()) setVehicle(snap.data())
        else setVehicle(null)
      }),

      onSnapshot(collection(db, 'vehicle_refuels'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
        setRefuels(list)
      }),

      onSnapshot(collection(db, 'vehicle_maintenance'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
        setMaintenances(list)
      }),

      onSnapshot(collection(db, 'vehicle_routes'), snap => {
        const list = []
        snap.forEach(d => list.push({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
        setRoutes(list)
      }),

      onSnapshot(doc(db, 'settings', 'modules'), snap => {
        if (snap.exists()) setModules(snap.data())
        else setModules({ vehicleActive: false })
      }),
    ]

    setLoading(false)
    return () => unsubs.forEach(u => u())
  }, [user])

  useEffect(() => {
    const all = [
      ...refuels.map(r => ({ ...r, _type: 'refuel' })),
      ...maintenances.map(m => ({ ...m, _type: 'maintenance' })),
      ...routes.map(r => ({ ...r, _type: 'route' })),
    ]
    all.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0))
    setVehicleHistory(all)
  }, [refuels, maintenances, routes])

  return (
    <DataContext.Provider value={{ transactions, categories, profile, notifications, cards, contacts, goals, budget, accounts, vehicle, refuels, maintenances, routes, vehicleHistory, modules, loading }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
