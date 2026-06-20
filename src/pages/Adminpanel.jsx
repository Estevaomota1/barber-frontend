import { useState } from 'react'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      
      // Redirecionamento baseado na Role
      if (res.data.user.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.logoWrap}>
          <div style={s.logoBox}><i className="ti ti-scissors" style={{ fontSize: '28px', color: '#09090b' }} /></div>
          <h1 style={s.logoText}>BarberPro</h1>
          <p style={s.logoSub}>Gestão Inteligente para Barbearias</p>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Bem-vindo de volta</h2>
          <p style={s.cardSub}>Acesse sua conta para gerenciar sua barbearia.</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={s.label}>Email</label>
              <div style={s.inputWrap}>
                <i className="ti ti-mail" style={s.icon} />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="seu@email.com" required style={s.input} />
              </div>
            </div>

            <div>
              <label style={s.label}>Senha</label>
              <div style={s.inputWrap}>
                <i className="ti ti-lock" style={s.icon} />
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="sua senha" required style={s.input} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#71717a', marginTop: '16px' }}>
            Ainda não tem conta? <a href="/register" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '500' }}>Criar conta da barbearia</a>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  wrap: { width: '100%', maxWidth: '400px' },
  logoWrap: { textAlign: 'center', marginBottom: '1.5rem' },
  logoBox: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#f59e0b', borderRadius: '14px', marginBottom: '12px' },
  logoText: { fontSize: '24px', fontWeight: '500', color: '#fff', margin: '0 0 4px' },
  logoSub: { fontSize: '13px', color: '#71717a', margin: 0 },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '1.75rem' },
  cardTitle: { fontSize: '16px', fontWeight: '500', color: '#fff', margin: '0 0 6px' },
  cardSub: { fontSize: '13px', color: '#71717a', margin: '0 0 1.25rem' },
  error: { background: 'rgba(239,68,68,0.1)', border: '0.5px solid #ef4444', color: '#ef4444', borderRadius: '8px', padding: '10px', marginBottom: '14px', fontSize: '13px', textAlign: 'center' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' },
  icon: { fontSize: '16px', color: '#52525b' },
  input: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '10px 0', width: '100%' },
  btn: { width: '100%', background: '#f59e0b', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#09090b', cursor: 'pointer', marginTop: '8px' },
}