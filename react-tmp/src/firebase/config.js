import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCWlVvnA29CnKco7mBG6LvpzDtcYmr28cY",
  authDomain: "projetomu-d5722.firebaseapp.com",
  projectId: "projetomu-d5722",
  storageBucket: "projetomu-d5722.firebasestorage.app",
  messagingSenderId: "94478862714",
  appId: "1:94478862714:web:578561a199f685f9e5eec3"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export default app
