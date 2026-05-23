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

  const statusStyle = {
    confirmed:  { background: '#14271e', color: '#4ade80', border: '0.5px solid #166534' },
    pendente:    { background: '#2a1f10', color: '#fb923c', border: '0.5px solid #7c2d12' },
    cancelled:  { background: '#2a1414', color: '#f87171', border: '0.5px solid #7f1d1d' },
    completed:  { background: '#1c1f2e', color: '#818cf8', border: '0.5px solid #3730a3' },
  }

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Bem-vindo de volta! Aqui está o resumo da sua barbearia.</p>
          </div>
          <div style={styles.dateBadge}>
            <i className="ti ti-calendar-event" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard
            label="Agendamentos"
            value={appointments.length}
            sub="Total este mês"
            icon="ti-calendar-time"
            color="#f59e0b"
          />
          <StatCard
            label="Clientes"
            value={clients.length}
            sub="Base de dados"
            icon="ti-users"
            color="#f59e0b"
          />
          <StatCard
            label="Barbeiros"
            value={barbers.length}
            sub="Equipe ativa"
            icon="ti-scissors"
            color="#f59e0b"
          />
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Appointments List */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Próximos Agendamentos</h2>
              <a href="/appointments" style={styles.cardLink}>Ver todos</a>
            </div>

            <div style={styles.listContainer}>
              {appointments.length === 0 ? (
                <div style={styles.emptyState}>
                  <i className="ti ti-calendar-off" style={{ fontSize: '40px', color: '#27272a', marginBottom: '12px' }}></i>
                  <p>Nenhum agendamento para hoje.</p>
                </div>
              ) : (
                appointments.slice(0, 6).map((apt, i) => (
                  <div
                    key={apt.id}
                    style={{
                      ...styles.listItem,
                      borderBottom: i < Math.min(appointments.length, 6) - 1 ? '0.5px solid #27272a' : 'none',
                    }}
                  >
                    <div style={styles.itemMain}>
                      <div style={styles.avatar}>
                        {getInitials(apt.client?.name)}
                      </div>
                      <div>
                        <div style={styles.itemName}>{apt.client?.name}</div>
                        <div style={styles.itemSub}>
                          <i className="ti ti-clock" style={{ fontSize: '12px', marginRight: '4px' }}></i>
                          {apt.appointment_date}
                          {apt.barber?.name ? ` • ${apt.barber.name}` : ''}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      ...statusStyle[apt.status] || { background: '#27272a', color: '#a1a1aa' },
                    }}>
                      {apt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions or Secondary Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ ...styles.card, background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)' }}>
              <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>Ações Rápidas</h3>
              <div style={styles.quickActions}>
                <button style={styles.actionBtn} onClick={() => window.location.href='/appointments'}>
                  <i className="ti ti-plus"></i> Novo Agendamento 
                </button>
                <button style={styles.actionBtn} onClick={() => window.location.href='/clients'}>
                  <i className="ti ti-user-plus"></i> Cadastrar Cliente
                </button>
              </div>
            </div>
            
            <div style={styles.card}>
              <h3 style={{ ...styles.cardTitle, marginBottom: '12px' }}>Dica do Dia</h3>
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6', margin: 0 }}>
                Mantenha o cadastro dos seus clientes atualizado para enviar lembretes automáticos via WhatsApp e reduzir faltas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statHeader}>
        <div style={{ ...styles.statIconWrapper, color: color }}>
          <i className={`ti ${icon}`} style={{ fontSize: '20px' }} aria-hidden="true" />
        </div>
        <span style={styles.statLabel}>{label}</span>
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  )
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#09090b',
    color: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '600',
    margin: '0 0 6px 0',
    color: '#fff'
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0
  },
  dateBadge: {
    background: '#18181b',
    border: '0.5px solid #27272a',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#a1a1aa',
    display: 'flex',
    alignItems: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    background: '#18181b',
    border: '0.5px solid #27272a',
    borderRadius: '16px',
    padding: '24px',
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'default'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
    background: '#09090b',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0.5px solid #27272a'
  },
  statLabel: {
    fontSize: '14px',
    color: '#71717a',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  statSub: {
    fontSize: '12px',
    color: '#52525b'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr'
    }
  },
  card: {
    background: '#18181b',
    border: '0.5px solid #27272a',
    borderRadius: '16px',
    padding: '24px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#fff'
  },
  cardLink: {
    fontSize: '13px',
    color: '#f59e0b',
    textDecoration: 'none',
    fontWeight: '500'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0'
  },
  itemMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: '#27272a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#f59e0b',
    border: '0.5px solid #3f3f46'
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff'
  },
  itemSub: {
    fontSize: '12px',
    color: '#71717a',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
    textTransform: 'capitalize'
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  actionBtn: {
    width: '100%',
    padding: '12px',
    background: '#09090b',
    border: '0.5px solid #27272a',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#52525b'
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#09090b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #27272a',
    borderTop: '3px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
}