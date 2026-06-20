import { useState, useEffect } from 'react'
import api from '../services/api'

export default function VendorDashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)

  async function loadClients() {
    try {
      const res = await api.get('/clients')
      setClients(res.data.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClients() }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    window.location.href = '/login'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.post('/clients', { name, phone })
      setName('')
      setPhone('')
      setShowForm(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      loadClients()
    } catch (err) {
      setError('Erro ao cadastrar cliente. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoBox}><i className="ti ti-scissors" style={{ fontSize: '16px', color: '#09090b' }} /></div>
          <div>
            <span style={s.logoText}>BarberPro</span>
            <span style={s.vendorBadge}>Vendedor</span>
          </div>
        </div>
        <button onClick={handleLogout} style={s.logoutBtn}>
          <i className="ti ti-logout" style={{ marginRight: '6px' }}></i>Sair
        </button>
      </div>

      <div style={s.container}>
        <div style={s.pageHeader}>
          <h1 style={s.title}>Cadastro de Clientes</h1>
          <p style={s.subtitle}>Adicione novos clientes ao sistema</p>
        </div>

        {/* Success */}
        {success && (
          <div style={s.successAlert}>
            <i className="ti ti-check" style={{ marginRight: '8px' }}></i>
            Cliente cadastrado com sucesso!
          </div>
        )}

        {/* Form toggle */}
        <button onClick={() => { setShowForm(!showForm); setError('') }} style={showForm ? s.btnSecondary : s.btnPrimary}>
          {showForm
            ? <><i className="ti ti-x" style={{ marginRight: '6px' }}></i>Cancelar</>
            : <><i className="ti ti-user-plus" style={{ marginRight: '6px' }}></i>Novo Cliente</>
          }
        </button>

        {/* Form */}
        {showForm && (
          <div style={{ ...s.card, marginTop: '16px' }}>
            <h2 style={s.cardTitle}>
              <i className="ti ti-user-plus" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
              Cadastrar Novo Cliente
            </h2>
            {error && <div style={s.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={s.label}>Nome Completo</label>
                <div style={s.inputWrap}>
                  <i className="ti ti-user" style={s.inputIcon} />
                  <input style={s.input} value={name} onChange={e => setName(e.target.value)}
                    placeholder="Ex: João Silva" required />
                </div>
              </div>
              <div>
                <label style={s.label}>Telefone / WhatsApp</label>
                <div style={s.inputWrap}>
                  <i className="ti ti-phone" style={s.inputIcon} />
                  <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-0000" required />
                </div>
              </div>
              <button type="submit" disabled={saving} style={s.btnPrimary}>
                {saving ? 'Cadastrando...' : 'Cadastrar Cliente'}
              </button>
            </form>
          </div>
        )}

        {/* List */}
        <div style={{ ...s.card, marginTop: '24px' }}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Clientes Cadastrados</h2>
            <span style={s.badge}>{clients.length} clientes</span>
          </div>

          {loading ? (
            <div style={s.center}><div style={s.spinner}></div></div>
          ) : clients.length === 0 ? (
            <div style={s.empty}>
              <i className="ti ti-users" style={{ fontSize: '40px', color: '#27272a', display: 'block', marginBottom: '10px' }}></i>
              Nenhum cliente cadastrado ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {clients.map((c, i) => (
                <div key={c.id} style={{ ...s.clientRow, borderBottom: i < clients.length - 1 ? '0.5px solid #27272a' : 'none' }}>
                  <div style={s.clientLeft}>
                    <div style={s.avatar}>{c.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p style={s.clientName}>{c.name}</p>
                      <p style={s.clientPhone}>
                        <i className="ti ti-brand-whatsapp" style={{ color: '#22c55e', marginRight: '4px', fontSize: '12px' }}></i>
                        {c.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { background: '#18181b', borderBottom: '0.5px solid #27272a', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: { width: '30px', height: '30px', background: '#f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '16px', fontWeight: '600', color: '#fff' },
  vendorBadge: { marginLeft: '8px', background: 'rgba(129,140,248,0.15)', color: '#818cf8', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(129,140,248,0.2)' },
  logoutBtn: { background: '#2a1414', color: '#f87171', border: '1px solid #7f1d1d', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '32px 20px' },
  pageHeader: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#71717a', margin: 0 },
  successAlert: { background: '#14271e', border: '0.5px solid #166534', color: '#4ade80', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center' },
  error: { background: '#2a1414', border: '0.5px solid #7f1d1d', color: '#f87171', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '0.5px solid #27272a' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0, display: 'flex', alignItems: 'center' },
  badge: { fontSize: '12px', background: '#27272a', color: '#a1a1aa', padding: '3px 10px', borderRadius: '20px' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#09090b', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '0 12px', gap: '8px' },
  inputIcon: { fontSize: '16px', color: '#52525b' },
  input: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '11px 0', width: '100%', fontFamily: 'inherit' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f59e0b', color: '#09090b', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#27272a', color: '#fff', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  clientRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' },
  clientLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', background: '#27272a', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#f59e0b', flexShrink: 0 },
  clientName: { fontSize: '14px', fontWeight: '500', color: '#fff', margin: '0 0 2px' },
  clientPhone: { fontSize: '12px', color: '#71717a', margin: 0, display: 'flex', alignItems: 'center' },
  center: { display: 'flex', justifyContent: 'center', padding: '32px' },
  spinner: { width: '28px', height: '28px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  empty: { textAlign: 'center', padding: '40px 0', color: '#71717a', fontSize: '14px' },
}