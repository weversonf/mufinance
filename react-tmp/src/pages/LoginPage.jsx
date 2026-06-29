import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha email e senha'); return }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email ou senha inválidos')
      } else {
        setError(err.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-mark">M</div>
        </div>
        <h1 className="login-title">Mu Finance</h1>
        <p className="login-sub">Acesse sua carteira</p>
        <form onSubmit={handleSubmit}>
          <input className="field-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          <input className="field-input" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ marginTop: 8 }} />
          {error && <p className="login-error">{error}</p>}
          <button className="submit-btn" type="submit" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
