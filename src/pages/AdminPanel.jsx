import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminPanel() {
  const [barbershops, setBarbershops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBarbershops()
  }, [])

  async function fetchBarbershops() {
    try {
      const res = await api.get('/admin/barbershops')
      setBarbershops(res.data)
    } catch (err) {
      console.error('Erro ao carregar barbearias', err)
      setError('Erro ao carregar a lista de barbearias')
    } finally {
      setLoading(false)
    }
  }

  async function toggleBlock(id) {
    try {
      await api.post(`/admin/barbershops/${id}/toggle-block`)
      fetchBarbershops() // Recarrega a lista após bloquear/desbloquear
    } catch (err) {
      alert('Erro ao alterar status da barbearia')
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Painel Administrativo</h1>
            <p style={s.subtitle}>Gerencie todas as barbearias cadastradas no sistema</p>
          </div>
          <div style={s.stats}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Total de Barbearias</span>
              <span style={s.statValue}>{barbershops.length}</span>
            </div>
          </div>
        </div>

        {error && <div style={s.errorMsg}>{error}</div>}

        <div style={s.card}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>Carregando barbearias...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHeader}>
                    <th style={s.th}>Barbearia</th>
                    <th style={s.th}>Dono</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {barbershops.map(b => (
                    <tr key={b.id} style={s.tr}>
                      <td style={s.td}>
                        <div style={{ fontWeight: '500', color: '#fff' }}>{b.name}</div>
                        <div style={{ fontSize: '12px', color: '#71717a' }}>ID: #{b.id}</div>
                      </td>
                      <td style={s.td}>{b.owner?.name || 'N/A'}</td>
                      <td style={s.td}>{b.owner?.email || 'N/A'}</td>
                      <td style={s.td}>
                        <span style={b.blocked_at ? s.badgeBlocked : s.badgeActive}>
                          {b.blocked_at ? 'Bloqueado' : 'Ativo'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button 
                          onClick={() => toggleBlock(b.id)}
                          style={b.blocked_at ? s.btnUnlock : s.btnBlock}
                        >
                          <i className={`ti ${b.blocked_at ? 'ti-lock-open' : 'ti-lock'}`} style={{ marginRight: '6px' }}></i>
                          {b.blocked_at ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {barbershops.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>Nenhuma barbearia encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', color: '#fff', padding: '2rem 1rem' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' },
  title: { fontSize: '24px', fontWeight: '600', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#71717a', margin: 0 },
  stats: { display: 'flex', gap: '1rem' },
  statCard: { background: '#18181b', border: '0.5px solid #27272a', padding: '12px 20px', borderRadius: '12px', textAlign: 'right' },
  statLabel: { display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '4px' },
  statValue: { fontSize: '20px', fontWeight: '600', color: '#f59e0b' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  tableHeader: { background: '#1c1c1f', borderBottom: '0.5px solid #27272a', textAlign: 'left' },
  th: { padding: '12px 16px', color: '#a1a1aa', fontWeight: '500' },
  tr: { borderBottom: '0.5px solid #27272a' },
  td: { padding: '16px', color: '#e4e4e7' },
  badgeActive: { background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  badgeBlocked: { background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  btnBlock: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', transition: '0.2s' },
  btnUnlock: { background: '#22c55e', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', transition: '0.2s' },
  errorMsg: { background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }
}
