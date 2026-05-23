import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

const PERIODS = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
]

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const token = localStorage.getItem('token')
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }

  const fetchReport = async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/reports?period=${p}`, { headers })
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport(period) }, [period])

  const maxRevenue = data?.daily_revenue?.length
    ? Math.max(...data.daily_revenue.map(d => d.total))
    : 1

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Relatórios</h1>
            <p style={styles.subtitle}>
              {data ? `${data.start} até ${data.end}` : 'Carregando...'}
            </p>
          </div>
          <div style={styles.periodBtns}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{ ...styles.periodBtn, ...(period === p.value ? styles.periodBtnActive : {}) }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.empty}>
            <div style={styles.spinner}></div>
            <p style={{ margin: '16px 0 4px', color: '#a1a1aa' }}>Carregando relatório...</p>
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div style={styles.statsGrid}>
              <StatCard icon="ti-currency-dollar" label="Faturamento Total" value={`R$ ${Number(data.total_revenue).toFixed(2)}`} color="#4ade80" />
              <StatCard icon="ti-receipt" label="Comandas Fechadas" value={data.total_orders} color="#f59e0b" />
              <StatCard icon="ti-chart-bar" label="Ticket Médio" value={`R$ ${Number(data.avg_ticket).toFixed(2)}`} color="#818cf8" />
              <StatCard icon="ti-building-store" label="Lucro Barbearia" value={`R$ ${Number(data.barbershop_profit).toFixed(2)}`} color="#fb923c" />
            </div>

            {/* Comissões */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>💰 Comissões</h2>
              <div style={styles.commissionGrid}>
                <div style={styles.commissionCard}>
                  <p style={styles.commissionLabel}>Pagas</p>
                  <p style={{ ...styles.commissionValue, color: '#4ade80' }}>R$ {Number(data.commissions_paid).toFixed(2)}</p>
                </div>
                <div style={styles.commissionCard}>
                  <p style={styles.commissionLabel}>Pendentes</p>
                  <p style={{ ...styles.commissionValue, color: '#fb923c' }}>R$ {Number(data.commissions_pending).toFixed(2)}</p>
                </div>
                <div style={styles.commissionCard}>
                  <p style={styles.commissionLabel}>Total Comissões</p>
                  <p style={{ ...styles.commissionValue, color: '#fff' }}>
                    R$ {(Number(data.commissions_paid) + Number(data.commissions_pending)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfico de faturamento diário */}
            {data.daily_revenue?.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📈 Faturamento por dia</h2>
                <div style={styles.card}>
                  <div style={styles.chartContainer}>
                    {data.daily_revenue.map((day, i) => (
                      <div key={i} style={styles.barWrapper}>
                        <span style={styles.barValue}>R${Number(day.total).toFixed(0)}</span>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.bar,
                            height: `${Math.max((day.total / maxRevenue) * 100, 4)}%`,
                          }}></div>
                        </div>
                        <span style={styles.barLabel}>{day.date}</span>
                        <span style={styles.barCount}>{day.count} cmd</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={styles.twoCol}>
              {/* Ranking de barbeiros */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👨‍💼 Ranking de Barbeiros</h2>
                <div style={styles.card}>
                  {data.barber_ranking?.length === 0 ? (
                    <p style={styles.empty2}>Nenhum dado no período.</p>
                  ) : (
                    data.barber_ranking?.map((barber, i) => (
                      <div key={barber.id} style={{ ...styles.rankRow, borderBottom: i < data.barber_ranking.length - 1 ? '0.5px solid #27272a' : 'none' }}>
                        <div style={styles.rankLeft}>
                          <span style={styles.rankNum}>#{i + 1}</span>
                          <div style={styles.rankAvatar}>{barber.name[0]}</div>
                          <div>
                            <p style={styles.rankName}>{barber.name}</p>
                            <p style={styles.rankSub}>{barber.orders} comanda(s)</p>
                          </div>
                        </div>
                        <span style={styles.rankValue}>R$ {Number(barber.total).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top serviços/produtos */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>✂️ Top Serviços e Produtos</h2>
                <div style={styles.card}>
                  {data.top_items?.length === 0 ? (
                    <p style={styles.empty2}>Nenhum dado no período.</p>
                  ) : (
                    data.top_items?.map((item, i) => (
                      <div key={i} style={{ ...styles.rankRow, borderBottom: i < data.top_items.length - 1 ? '0.5px solid #27272a' : 'none' }}>
                        <div style={styles.rankLeft}>
                          <span style={styles.itemIcon}>{item.type === 'service' ? '✂️' : '📦'}</span>
                          <div>
                            <p style={styles.rankName}>{item.name}</p>
                            <p style={styles.rankSub}>{item.quantity}x vendido(s)</p>
                          </div>
                        </div>
                        <span style={styles.rankValue}>R$ {Number(item.total).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statHeader}>
        <div style={{ ...styles.statIcon, color }}>
          <i className={`ti ${icon}`} style={{ fontSize: '20px' }}></i>
        </div>
        <span style={styles.statLabel}>{label}</span>
      </div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#09090b' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: '#71717a', margin: '4px 0 0' },
  periodBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  periodBtn: { padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#18181b', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' },
  periodBtnActive: { background: '#27272a', color: '#f59e0b', borderColor: '#f59e0b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  statHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  statIcon: { width: '36px', height: '36px', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '13px', color: '#71717a' },
  statValue: { fontSize: '26px', fontWeight: '700' },
  section: { marginBottom: '28px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 12px' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  commissionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  commissionCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '16px' },
  commissionLabel: { fontSize: '13px', color: '#71717a', margin: '0 0 8px' },
  commissionValue: { fontSize: '22px', fontWeight: '700', margin: 0 },
  chartContainer: { display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', overflowX: 'auto', paddingBottom: '4px' },
  barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '48px', height: '100%' },
  barValue: { fontSize: '10px', color: '#71717a', marginBottom: '4px' },
  barTrack: { flex: 1, width: '32px', background: '#27272a', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', background: '#f59e0b', borderRadius: '4px', transition: 'height 0.3s' },
  barLabel: { fontSize: '11px', color: '#a1a1aa', marginTop: '6px' },
  barCount: { fontSize: '10px', color: '#52525b' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' },
  rankRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' },
  rankLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  rankNum: { fontSize: '14px', fontWeight: '700', color: '#f59e0b', width: '24px' },
  rankAvatar: { width: '32px', height: '32px', borderRadius: '8px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#f59e0b' },
  rankName: { fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 },
  rankSub: { fontSize: '12px', color: '#71717a', margin: '2px 0 0' },
  rankValue: { fontSize: '14px', fontWeight: '600', color: '#4ade80' },
  itemIcon: { fontSize: '20px' },
  empty: { textAlign: 'center', padding: '60px', background: '#18181b', borderRadius: '12px' },
  empty2: { color: '#71717a', fontSize: '14px', textAlign: 'center', padding: '20px 0', margin: 0 },
  spinner: { width: '36px', height: '36px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
}