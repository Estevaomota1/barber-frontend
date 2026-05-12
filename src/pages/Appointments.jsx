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
      setAppointments(apRes.data.data.data || [])
      setClients(clRes.data.data.data || [])
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
    if (!confirm('Deseja realmente cancelar este agendamento?')) return
    try {
      await api.delete(`/appointments/${id}`)
      loadData(filterDate)
    } catch (err) {
      console.error(err)
    }
  }

  const statusStyles = {
    pending:   { background: '#2a1f10', color: '#fb923c', border: '0.5px solid #7c2d12' },
    confirmed: { background: '#14271e', color: '#4ade80', border: '0.5px solid #166534' },
    cancelled: { background: '#2a1414', color: '#f87171', border: '0.5px solid #7f1d1d' },
    completed: { background: '#1c1f2e', color: '#818cf8', border: '0.5px solid #3730a3' },
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={{ color: '#a1a1aa', marginTop: '12px' }}>Carregando agenda...</span>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Agendamentos</h1>
            <p style={styles.pageSubtitle}>Gerencie os horários e serviços da sua barbearia</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            style={showForm ? styles.btnSecondary : styles.btnPrimary}
          >
            {showForm ? (
              <><i className="ti ti-x" style={{ marginRight: '6px' }}></i> Cancelar</>
            ) : (
              <><i className="ti ti-calendar-plus" style={{ marginRight: '6px' }}></i> Novo Agendamento</>
            )}
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Marcar Novo Horário</h2>
            
            {error && <div style={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cliente</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-user" style={styles.inputIcon}></i>
                    <select
                      style={styles.select}
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
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data e Hora</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-clock" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      type="datetime-local"
                      value={date.replace(' ', 'T').slice(0, 16)}
                      onChange={(e) => setDate(e.target.value.replace('T', ' ') + ':00')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <div style={styles.filterContainer}>
          <div style={styles.filterHeader}>
            <div style={styles.filterTitleGroup}>
              <div style={styles.filterIconBox}>
                <i className="ti ti-calendar-search" style={{ fontSize: '18px', color: '#f59e0b' }}></i>
              </div>
              <div>
                <h3 style={styles.filterTitle}>Explorar Agenda</h3>
                <p style={styles.filterSubtitle}>Selecione uma data para ver os horários</p>
              </div>
            </div>
            
            <div style={styles.filterActions}>
              <div style={styles.dateInputWrapper}>
                <input
                  style={styles.premiumDateInput}
                  type="date"
                  value={filterDate}
                  onChange={handleFilter}
                />
                <i className="ti ti-chevron-down" style={styles.dateChevron}></i>
              </div>
              
              {filterDate && (
                <button onClick={handleClearFilter} style={styles.premiumClearBtn}>
                  <i className="ti ti-refresh" style={{ marginRight: '6px' }}></i>
                  Ver Tudo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Lista de Horários</h2>
            <span style={styles.badge}>{appointments.length} agendamentos</span>
          </div>

          <div style={styles.listContainer}>
            {appointments.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="ti ti-calendar-x" style={{ fontSize: '48px', color: '#27272a', marginBottom: '12px' }}></i>
                <p>Nenhum agendamento encontrado para este período.</p>
              </div>
            ) : (
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Data e Hora</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.clientInfo}>
                            <div style={styles.avatar}>
                              {apt.client?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span style={styles.clientName}>{apt.client?.name}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateTime}>
                            <i className="ti ti-calendar" style={{ color: '#f59e0b', marginRight: '6px' }}></i>
                            {apt.appointment_date}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <select
                            style={{
                              ...styles.statusSelect,
                              ...statusStyles[apt.status] || statusStyles.pending
                            }}
                            value={apt.status}
                            onChange={(e) => handleStatus(apt.id, e.target.value)}
                          >
                            <option value="pending">Pendente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDelete(apt.id)} 
                            style={styles.iconBtnDelete}
                            title="Excluir"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#fff'
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#a1a1aa',
    margin: 0
  },
  card: {
    background: '#18181b',
    border: '0.5px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '0.5px solid #27272a'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
    color: '#fff'
  },
  badge: {
    fontSize: '12px',
    background: '#27272a',
    color: '#a1a1aa',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    color: '#a1a1aa',
    fontWeight: '500'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#09090b',
    border: '0.5px solid #3f3f46',
    borderRadius: '8px',
    padding: '0 12px',
    gap: '10px'
  },
  inputIcon: {
    fontSize: '16px',
    color: '#52525b'
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '14px',
    padding: '12px 0',
    width: '100%',
    fontFamily: 'inherit'
  },
  select: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '14px',
    padding: '12px 0',
    width: '100%',
    fontFamily: 'inherit',
    cursor: 'pointer'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f59e0b',
    color: '#09090b',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#27272a',
    color: '#fff',
    border: '0.5px solid #3f3f46',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  filterContainer: {
    background: 'linear-gradient(135deg, #18181b 0%, #111114 100%)',
    border: '1px solid #27272a',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '32px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  filterTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  filterIconBox: {
    width: '44px',
    height: '44px',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },
  filterTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0
  },
  filterSubtitle: {
    fontSize: '12px',
    color: '#71717a',
    margin: '2px 0 0 0'
  },
  filterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  dateInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  premiumDateInput: {
    background: '#09090b',
    border: '1px solid #3f3f46',
    borderRadius: '10px',
    color: '#fff',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '180px',
    appearance: 'none',
    WebkitAppearance: 'none'
  },
  dateChevron: {
    position: 'absolute',
    right: '12px',
    color: '#52525b',
    pointerEvents: 'none',
    fontSize: '14px'
  },
  premiumClearBtn: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    color: '#f87171',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  tableResponsive: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#71717a',
    fontWeight: '600',
    padding: '12px 16px',
    letterSpacing: '0.05em'
  },
  tr: {
    borderBottom: '0.5px solid #27272a',
    transition: 'background 0.2s'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  clientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    background: '#27272a',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#f59e0b',
    border: '0.5px solid #3f3f46'
  },
  clientName: {
    fontWeight: '500',
    color: '#fff'
  },
  dateTime: {
    display: 'flex',
    alignItems: 'center',
    color: '#a1a1aa'
  },
  statusSelect: {
    padding: '4px 12px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none'
  },
  iconBtnDelete: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '0.5px solid #450a0a',
    background: '#18181b',
    color: '#f87171',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 0',
    color: '#71717a'
  },
  errorAlert: {
    background: '#2a1414',
    border: '0.5px solid #7f1d1d',
    color: '#f87171',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '13px'
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