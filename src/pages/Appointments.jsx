import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

const STATUS_PT = {
  pending:   'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr.replace(' ', 'T'))
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) + ' às ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })
}

function combineDatetime(datePart, timePart) {
  if (!datePart || !timePart) return ''
  return `${datePart} ${timePart}:00`
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients]     = useState([])
  const [barbers, setBarbers]     = useState([])
  const [services, setServices]   = useState([])
  const [loading, setLoading]     = useState(true)

  // Form state
  const [clientId, setClientId]   = useState('')
  const [barberId, setBarberId]   = useState('')
  const [serviceId, setServiceId] = useState('')
  const [datePart, setDatePart]   = useState('')
  const [timePart, setTimePart]   = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [showForm, setShowForm]   = useState(false)

  async function loadData(filter = '') {
    try {
      const url = filter ? `/appointments?date=${filter}` : '/appointments'
      const [apRes, clRes, baRes, svRes] = await Promise.all([
        api.get(url),
        api.get('/clients'),
        api.get('/barbers'),
        api.get('/services'),
      ])
      setAppointments(apRes.data.data.data || [])
      setClients(clRes.data.data.data || [])
      setBarbers(baRes.data.data.data || [])
      const svData = svRes.data.services || svRes.data.data || svRes.data || []
      setServices(Array.isArray(svData) ? svData : [])
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

  // Auto-fill time when service is selected
  const selectedService = Array.isArray(services) ? services.find(s => String(s.id) === String(serviceId)) : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!datePart || !timePart) { setError('Selecione a data e o horário.'); return }
    if (!barberId)  { setError('Selecione um barbeiro.'); return }
    if (!serviceId) { setError('Selecione um serviço.'); return }
    setSaving(true)
    setError('')
    try {
    await api.post('/appointments', {
    client_id:        clientId || null,
    barber_id:        barberId,
    service_id:       serviceId,
    appointment_date: combineDatetime(datePart, timePart),
})
    console.log('📤 Payload enviado:', payload)
    console.log('📅 Data bruta:', datePart, timePart)
    console.log('🔗 Data combinada:', combineDatetime(datePart, timePart))
      setClientId(''); setBarberId(''); setServiceId('')
      setDatePart(''); setTimePart('')
      setShowForm(false)
      loadData(filterDate)
    } catch (err) {
          console.log('📥 Resposta do erro:', err.response?.data)
      setError(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatus(id, status) {
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      loadData(filterDate)
    } catch (err) { console.error(err) }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return
    try {
      await api.delete(`/appointments/${id}`)
      loadData(filterDate)
    } catch (err) { console.error(err) }
  }

  const statusStyles = {
    pending:   { background: '#2a1f10', color: '#fb923c', border: '0.5px solid #7c2d12' },
    confirmed: { background: '#14271e', color: '#4ade80', border: '0.5px solid #166534' },
    cancelled: { background: '#2a1414', color: '#f87171', border: '0.5px solid #7f1d1d' },
    completed: { background: '#1c1f2e', color: '#818cf8', border: '0.5px solid #3730a3' },
  }

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <span style={{ color: '#a1a1aa', marginTop: '12px' }}>Carregando agenda...</span>
    </div>
  )

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ap-select option { background: #1c1c1f !important; color: #fff !important; }
        .ap-select:focus { border-color: #f59e0b !important; outline: none; }
        .ap-date-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
        .ap-date-input:focus { border-color: #f59e0b !important; outline: none; }
        .ap-date-time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ap-action-btn { min-height: 44px; }
        @media (max-width: 640px) { .ap-table-wrap { font-size: 13px; } .ap-col-barber { display: none; } }
      `}</style>

      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Agendamentos</h1>
            <p style={styles.pageSubtitle}>Gerencie os horários e serviços da sua barbearia</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            style={showForm ? styles.btnSecondary : styles.btnPrimary}
            className="ap-action-btn"
          >
            {showForm
              ? <><i className="ti ti-x" style={{ marginRight: '6px' }}></i>Cancelar</>
              : <><i className="ti ti-calendar-plus" style={{ marginRight: '6px' }}></i>Novo Agendamento</>
            }
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <i className="ti ti-calendar-plus" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
              Marcar Novo Horário
            </h2>

            {error && (
              <div style={styles.errorAlert}>
                <i className="ti ti-alert-circle" style={{ marginRight: '8px' }}></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Linha 1: Barbeiro + Serviço */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <i className="ti ti-scissors" style={{ marginRight: '6px', color: '#f59e0b' }}></i>
                    Barbeiro *
                  </label>
                  <select className="ap-select" style={styles.selectField} value={barberId} onChange={e => setBarberId(e.target.value)} required>
                    <option value="">— Selecione —</option>
                    {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <i className="ti ti-tag" style={{ marginRight: '6px', color: '#f59e0b' }}></i>
                    Serviço *
                  </label>
                  <select className="ap-select" style={styles.selectField} value={serviceId} onChange={e => setServiceId(e.target.value)} required>
                    <option value="">— Selecione —</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — R$ {Number(s.price).toFixed(2)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview do serviço */}
              {selectedService && (
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#a1a1aa', display: 'flex', gap: '16px' }}>
                  <span>⏱ {selectedService.duration} min</span>
                  <span>💰 R$ {Number(selectedService.price).toFixed(2)}</span>
                </div>
              )}

              {/* Cliente (opcional) */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <i className="ti ti-user" style={{ marginRight: '6px', color: '#f59e0b' }}></i>
                  Cliente <span style={{ color: '#52525b', fontWeight: '400' }}>(opcional — pode ser walk-in)</span>
                </label>
                              {clients.length === 0 ? (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                    <i className="ti ti-alert-circle" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
                    Nenhum cliente cadastrado ainda.
                  </span>
                  <a href="/clients" style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Cadastrar cliente →
                  </a>
                </div>
              ) : (
                <select className="ap-select" style={styles.selectField} value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">— Walk-in / sem cadastro —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              </div>

              {/* Data + Hora */}
              <div>
                <label style={styles.label}>
                  <i className="ti ti-clock" style={{ marginRight: '6px', color: '#f59e0b' }}></i>
                  Data e Horário *
                </label>
                <div className="ap-date-time-row" style={{ marginTop: '8px' }}>
                  <div style={styles.dateBlock}>
                    <span style={styles.dateBlockLabel}><i className="ti ti-calendar" style={{ marginRight: '5px' }}></i>Data</span>
                    <input className="ap-date-input" style={styles.dateInput} type="date" value={datePart} onChange={e => setDatePart(e.target.value)} required />
                    {datePart && (
                      <span style={styles.datePreview}>
                        {new Date(datePart + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                      </span>
                    )}
                  </div>
                  <div style={styles.dateBlock}>
                    <span style={styles.dateBlockLabel}><i className="ti ti-clock" style={{ marginRight: '5px' }}></i>Horário</span>
                    <input className="ap-date-input" style={styles.dateInput} type="time" value={timePart} onChange={e => setTimePart(e.target.value)} required />
                    {timePart && <span style={styles.datePreview}>{timePart}h (horário de Brasília)</span>}
                  </div>
                </div>

                {datePart && timePart && (
                  <div style={styles.datetimePreviewBox}>
                    <i className="ti ti-calendar-check" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
                    Agendamento: <strong style={{ color: '#fff', marginLeft: '4px' }}>
                      {new Date(datePart + 'T' + timePart).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} às {timePart}h
                    </strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={styles.btnPrimary} type="submit" disabled={saving} className="ap-action-btn">
                  {saving
                    ? <><i className="ti ti-loader-2" style={{ marginRight: '6px' }}></i>Agendando...</>
                    : <><i className="ti ti-check" style={{ marginRight: '6px' }}></i>Confirmar Agendamento</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div style={styles.filterContainer}>
          <div style={styles.filterHeader}>
            <div style={styles.filterTitleGroup}>
              <div style={styles.filterIconBox}>
                <i className="ti ti-calendar-search" style={{ fontSize: '18px', color: '#f59e0b' }}></i>
              </div>
              <div>
                <h3 style={styles.filterTitle}>Explorar Agenda</h3>
                <p style={styles.filterSubtitle}>Selecione uma data para filtrar</p>
              </div>
            </div>
            <div style={styles.filterActions}>
              <input className="ap-date-input" style={{ ...styles.dateInput, minWidth: '160px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px 12px' }} type="date" value={filterDate} onChange={handleFilter} />
              {filterDate && (
                <button onClick={handleClearFilter} style={styles.premiumClearBtn}>
                  <i className="ti ti-refresh" style={{ marginRight: '6px' }}></i>Ver Tudo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Lista de Horários</h2>
            <span style={styles.badge}>{appointments.length} agendamentos</span>
          </div>

          {appointments.length === 0 ? (
            <div style={styles.emptyState}>
              <i className="ti ti-calendar-x" style={{ fontSize: '48px', color: '#27272a', marginBottom: '12px' }}></i>
              <p>Nenhum agendamento encontrado para este período.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }} className="ap-table-wrap">
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
                            {(apt.client?.name || apt.client_name)?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <span style={styles.clientName}>
                              {apt.client?.name || apt.client_name || 'Walk-in'}
                            </span>
                            {apt.barber && (
                              <div className="ap-col-barber" style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                                ✂️ {apt.barber.name}
                                {(apt.service?.name || apt.service_name) && ` • ${apt.service?.name || apt.service_name}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateTime}>
                          <i className="ti ti-calendar" style={{ color: '#f59e0b', marginRight: '6px', flexShrink: 0 }}></i>
                          {formatDate(apt.appointment_date)}
                        </div>
                        {apt.price > 0 && (
                          <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                            R$ {Number(apt.price).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <select
                          className="ap-select"
                          style={{ ...styles.statusSelect, ...(statusStyles[apt.status] || statusStyles.pending) }}
                          value={apt.status}
                          onChange={e => handleStatus(apt.id, e.target.value)}
                        >
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="cancelled">Cancelado</option>
                          <option value="completed">Concluído</option>
                        </select>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button onClick={() => handleDelete(apt.id)} style={styles.iconBtnDelete} title="Excluir">
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
  )
}

const styles = {
  pageWrapper: { minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' },
  pageTitle: { fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '600', margin: '0 0 6px 0', color: '#fff' },
  pageSubtitle: { fontSize: '14px', color: '#a1a1aa', margin: 0 },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '14px', padding: '24px', marginBottom: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '0.5px solid #27272a' },
  cardTitle: { fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0', color: '#fff', display: 'flex', alignItems: 'center' },
  badge: { fontSize: '12px', background: '#27272a', color: '#a1a1aa', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: '#a1a1aa', fontWeight: '500', display: 'flex', alignItems: 'center' },
  selectField: { width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '12px 16px', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '40px' },
  dateBlock: { background: '#09090b', border: '1px solid #3f3f46', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' },
  dateBlockLabel: { fontSize: '11px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' },
  dateInput: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '15px', fontWeight: '500', fontFamily: 'inherit', width: '100%', cursor: 'pointer' },
  datePreview: { fontSize: '11px', color: '#f59e0b', fontWeight: '500' },
  datetimePreviewBox: { marginTop: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f59e0b', color: '#09090b', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#27272a', color: '#fff', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  filterContainer: { background: 'linear-gradient(135deg, #18181b 0%, #111114 100%)', border: '1px solid #27272a', borderRadius: '14px', padding: '18px 20px', marginBottom: '28px' },
  filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  filterTitleGroup: { display: 'flex', alignItems: 'center', gap: '14px' },
  filterIconBox: { width: '42px', height: '42px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)', flexShrink: 0 },
  filterTitle: { fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 },
  filterSubtitle: { fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' },
  filterActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  premiumClearBtn: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { fontSize: '12px', textTransform: 'uppercase', color: '#71717a', fontWeight: '600', padding: '10px 14px', letterSpacing: '0.05em' },
  tr: { borderBottom: '0.5px solid #27272a' },
  td: { padding: '14px', fontSize: '14px', verticalAlign: 'middle' },
  clientInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', background: '#27272a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#f59e0b', border: '0.5px solid #3f3f46', flexShrink: 0 },
  clientName: { fontWeight: '500', color: '#fff' },
  dateTime: { display: 'flex', alignItems: 'center', color: '#a1a1aa' },
  statusSelect: { padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' },
  iconBtnDelete: { width: '32px', height: '32px', borderRadius: '6px', border: '0.5px solid #450a0a', background: '#18181b', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { textAlign: 'center', padding: '48px 0', color: '#71717a' },
  errorAlert: { background: '#2a1414', border: '0.5px solid #7f1d1d', color: '#f87171', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center' },
  loadingContainer: { minHeight: '100vh', background: '#09090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' },
}