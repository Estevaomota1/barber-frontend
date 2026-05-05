import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function loadClients() {
    try {
      const res = await api.get('/clients')
      setClients(res.data.data.data)
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
    setShowForm(true)
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
        await api.put(`/clients/${editing.id}`, { name, phone })
      } else {
        await api.post('/clients', { name, phone })
      }
      handleCancel()
      loadClients()
    } catch (err) {
      setError('Erro ao salvar cliente')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deletar este cliente?')) return
    try {
      await api.delete(`/clients/${id}`)
      loadClients()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={styles.loading}>Carregando...</div>

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>👥 Clientes</h2>
          <button onClick={() => showForm ? handleCancel() : setShowForm(true)} style={styles.btnPrimary}>
            {showForm ? 'Cancelar' : '+ Novo Cliente'}
          </button>
        </div>

        {showForm && (
          <div style={styles.form}>
            <h3 style={styles.formTitle}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Nome</label>
                <input
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Telefone</label>
                <input
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11999990001"
                  required
                />
              </div>
              <div style={styles.formButtons}>
                <button style={styles.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Salvar'}
                </button>
                <button style={styles.btnSecondary} type="button" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.section}>
          {clients.length === 0 ? (
            <p style={styles.empty}>Nenhum cliente cadastrado</p>
          ) : (
            clients.map((client) => (
              <div key={client.id} style={styles.item}>
                <div>
                  <strong>{client.name}</strong>
                  <div style={styles.itemSub}>📞 {client.phone}</div>
                </div>
                <div style={styles.actions}>
                  <button onClick={() => handleEdit(client)} style={styles.btnEdit}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(client.id)} style={styles.btnDelete}>
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
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  itemSub: { color: '#666', fontSize: '14px', marginTop: '2px' },
  empty: { color: '#666', textAlign: 'center', padding: '24px 0' },
  actions: { display: 'flex', gap: '8px' },
  btnPrimary: { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnSecondary: { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnEdit: { padding: '6px 14px', backgroundColor: '#dbeafe', color: '#2563eb', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnDelete: { padding: '6px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
}