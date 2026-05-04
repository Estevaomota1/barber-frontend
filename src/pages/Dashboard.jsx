import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

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

  if (loading) return <div style={styles.loading}>Carregando...</div>

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>Dashboard</h2>

        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.cardNumber}>{appointments.length}</div>
            <div style={styles.cardLabel}>Agendamentos</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardNumber}>{clients.length}</div>
            <div style={styles.cardLabel}>Clientes</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardNumber}>{barbers.length}</div>
            <div style={styles.cardLabel}>Barbeiros</div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Próximos agendamentos</h2>
          {appointments.length === 0 ? (
            <p style={styles.empty}>Nenhum agendamento encontrado</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} style={styles.item}>
                <div>
                  <strong>{apt.client?.name}</strong>
                  <div style={styles.itemSub}>{apt.appointment_date}</div>
                </div>
                <div style={{...styles.badge, ...styles[apt.status]}}>
                  {apt.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  pageTitle: { marginBottom: '24px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  card: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  cardNumber: { fontSize: '40px', fontWeight: '700', color: '#2563eb' },
  cardLabel: { color: '#666', marginTop: '4px' },
  section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { margin: '0 0 16px 0', fontSize: '18px' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  itemSub: { color: '#666', fontSize: '14px', marginTop: '2px' },
  empty: { color: '#666', textAlign: 'center', padding: '24px 0' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  pending: { backgroundColor: '#fef3c7', color: '#d97706' },
  confirmed: { backgroundColor: '#d1fae5', color: '#059669' },
  cancelled: { backgroundColor: '#fee2e2', color: '#dc2626' },
  completed: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
}