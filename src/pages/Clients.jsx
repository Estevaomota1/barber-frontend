import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

// Helper para formatar data e hora no padrão brasileiro
const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Helper para obter a data atual no formato YYYY-MM-DDTHH:mm para o input datetime-local
const getCurrentDateTimeLocal = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('') // Novo campo
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function loadClients() {
    try {
      const res = await api.get('/clients')
      // Mantendo a estrutura de dados do seu código original
      setClients(res.data.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClients() }, [])

  function handleEdit(client) {
    setEditing(client)
    setName(client.name)
    setPhone(client.phone)
    // Se o cliente já tiver uma data, formatamos para o input local
    if (client.appointment_date) {
        const date = new Date(client.appointment_date)
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
        setAppointmentDate(date.toISOString().slice(0, 16))
    } else {
        setAppointmentDate('')
    }
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setEditing(null)
    setName('')
    setPhone('')
    setAppointmentDate('')
    setShowForm(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Validação básica de data
    if (appointmentDate) {
        const selectedDate = new Date(appointmentDate)
        const now = new Date()
        if (selectedDate < now) {
            setError('A data do agendamento não pode ser no passado.')
            return
        }
    }

    setSaving(true)
    setError('')
    try {
      const payload = { 
        name, 
        phone, 
        appointment_date: appointmentDate || null 
      }

      if (editing) {
        await api.put(`/clients/${editing.id}`, payload)
      } else {
        await api.post('/clients', payload)
      }
      handleCancel()
      loadClients()
    } catch (err) {
      setError('Erro ao salvar cliente. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await api.delete(`/clients/${id}`)
      loadClients()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={{ color: '#a1a1aa', marginTop: '12px' }}>Carregando clientes...</span>
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
            <h1 style={styles.pageTitle}>Clientes & Agendamentos</h1>
            <p style={styles.pageSubtitle}>Gerencie sua base de clientes e horários marcados</p>
          </div>
          <button 
            onClick={() => showForm ? handleCancel() : setShowForm(true)} 
            style={showForm ? styles.btnSecondary : styles.btnPrimary}
          >
            {showForm ? (
              <><i className="ti ti-x" style={{ marginRight: '6px' }}></i> Cancelar</>
            ) : (
              <><i className="ti ti-plus" style={{ marginRight: '6px' }}></i> Novo Agendamento</>
            )}
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              {editing ? 'Editar Informações' : 'Cadastrar Novo Agendamento'}
            </h2>
            
            {error && <div style={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome Completo</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-user" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Telefone / WhatsApp</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-phone" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-0000"
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data e Hora do Agendamento</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-calendar-event" style={styles.inputIcon}></i>
                    <input
                      type="datetime-local"
                      style={styles.input}
                      value={appointmentDate}
                      min={getCurrentDateTimeLocal()}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Processando...' : editing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Lista de Clientes e Horários</h2>
            <span style={styles.badge}>{clients.length} registros</span>
          </div>

          <div style={styles.listContainer}>
            {clients.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="ti ti-users" style={{ fontSize: '48px', color: '#27272a', marginBottom: '12px' }}></i>
                <p>Nenhum registro encontrado.</p>
              </div>
            ) : (
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Contato</th>
                      <th style={styles.th}>Agendamento</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.clientInfo}>
                            <div style={styles.avatar}>
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={styles.clientName}>{client.name}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.phoneLink}>
                            <i className="ti ti-brand-whatsapp" style={{ color: '#22c55e', marginRight: '6px' }}></i>
                            {client.phone}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateInfo}>
                            <i className="ti ti-clock" style={{ color: '#f59e0b', marginRight: '6px' }}></i>
                            {client.appointment_date ? formatDateTime(client.appointment_date) : 'Sem data'}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionButtons}>
                            <button 
                              onClick={() => handleEdit(client)} 
                              style={styles.iconBtnEdit}
                              title="Editar"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(client.id)} 
                              style={styles.iconBtnDelete}
                              title="Excluir"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
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
    gap: '10px',
    transition: 'border-color 0.2s'
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
    cursor: 'pointer',
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
  phoneLink: {
    display: 'flex',
    alignItems: 'center',
    color: '#a1a1aa'
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    color: '#e4e4e7'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  iconBtnEdit: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '0.5px solid #3f3f46',
    background: '#18181b',
    color: '#a1a1aa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
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
    justifyContent: 'center',
    transition: 'all 0.2s'
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
