import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

export default function Commissions() {
  const [commissions, setCommissions] = useState([])
  const [totalBarber, setTotalBarber] = useState(0)
  const [totalBarbershop, setTotalBarbershop] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const token = localStorage.getItem('token')
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const fetchCommissions = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await fetch(`${API}/commissions${params}`, { headers })
      const data = await res.json()
      setCommissions(data.commissions || [])
      setTotalBarber(data.total_barber || 0)
      setTotalBarbershop(data.total_barbershop || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCommissions() }, [filter])

  const markAsPaid = async (id) => {
    try {
      await fetch(`${API}/commissions/${id}/pay`, {
        method: 'PATCH',
        headers,
      })
      fetchCommissions()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Comissões</h1>
            <p style={styles.subtitle}>Gerencie os repasses dos barbeiros</p>
          </div>
        </div>

        {/* Cards Resumo */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Barbeiros</p>
            <p style={styles.cardValue}>R$ {Number(totalBarber).toFixed(2)}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Barbearia</p>
            <p style={styles.cardValue}>R$ {Number(totalBarbershop).toFixed(2)}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Geral</p>
            <p style={{ ...styles.cardValue, color: '#f59e0b' }}>
              R$ {(Number(totalBarber) + Number(totalBarbershop)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div style={styles.filters}>
          {['all', 'pending', 'paid'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Pagas'}
            </button>
          ))}
        </div>

        {/* Tabela */}
        {loading ? (
          <div style={styles.empty}>Carregando...</div>
        ) : commissions.length === 0 ? (
          <div style={styles.empty}>Nenhuma comissão encontrada.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Barbeiro', 'Serviço', 'Total', 'Comissão %', 'Barbeiro (R$)', 'Barbearia (R$)', 'Status', 'Ação'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map(c => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>{c.barber?.name || '-'}</td>
                    <td style={styles.td}>{c.appointment?.service_name || '-'}</td>
                    <td style={styles.td}>R$ {Number(c.service_price).toFixed(2)}</td>
                    <td style={styles.td}>{c.commission_rate}%</td>
                    <td style={styles.td}>R$ {Number(c.barber_amount).toFixed(2)}</td>
                    <td style={styles.td}>R$ {Number(c.barbershop_amount).toFixed(2)}</td>
                    <td style={styles.td}>
                      <span style={c.status === 'paid' ? styles.badgePaid : styles.badgePending}>
                        {c.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {c.status === 'pending' && (
                        <button onClick={() => markAsPaid(c.id)} style={styles.payBtn}>
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#09090b' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: '#71717a', margin: '4px 0 0' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  cardLabel: { fontSize: '13px', color: '#71717a', margin: '0 0 8px' },
  cardValue: { fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px' },
  filterBtn: { padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#18181b', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' },
  filterBtnActive: { background: '#27272a', color: '#f59e0b', borderColor: '#f59e0b' },
  tableWrap: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#71717a', borderBottom: '0.5px solid #27272a', fontWeight: '600' },
  tr: { borderBottom: '0.5px solid #27272a' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#e4e4e7' },
  badgePaid: { background: '#14532d', color: '#4ade80', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  badgePending: { background: '#422006', color: '#fb923c', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  payBtn: { background: '#f59e0b', color: '#09090b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#71717a', padding: '60px', background: '#18181b', borderRadius: '12px' },
}