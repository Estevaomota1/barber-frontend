import { useState } from 'react'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '',
    barbershop_name: '' 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      return setError('As senhas não coincidem')
    }
    
    setLoading(true)
    setError('')
    try {
      // O backend deve estar preparado para receber barbershop_name e criar a barbearia vinculada
      const res = await api.post('/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', 'owner')
      window.location.href = '/dashboard'
    } catch (err) {
      const msg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Erro ao criar conta'
      setError(msg)
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
          <p style={s.logoSub}>Gestão profissional para sua barbearia</p>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Criar conta da barbearia</h2>
          <p style={s.cardSub}>Preencha os dados abaixo para começar seu acesso.</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Nome da Barbearia" icon="ti-cut" value={form.barbershop_name} onChange={v => set('barbershop_name', v)} placeholder="Ex: Barbearia Estevão" />
            <Field label="Seu Nome" icon="ti-user" value={form.name} onChange={v => set('name', v)} placeholder="João Silva" />
            <Field label="Email" icon="ti-mail" type="email" value={form.email} onChange={v => set('email', v)} placeholder="seu@email.com" />
            <Field label="Senha" icon="ti-lock" type="password" value={form.password} onChange={v => set('password', v)} placeholder="mínimo 6 caracteres" />
            <Field label="Confirmar Senha" icon="ti-lock-check" type="password" value={form.password_confirmation} onChange={v => set('password_confirmation', v)} placeholder="repita a senha" />

            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'Criando conta...' : 'Cadastrar Barbearia'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#71717a', marginTop: '16px' }}>
            Já tem conta? <a href="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '500' }}>Entrar</a>
          </p>
        </div>
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
  cardTitle: { fontSize: '16px', fontWeight: '500', color: '#fff', margin: '0 0 6px' },
  cardSub: { fontSize: '13px', color: '#71717a', margin: '0 0 1.25rem' },
  error: { background: 'rgba(239,68,68,0.1)', border: '0.5px solid #ef4444', color: '#ef4444', borderRadius: '8px', padding: '10px', marginBottom: '14px', fontSize: '13px', textAlign: 'center' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' },
  icon: { fontSize: '16px', color: '#52525b' },
  input: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '10px 0', width: '100%' },
  btn: { width: '100%', background: '#f59e0b', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#09090b', cursor: 'pointer', marginTop: '8px' },
}
