import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminPanel() {
  const [barbershops, setBarbershops] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const res = await api.get('/admin/barbershops')
      setBarbershops(res.data.barbershops || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    window.location.href = '/login'
  }

  async function toggleBlock(id, isBlocked) {
    const reason = isBlocked ? null : prompt('Motivo do bloqueio (ex: Pagamento pendente):')
    if (!isBlocked && !reason) return
    setActionLoading(a => ({ ...a, [id]: true }))
    try {
      await api.post(`/admin/barbershops/${id}/toggle-block`, { reason })
      await load()
    } catch (err) { console.error(err) }
    finally { setActionLoading(a => ({ ...a, [id]: false })) }
  }

  async function extendTrial(id) {
    const days = prompt('Quantos dias de trial adicionar?', '7')
    if (!days || isNaN(days)) return
    setActionLoading(a => ({ ...a, [`trial_${id}`]: true }))
    try {
      await api.post(`/admin/barbershops/${id}/extend-trial`, { days: parseInt(days) })
      await load()
    } catch (err) { console.error(err) }
    finally { setActionLoading(a => ({ ...a, [`trial_${id}`]: false })) }
  }

  const filtered = barbershops.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:   barbershops.length,
    active:  barbershops.filter(b => !b.blocked_at && !b.trial_expired).length,
    trial:   barbershops.filter(b => b.trial_days_left !== null && !b.trial_expired && !b.blocked_at).length,
    blocked: barbershops.filter(b => b.blocked_at || b.trial_expired).length,
  }

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoBox}><i className="ti ti-scissors" style={{ fontSize: '16px', color: '#09090b' }} /></div>
          <div>
            <span style={s.logoText}>BarberPro</span>
            <span style={s.adminBadge}>Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} style={s.logoutBtn}>
          <i className="ti ti-logout" style={{ marginRight: '6px' }}></i>Sair
        </button>
      </div>

      <div style={s.container}>
        <div style={s.pageHeader}>
          <h1 style={s.title}>Painel Administrativo</h1>
          <p style={s.subtitle}>Gerencie todas as barbearias cadastradas</p>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <StatBox label="Total" value={stats.total} icon="ti-building-store" color="#a1a1aa" />
          <StatBox label="Ativos" value={stats.active} icon="ti-check" color="#4ade80" />
          <StatBox label="Em Trial" value={stats.trial} icon="ti-gift" color="#f59e0b" />
          <StatBox label="Bloqueados" value={stats.blocked} icon="ti-lock" color="#f87171" />
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <i className="ti ti-search" style={s.searchIcon} />
          <input style={s.searchInput} placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* List */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Barbearias</h2>
            <span style={s.badge}>{filtered.length} encontradas</span>
          </div>

          {loading ? (
            <div style={s.center}><div style={s.spinner}></div></div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>Nenhuma barbearia encontrada.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {filtered.map((b, i) => {
                const isBlocked = !!b.blocked_at || b.trial_expired
                const statusColor = b.blocked_at ? '#f87171' : b.trial_expired ? '#fb923c' : '#4ade80'
                const statusBg    = b.blocked_at ? '#2a1414' : b.trial_expired ? '#2a1f10' : '#14271e'
                const statusBorder= b.blocked_at ? '#7f1d1d' : b.trial_expired ? '#7c2d12' : '#166534'
                const statusLabel = b.blocked_at ? 'Bloqueado' : b.trial_expired ? 'Trial expirado' : b.trial_days_left !== null ? `Trial: ${b.trial_days_left}d` : 'Ativo'

                return (
                  <div key={b.id} style={{ ...s.row, borderBottom: i < filtered.length - 1 ? '0.5px solid #27272a' : 'none' }}>
                    <div style={s.rowLeft}>
                      <div style={s.barberAvatar}>{b.name[0].toUpperCase()}</div>
                      <div>
                        <p style={s.barberName}>{b.name}</p>
                        <p style={s.barberEmail}>{b.owner?.email || b.email}</p>
                        {b.blocked_reason && (
                          <p style={s.blockReason}>⚠️ {b.blocked_reason}</p>
                        )}
                      </div>
                    </div>

                    <div style={s.rowRight}>
                      <span style={{ ...s.statusBadge, background: statusBg, color: statusColor, border: `0.5px solid ${statusBorder}` }}>
                        {statusLabel}
                      </span>

                      <div style={s.actions}>
                        <button
                          onClick={() => extendTrial(b.id)}
                          disabled={actionLoading[`trial_${b.id}`]}
                          style={s.btnTrial}
                          title="Estender trial"
                        >
                          <i className="ti ti-gift"></i>
                        </button>
                        <button
                          onClick={() => toggleBlock(b.id, !!b.blocked_at)}
                          disabled={actionLoading[b.id]}
                          style={b.blocked_at ? s.btnUnblock : s.btnBlock}
                          title={b.blocked_at ? 'Desbloquear' : 'Bloquear'}
                        >
                          <i className={`ti ${b.blocked_at ? 'ti-lock-open' : 'ti-lock'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, icon, color }) {
  return (
    <div style={s.statBox}>
      <i className={`ti ${icon}`} style={{ fontSize: '20px', color, marginBottom: '8px', display: 'block' }} />
      <p style={s.statValue}>{value}</p>
      <p style={s.statLabel}>{label}</p>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { background: '#18181b', borderBottom: '0.5px solid #27272a', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: { width: '30px', height: '30px', background: '#f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '16px', fontWeight: '600', color: '#fff' },
  adminBadge: { marginLeft: '8px', background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(248,113,113,0.2)' },
  logoutBtn: { background: '#2a1414', color: '#f87171', border: '1px solid #7f1d1d', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  pageHeader: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#71717a', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  statBox: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 2px' },
  statLabel: { fontSize: '12px', color: '#71717a', margin: 0 },
  searchWrap: { display: 'flex', alignItems: 'center', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '0 14px', gap: '10px', marginBottom: '16px' },
  searchIcon: { fontSize: '16px', color: '#52525b' },
  searchInput: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', padding: '12px 0', width: '100%', fontFamily: 'inherit' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '0.5px solid #27272a' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 },
  badge: { fontSize: '12px', background: '#27272a', color: '#a1a1aa', padding: '3px 10px', borderRadius: '20px' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', gap: '12px', flexWrap: 'wrap' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  rowRight: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  barberAvatar: { width: '40px', height: '40px', background: '#27272a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#f59e0b', flexShrink: 0 },
  barberName: { fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 2px' },
  barberEmail: { fontSize: '12px', color: '#71717a', margin: 0 },
  blockReason: { fontSize: '11px', color: '#fb923c', margin: '2px 0 0' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  actions: { display: 'flex', gap: '6px' },
  btnTrial: { width: '32px', height: '32px', borderRadius: '6px', border: '0.5px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnBlock: { width: '32px', height: '32px', borderRadius: '6px', border: '0.5px solid #450a0a', background: '#18181b', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnUnblock: { width: '32px', height: '32px', borderRadius: '6px', border: '0.5px solid #166534', background: '#14271e', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  center: { display: 'flex', justifyContent: 'center', padding: '32px' },
  spinner: { width: '28px', height: '28px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  empty: { textAlign: 'center', padding: '40px', color: '#71717a', fontSize: '14px' },
}