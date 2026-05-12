import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function Barbers() {
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function loadBarbers() {
    try {
      const res = await api.get('/barbers')
      setBarbers(res.data.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBarbers() }, [])

  function handleEdit(barber) {
    setEditing(barber)
    setName(barber.name)
    setPhone(barber.phone || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setEditing(null)
    setName('')
    setPhone('')
    setShowForm(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/barbers/${editing.id}`, { name, phone })
      } else {
        await api.post('/barbers', { name, phone })
      }
      handleCancel()
      loadBarbers()
    } catch (err) {
      setError('Erro ao salvar barbeiro. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja remover este barbeiro da equipe?')) return
    try {
      await api.delete(`/barbers/${id}`)
      loadBarbers()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={{ color: '#a1a1aa', marginTop: '12px' }}>Carregando equipe...</span>
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
            <h1 style={styles.pageTitle}>Barbeiros</h1>
            <p style={styles.pageSubtitle}>Gerencie sua equipe de profissionais</p>
          </div>
          <button 
            onClick={() => showForm ? handleCancel() : setShowForm(true)} 
            style={showForm ? styles.btnSecondary : styles.btnPrimary}
          >
            {showForm ? (
              <><i className="ti ti-x" style={{ marginRight: '6px' }}></i> Cancelar</>
            ) : (
              <><i className="ti ti-plus" style={{ marginRight: '6px' }}></i> Novo Barbeiro</>
            )}
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              {editing ? 'Editar Profissional' : 'Adicionar Novo Barbeiro'}
            </h2>
            
            {error && <div style={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome do Profissional</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-scissors" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Barber"
                      required
                    />
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Telefone (Opcional)</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-phone" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-0000"
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar Cadastro' : 'Confirmar Adição'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team Grid */}
        <div style={styles.teamGrid}>
          {barbers.length === 0 ? (
            <div style={{ ...styles.card, gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <i className="ti ti-users-group" style={{ fontSize: '48px', color: '#27272a', marginBottom: '16px' }}></i>
              <p style={{ color: '#71717a' }}>Nenhum barbeiro cadastrado na equipe.</p>
            </div>
          ) : (
            barbers.map((barber) => (
              <div key={barber.id} style={styles.barberCard}>
                <div style={styles.barberHeader}>
                  <div style={styles.avatar}>
                    {barber.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.barberActions}>
                    <button onClick={() => handleEdit(barber)} style={styles.iconBtn} title="Editar">
                      <i className="ti ti-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(barber.id)} style={styles.iconBtnDelete} title="Excluir">
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div style={styles.barberInfo}>
                  <h3 style={styles.barberName}>{barber.name}</h3>
                  <div style={styles.barberContact}>
                    <i className="ti ti-phone" style={{ fontSize: '14px', color: '#52525b' }}></i>
                    <span>{barber.phone || 'Sem telefone'}</span>
                  </div>
                </div>

                <div style={styles.barberFooter}>
                  <span style={styles.statusBadge}>Ativo</span>
                  <div style={styles.rating}>
                    <i className="ti ti-star-filled" style={{ color: '#f59e0b', fontSize: '12px' }}></i>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>5.0</span>
                  </div>
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
    marginBottom: '32px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 20px 0',
    color: '#fff'
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
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  barberCard: {
    background: '#18181b',
    border: '0.5px solid #27272a',
    borderRadius: '16px',
    padding: '20px',
    transition: 'transform 0.2s, border-color 0.2s',
    position: 'relative',
    overflow: 'hidden'
  },
  barberHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  avatar: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    color: '#f59e0b',
    border: '0.5px solid #3f3f46'
  },
  barberActions: {
    display: 'flex',
    gap: '6px'
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '0.5px solid #3f3f46',
    background: '#09090b',
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
    borderRadius: '8px',
    border: '0.5px solid #450a0a',
    background: '#09090b',
    color: '#f87171',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  barberInfo: {
    marginBottom: '20px'
  },
  barberName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 6px 0'
  },
  barberContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#71717a'
  },
  barberFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '0.5px solid #27272a'
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#4ade80',
    background: '#14271e',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase'
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#27272a',
    padding: '2px 8px',
    borderRadius: '12px'
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