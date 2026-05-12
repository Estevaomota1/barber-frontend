import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
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
        setAppointments(apRes.data.data.data)
        setClients(clRes.data.data.data)
        setBarbers(baRes.data.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#09090b', color: '#a1a1aa', fontSize: '16px' }}>
      Carregando...
    </div>
  )

  const statusStyle = {
    confirmed:  { background: '#14271e', color: '#4ade80' },
    pending:    { background: '#2a1f10', color: '#fb923c' },
    cancelled:  { background: '#2a1414', color: '#f87171' },
    completed:  { background: '#1c1f2e', color: '#818cf8' },
  }

  return (
    <div style={{ background: '#09090b', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#fff', margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>Visão geral da sua barbearia</p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          <StatCard
            label="Agendamentos"
            value={appointments.length}
            sub="este mês"
            icon="ti-calendar"
            iconColor="#4ade80"
            iconBg="#1c2a1e"
          />
          <StatCard
            label="Clientes"
            value={clients.length}
            sub="cadastrados"
            icon="ti-users"
            iconColor="#818cf8"
            iconBg="#1c1f2e"
          />
          <StatCard
            label="Barbeiros"
            value={barbers.length}
            sub="ativos"
            icon="ti-scissors"
            iconColor="#fb923c"
            iconBg="#2a1f1c"
          />
        </div>

        {/* Appointments list */}
        <div style={{ background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#fff', margin: 0 }}>Próximos agendamentos</h2>
            <a href="/appointments" style={{ fontSize: '13px', color: '#f59e0b', textDecoration: 'none' }}>Ver todos</a>
          </div>

          {appointments.length === 0 ? (
            <p style={{ color: '#52525b', textAlign: 'center', padding: '24px 0', margin: 0 }}>Nenhum agendamento encontrado</p>
          ) : (
            appointments.slice(0, 5).map((apt, i) => (
              <div
                key={apt.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < Math.min(appointments.length, 5) - 1 ? '0.5px solid #27272a' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', background: '#27272a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '500', color: '#a1a1aa', flexShrink: 0,
                  }}>
                    {getInitials(apt.client?.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>{apt.client?.name}</div>
                    <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>
                      {apt.appointment_date}
                      {apt.barber?.name ? ` · ${apt.barber.name}` : ''}
                    </div>
                  </div>
                </div>
                <span style={{
                  ...statusStyle[apt.status] || { background: '#27272a', color: '#a1a1aa' },
                  fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                }}>
                  {apt.status}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, iconColor, iconBg }) {
  return (
    <div style={{ background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', color: '#71717a' }}>{label}</span>
        <div style={{ background: iconBg, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`ti ${icon}`} style={{ fontSize: '16px', color: iconColor }} aria-hidden="true" />
        </div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: '500', color: '#fff' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>{sub}</div>
    </div>
  )
}