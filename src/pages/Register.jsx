import { useState } from 'react'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', barbershop_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.password_confirmation) { setError('As senhas não coincidem'); return }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', 'owner')
      window.location.href = '/dashboard'
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) setError(Object.values(errors).flat().join(' '))
      else setError(err.response?.data?.message || 'Erro ao criar conta')
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
          <p style={s.logoSub}>Crie sua conta — 7 dias grátis, sem cartão</p>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Criar conta</h2>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Nome da Barbearia" icon="ti-building-store" value={form.barbershop_name} onChange={v => set('barbershop_name', v)} placeholder="Ex: Barbearia do João" />
            <Field label="Seu Nome" icon="ti-user" value={form.name} onChange={v => set('name', v)} placeholder="João Silva" />
            <Field label="Email" icon="ti-mail" type="email" value={form.email} onChange={v => set('email', v)} placeholder="seu@email.com" />
            <Field label="Senha" icon="ti-lock" type="password" value={form.password} onChange={v => set('password', v)} placeholder="mínimo 6 caracteres" />
            <Field label="Confirmar Senha" icon="ti-lock-check" type="password" value={form.password_confirmation} onChange={v => set('password_confirmation', v)} placeholder="repita a senha" />

            <div style={s.trialBox}>
              <i className="ti ti-gift" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
              <span>7 dias de teste grátis — sem cartão de crédito</span>
            </div>

            <button type="submit" disabled={loading} style={{ ...s.btn, marginTop: '4px' }}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#71717a', marginTop: '16px' }}>
            Já tem conta? <a href="/login" style={{ color: '#f59e0b', textDecoration: 'none' }}>Entrar</a>
          </p>
        </div>

        <p style={s.footer}>© 2026 BarberSaaS. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}

function Field({ label, icon, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <div style={s.inputWrap}>
        <i className={`ti ${icon}`} style={s.icon} />
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required style={s.input} />
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  wrap: { width: '100%', maxWidth: '420px' },
  logoWrap: { textAlign: 'center', marginBottom: '1.5rem' },
  logoBox: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#f59e0b', borderRadius: '14px', marginBottom: '12px' },
  logoText: { fontSize: '24px', fontWeight: '500', color: '#fff', margin: '0 0 4px' },
  logoSub: { fontSize: '13px', color: '#71717a', margin: 0 },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '1.75rem' },
  cardTitle: { fontSize: '16px', fontWeight: '500', color: '#fff', margin: '0 0 1.25rem' },
  error: { background: '#2a1414', border: '0.5px solid #7f1d1d', color: '#f87171', borderRadius: '8px', padding: '10px 14px', marginBottom: '4px', fontSize: '13px' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' },
  icon: { fontSize: '16px', color: '#52525b' },
  input: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '10px 0', width: '100%', fontFamily: 'inherit' },
  btn: { width: '100%', background: '#f59e0b', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#09090b', cursor: 'pointer' },
  trialBox: { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center' },
  footer: { textAlign: 'center', fontSize: '12px', color: '#3f3f46', marginTop: '1.5rem' },
}