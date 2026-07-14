import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

export default function Commissions() {
  const [commissions, setCommissions] = useState([])
  const [totalBarber, setTotalBarber] = useState(0)
  const [totalBarbershop, setTotalBarbershop] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCommission, setEditingCommission] = useState(null)
  const [editForm, setEditForm] = useState({ commission_rate: '' })

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
      const res = await fetch(`${API}/commissions/${id}/pay`, {
        method: 'PATCH',
        headers,
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || data.message || 'Erro ao marcar como pago.')
        return
      }
      fetchCommissions()
    } catch (err) {
      console.error(err)
      alert('Erro ao marcar como pago.')
    }
  }

  const revertPayment = async (id) => {
    if (!confirm('Reverter esta comissão para "Pendente"? Use isso se ela foi marcada como paga por engano.')) return
    try {
      const res = await fetch(`${API}/commissions/${id}/unpay`, {
        method: 'PATCH',
        headers,
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || data.message || 'Erro ao reverter pagamento.')
        return
      }
      fetchCommissions()
    } catch (err) {
      console.error(err)
      alert('Erro ao reverter pagamento.')
    }
  }

  const openEdit = (commission) => {
    setEditingCommission(commission)
    setEditForm({ commission_rate: commission.commission_rate })
    setShowEditModal(true)
  }

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API}/commissions/${editingCommission.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || data.message || 'Erro ao salvar comissão.')
        return
      }
      setShowEditModal(false)
      setEditingCommission(null)
      fetchCommissions()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar comissão.')
    }
  }

  const deleteCommission = async (id) => {
    if (!confirm('Excluir esta comissão? Essa ação não pode ser desfeita.')) return
    try {
      const res = await fetch(`${API}/commissions/${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || data.message || 'Erro ao excluir comissão.')
        return
      }
      fetchCommissions()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir comissão.')
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
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {c.status === 'pending' && (
                          <>
                            <button onClick={() => markAsPaid(c.id)} style={styles.payBtn}>
                              Marcar Pago
                            </button>
                            <button onClick={() => openEdit(c)} style={styles.editBtn}>
                              <i className="ti ti-pencil"></i>
                            </button>
                            <button onClick={() => deleteCommission(c.id)} style={styles.deleteBtn}>
                              <i className="ti ti-trash"></i>
                            </button>
                          </>
                        )}
                        {c.status === 'paid' && (
                          <button onClick={() => revertPayment(c.id)} style={styles.revertBtn}>
                            Reverter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       )}
      </div>

      {showEditModal && editingCommission && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Editar Comissão</h2>
            <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 16px' }}>
              {editingCommission.barber?.name} — R$ {Number(editingCommission.service_price).toFixed(2)}
            </p>

            <label style={styles.label}>Percentual de Comissão (%)</label>
            <input
              style={styles.input}
              type="number"
              value={editForm.commission_rate}
              onChange={e => setEditForm({ commission_rate: e.target.value })}
              placeholder="Ex: 50"
            />

            <div style={styles.modalBtns}>
              <button onClick={() => { setShowEditModal(false); setEditingCommission(null) }} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={saveEdit} style={styles.confirmBtn}>Salvar</button>
            </div>
          </div>
        </div>
      )}
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
  editBtn: { background: '#27272a', color: '#a1a1aa', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { background: '#2a1414', color: '#f87171', border: '0.5px solid #7f1d1d', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  revertBtn: { background: '#27272a', color: '#fb923c', border: '0.5px solid #7c2d12', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#71717a', padding: '60px', background: '#18181b', borderRadius: '12px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#09090b', color: '#a1a1aa', fontSize: '14px', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#09090b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
}