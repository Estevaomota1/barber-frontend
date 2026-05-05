import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState('')
  const [date, setDate] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function loadData(filter = '') {
    try {
      const url = filter ? `/appointments?date=${filter}` : '/appointments'
      const [apRes, clRes] = await Promise.all([
        api.get(url),
        api.get('/clients'),
      ])
      setAppointments(apRes.data.data.data)
      setClients(clRes.data.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleFilter(e) {
    const value = e.target.value
    setFilterDate(value)
    loadData(value)
  }

  function handleClearFilter() {
    setFilterDate('')
    loadData('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/appointments', {
        client_id: clientId,
        appointment_date: date
      })
      setClientId('')
      setDate('')
      setShowForm(false)
      loadData(filterDate)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatus(id, status) {
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      loadData(filterDate)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deletar este agendamento?')) return
    try {
      await api.delete(`/appointments/${id}`)
      loadData(filterDate)
    } catch (err) {
      console.error(err)
    }
  }

  const statusColors = {
    pending:   { backgroundColor: '#fef3c7', color: '#d97706' },
    confirmed: { backgroundColor: '#d1fae5', color: '#059669' },
    cancelled: { backgroundColor: '#fee2e2', color: '#dc2626' },
    completed: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
  }

  if (loading) return <div style={styles.loading}>Carregando...</div>

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>📅 Agendamentos</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
            {showForm ? 'Cancelar' : '+ Novo Agendamento'}
          </button>
        </div>

        {showForm && (
          <div style={styles.form}>
            <h3 style={styles.formTitle}>Novo Agendamento</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Cliente</label>
                <select
                  style={styles.input}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Data e Hora</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value.replace('T', ' ') + ':00')}
                  required
                />
              </div>
              <div style={styles.formButtons}>
                <button style={styles.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button style={styles.btnSecondary} type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.filterRow}>
            <div style={styles.filterField}>
              <label style={styles.label}>Filtrar por data</label>
              <input
                style={styles.input}
                type="date"
                value={filterDate}
                onChange={handleFilter}
              />
            </div>
            {filterDate && (
              <button onClick={handleClearFilter} style={styles.btnSecondary}>
                Limpar filtro
              </button>
            )}
          </div>

          {appointments.length === 0 ? (
            <p style={styles.empty}>Nenhum agendamento encontrado</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} style={styles.item}>
                <div>
                  <strong>{apt.client?.name}</strong>
                  <div style={styles.itemSub}>📅 {apt.appointment_date}</div>
                </div>
                <div style={styles.actions}>
                  <select
                    style={{...styles.statusSelect, ...statusColors[apt.status]}}
                    value={apt.status}
                    onChange={(e) => handleStatus(apt.id, e.target.value)}
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="completed">Concluído</option>
                  </select>
                  <button onClick={() => handleDelete(apt.id)} style={styles.btnDelete}>
                    Deletar
                  </button>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { margin: 0 },
  form: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  formTitle: { margin: '0 0 16px 0' },
  formButtons: { display: 'flex', gap: '8px' },
  filterRow: { display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' },
  filterField: { flex: 1 },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  itemSub: { color: '#666', fontSize: '14px', marginTop: '2px' },
  empty: { color: '#666', textAlign: 'center', padding: '24px 0' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  statusSelect: { padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnPrimary: { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnSecondary: { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnDelete: { padding: '6px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
}