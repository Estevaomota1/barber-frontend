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
      localStorage.setItem('role', response.data.role)

      // Redireciona por role
      const role = response.data.role
      if (role === 'admin')       window.location.href = '/admin'
      else if (role === 'vendor') window.location.href = '/vendor'
      else                        window.location.href = '/dashboard'

    } catch (err) {
      const msg = err.response?.data?.message || 'Email ou senha inválidos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.logoWrap}>
          <div style={s.logoBox}>
            <i className="ti ti-scissors" style={{ fontSize: '28px', color: '#09090b' }} />
          </div>
          <h1 style={s.logoText}>BarberPro</h1>
          <p style={s.logoSub}>Gerencie sua barbearia com eficiência</p>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Entrar na conta</h2>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <div style={s.inputWrap}>
                <i className="ti ti-mail" style={s.icon} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required style={s.input} />
              </div>
            </div>

            <div style={{ ...s.field, marginBottom: '1.5rem' }}>
              <label style={s.label}>Senha</label>
              <div style={s.inputWrap}>
                <i className="ti ti-lock" style={s.icon} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required style={s.input} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...s.btn, background: loading ? '#92400e' : '#f59e0b' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/register" style={s.link}>Criar conta de barbearia</a>
              <a href="/register/vendor" style={{ ...s.link, color: '#71717a' }}>Acessar como vendedor</a>
            </div>
          </form>
        </div>

        <p style={s.footer}>© 2026 BarberSaaS. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  wrap: { width: '100%', maxWidth: '400px' },
  logoWrap: { textAlign: 'center', marginBottom: '2rem' },
  logoBox: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#f59e0b', borderRadius: '16px', marginBottom: '1rem' },
  logoText: { fontSize: '26px', fontWeight: '500', color: '#fff', margin: '0 0 6px' },
  logoSub: { fontSize: '14px', color: '#71717a', margin: 0 },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '2rem' },
  cardTitle: { fontSize: '16px', fontWeight: '500', color: '#fff', margin: '0 0 1.5rem' },
  error: { background: '#2a1414', border: '0.5px solid #7f1d1d', color: '#f87171', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.25rem', fontSize: '13px' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' },
  icon: { fontSize: '16px', color: '#52525b' },
  input: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '10px 0', width: '100%', fontFamily: 'inherit' },
  btn: { width: '100%', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '500', color: '#09090b', cursor: 'pointer' },
  link: { fontSize: '13px', color: '#f59e0b', textDecoration: 'none' },
  footer: { textAlign: 'center', fontSize: '12px', color: '#3f3f46', marginTop: '1.5rem' },
}