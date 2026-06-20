import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const STATUS_PT = {
  pending:   'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
}

const STATUS_STYLE = {
  confirmed: { background: '#14271e', color: '#4ade80', border: '0.5px solid #166534' },
  pending:   { background: '#2a1f10', color: '#fb923c', border: '0.5px solid #7c2d12' },
  cancelled: { background: '#2a1414', color: '#f87171', border: '0.5px solid #7f1d1d' },
  completed: { background: '#1c1f2e', color: '#818cf8', border: '0.5px solid #3730a3' },
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr.replace(' ', 'T'))
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) + ' às ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })
}

function LinkAgendamento() {
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('https://barber-saas-1-fpjl.onrender.com/api/my-barbershop', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
      .then(r => r.json())
      .then(d => { if (d.slug) setSlug(d.slug) })
  }, [])

  const link = `https://barber-frontend-tan.vercel.app/agendar/${slug}`
  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const whatsapp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Agende seu horário aqui: ${link}`)}`, '_blank') }

  if (!slug) return <p style={{ fontSize: '13px', color: '#71717a' }}>Carregando link...</p>

  return (
    <div>
      <div style={{ background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#a1a1aa', marginBottom: '10px', wordBreak: 'break-all', lineHeight: '1.5' }}>
        {link}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={copy} style={{ flex: 1, padding: '11px 8px', background: copied ? '#14532d' : '#27272a', border: 'none', borderRadius: '8px', color: copied ? '#4ade80' : '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '44px' }}>
          <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`}></i>
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <button onClick={whatsapp} style={{ flex: 1, padding: '11px 8px', background: '#14532d', border: 'none', borderRadius: '8px', color: '#4ade80', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '44px' }}>
          <i className="ti ti-brand-whatsapp"></i>
          WhatsApp
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [apRes, clRes, baRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/clients'),
          api.get('/barbers'),
        ])
        setAppointments(apRes.data.data.data || [])
        setClients(clRes.data.data.data || [])
        setBarbers(baRes.data.data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <span style={{ color: '#a1a1aa', marginTop: '12px' }}>Carregando dados...</span>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dash-container { max-width: 1100px; margin: 0 auto; padding: 32px 16px; }
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
        .dash-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .dash-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .dash-right-col { display: flex; flex-direction: column; gap: 16px; }
        .dash-quick-actions { display: flex; flex-direction: column; gap: 10px; }
        @media (max-width: 768px) {
          .dash-container { padding: 20px 12px; }
          .dash-stats-grid { gap: 8px; }
          .dash-content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .dash-container { padding: 16px 12px; }
          .dash-stats-grid { gap: 6px; }
        }
        @media (max-width: 360px) { .dash-stats-grid { grid-template-columns: 1fr; gap: 8px; } }
        .stat-card { background: #18181b; border: 0.5px solid #27272a; border-radius: 14px; padding: 16px; }
        @media (max-width: 480px) { .stat-card { padding: 12px 10px; border-radius: 10px; } }
        .stat-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        @media (max-width: 480px) { .stat-header { gap: 6px; margin-bottom: 6px; flex-direction: column; align-items: flex-start; } }
        .stat-icon-wrapper { width: 36px; height: 36px; background: #09090b; border-radius: 9px; display: flex; align-items: center; justify-content: center; border: 0.5px solid #27272a; flex-shrink: 0; }
        @media (max-width: 480px) { .stat-icon-wrapper { width: 28px; height: 28px; border-radius: 7px; } .stat-icon-wrapper i { font-size: 14px !important; } }
        .stat-label { font-size: 13px; color: #71717a; font-weight: 500; }
        @media (max-width: 480px) { .stat-label { font-size: 11px; } }
        .stat-value { font-size: 28px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        @media (max-width: 480px) { .stat-value { font-size: 22px; } }
        .stat-sub { font-size: 11px; color: #52525b; }
        .dash-card { background: #18181b; border: 0.5px solid #27272a; border-radius: 14px; padding: 20px; }
        @media (max-width: 480px) { .dash-card { padding: 16px 14px; border-radius: 12px; } }
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; gap: 8px; }
        .item-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .item-name { font-size: 14px; font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        @media (max-width: 480px) { .item-name { font-size: 13px; max-width: 100px; } }
        .item-sub { font-size: 11px; color: #71717a; margin-top: 2px; display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
        @media (max-width: 480px) { .item-sub { max-width: 100px; font-size: 10px; } }
        .status-badge { font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
        @media (max-width: 480px) { .status-badge { font-size: 10px; padding: 3px 6px; } }
        .action-btn { width: 100%; padding: 13px 14px; background: #09090b; border: 0.5px solid #27272a; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 500; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; min-height: 44px; }
        .action-btn:active { background: #27272a; }
        .date-badge { background: #18181b; border: 0.5px solid #27272a; padding: 7px 14px; border-radius: 10px; font-size: 13px; color: #a1a1aa; display: flex; align-items: center; white-space: nowrap; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Navbar />
        <div className="dash-container">

          {/* Header */}
          <div className="dash-header">
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '600', margin: '0 0 4px 0', color: '#fff' }}>Dashboard</h1>
              <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>Resumo da sua barbearia</p>
            </div>
            <div className="date-badge">
              <i className="ti ti-calendar-event" style={{ marginRight: '7px', color: '#f59e0b' }}></i>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats-grid">
            <StatCard label="Agendamentos" value={appointments.length} sub="Este mês" icon="ti-calendar-time" />
            <StatCard label="Clientes" value={clients.length} sub="Cadastrados" icon="ti-users" />
            <StatCard label="Barbeiros" value={barbers.length} sub="Equipe ativa" icon="ti-scissors" />
          </div>

          {/* Content */}
          <div className="dash-content-grid">

            {/* Agendamentos */}
            <div className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#fff' }}>Próximos Agendamentos</h2>
                <a href="/appointments" style={{ fontSize: '13px', color: '#f59e0b', textDecoration: 'none', fontWeight: '500' }}>Ver todos</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {appointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#52525b' }}>
                    <i className="ti ti-calendar-off" style={{ fontSize: '36px', color: '#27272a', display: 'block', marginBottom: '10px' }}></i>
                    <p style={{ margin: 0, fontSize: '13px' }}>Nenhum agendamento encontrado.</p>
                  </div>
                ) : (
                  appointments.slice(0, 6).map((apt, i) => (
                    <div key={apt.id} className="list-item" style={{ borderBottom: i < Math.min(appointments.length, 6) - 1 ? '0.5px solid #27272a' : 'none' }}>
                      <div className="item-main">
                        <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#f59e0b', border: '0.5px solid #3f3f46', flexShrink: 0 }}>
                          {getInitials(apt.client?.name || apt.client_name || '?')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="item-name">{apt.client?.name || apt.client_name || '—'}</div>
                          <div className="item-sub">
                            <i className="ti ti-clock" style={{ fontSize: '11px', marginRight: '3px', flexShrink: 0 }}></i>
                            {formatDate(apt.appointment_date)}
                            {apt.barber?.name ? ` • ${apt.barber.name}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="status-badge" style={STATUS_STYLE[apt.status] || { background: '#27272a', color: '#a1a1aa' }}>
                        {STATUS_PT[apt.status] || apt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="dash-right-col">
              <div className="dash-card" style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 14px 0', color: '#fff' }}>Ações Rápidas</h3>
                <div className="dash-quick-actions">
                  <button className="action-btn" onClick={() => window.location.href = '/appointments'}>
                    <i className="ti ti-plus"></i> Novo Agendamento
                  </button>
                  <button className="action-btn" onClick={() => window.location.href = '/clients'}>
                    <i className="ti ti-user-plus"></i> Cadastrar Cliente
                  </button>
                </div>
              </div>

              <div className="dash-card">
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0', color: '#fff' }}>
                  <i className="ti ti-link" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
                  Link de Agendamento
                </h3>
                <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 14px' }}>Compartilhe com seus clientes</p>
                <LinkAgendamento />
              </div>

              <div className="dash-card">
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 10px 0', color: '#fff' }}>Dica do Dia</h3>
                <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6', margin: 0 }}>
                  Mantenha o cadastro dos seus clientes atualizado para enviar lembretes via WhatsApp e reduzir faltas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon-wrapper" style={{ color: '#f59e0b' }}>
          <i className={`ti ${icon}`} style={{ fontSize: '18px' }} />
        </div>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

const styles = {
  loadingContainer: { minHeight: '100vh', background: '#09090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' },
}