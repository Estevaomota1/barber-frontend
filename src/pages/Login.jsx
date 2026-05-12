import { useState } from 'react'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/login', { email, password })
      localStorage.setItem('token', response.data.token)
      window.location.href = '/dashboard'
    } catch {
      setError('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#f59e0b', borderRadius: '16px', marginBottom: '1rem' }}>
            <i className="ti ti-scissors" style={{ fontSize: '28px', color: '#09090b' }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#fff', margin: '0 0 6px' }}>BarberSaaS</h1>
          <p style={{ fontSize: '14px', color: '#71717a', margin: 0 }}>Gerencie sua barbearia com eficiência</p>
        </div>

        {/* Card */}
        <div style={{ background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#fff', margin: '0 0 1.5rem' }}>Entrar na conta</h2>

          {error && (
            <div style={{ background: '#2a1414', border: '0.5px solid #7f1d1d', color: '#f87171', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.25rem', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>Email</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' }}>
                <i className="ti ti-mail" style={{ fontSize: '16px', color: '#52525b' }} aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '10px 0', width: '100%', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>Senha</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' }}>
                <i className="ti ti-lock" style={{ fontSize: '16px', color: '#52525b' }} aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '10px 0', width: '100%', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? '#92400e' : '#f59e0b', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '500', color: '#09090b', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <a href="#" style={{ fontSize: '13px', color: '#f59e0b', textDecoration: 'none' }}>Esqueci minha senha</a>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#3f3f46', marginTop: '1.5rem' }}>
          © 2026 BarberSaaS. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}