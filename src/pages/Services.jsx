import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

function formatDuration(minutes) {
  if (!minutes) return '-'
  const m = Number(minutes)
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h${String(min).padStart(2, '0')}`
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', duration: 30, description: '' })

  const token = localStorage.getItem('token')
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/services`, { headers })
      const data = await res.json()
      setServices(data.services || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', price: '', duration: 30, description: '' })
    setShowModal(true)
  }

  const openEdit = (service) => {
    setEditing(service)
    setForm({ name: service.name, price: service.price, duration: service.duration, description: service.description || '' })
    setShowModal(true)
  }

  const save = async () => {
    const url = editing ? `${API}/services/${editing.id}` : `${API}/services`
    const method = editing ? 'PUT' : 'POST'
    try {
      await fetch(url, { method, headers, body: JSON.stringify(form) })
      setShowModal(false)
      fetchServices()
    } catch (err) {
      console.error(err)
    }
  }

  const toggle = async (service) => {
    try {
      await fetch(`${API}/services/${service.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ active: !service.active }),
      })
      fetchServices()
    } catch (err) {
      console.error(err)
    }
  }

  const destroy = async (id) => {
    if (!confirm('Excluir serviço?')) return
    try {
      await fetch(`${API}/services/${id}`, { method: 'DELETE', headers })
      fetchServices()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Serviços</h1>
            <p style={s.subtitle}>Cadastre os serviços que sua barbearia oferece</p>
          </div>
          <button onClick={openNew} style={s.newBtn}>
            <i className="ti ti-plus" style={{ marginRight: '6px' }}></i>
            Novo Serviço
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={s.empty}>Carregando...</div>
        ) : services.length === 0 ? (
          <div style={s.emptyBox}>
            <i className="ti ti-cut" style={{ fontSize: '48px', color: '#27272a', marginBottom: '12px' }}></i>
            <p style={{ color: '#71717a', margin: 0 }}>Nenhum serviço cadastrado ainda.</p>
            <p style={{ color: '#52525b', fontSize: '13px', margin: '8px 0 0' }}>Clique em "Novo Serviço" para começar.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {services.map(sv => (
              <div key={sv.id} style={{ ...s.card, opacity: sv.active ? 1 : 0.5 }}>
                <div style={s.cardTop}>
                  <div style={s.cardIcon}>✂️</div>
                  <div style={s.cardActions}>
                    <button onClick={() => openEdit(sv)} style={s.iconBtn}>
                      <i className="ti ti-pencil"></i>
                    </button>
                    <button onClick={() => toggle(sv)} style={s.iconBtn} title={sv.active ? 'Desativar' : 'Ativar'}>
                      <i className={`ti ${sv.active ? 'ti-eye' : 'ti-eye-off'}`}></i>
                    </button>
                    <button onClick={() => destroy(sv.id)} style={{ ...s.iconBtn, color: '#f87171' }}>
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
                <h3 style={s.cardName}>{sv.name}</h3>
                {sv.description && <p style={s.cardDesc}>{sv.description}</p>}
                <div style={s.cardFooter}>
                  <span style={s.cardPrice}>R$ {Number(sv.price).toFixed(2)}</span>
                  <span style={s.cardDuration}>
                    <i className="ti ti-clock" style={{ marginRight: '4px' }}></i>
                    {formatDuration(sv.duration)}
                  </span>
                </div>
                {!sv.active && <span style={s.inactiveBadge}>Inativo</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editing ? 'Editar Serviço' : 'Novo Serviço'}</h2>

            <label style={s.label}>Nome do Serviço</label>
            <input
              style={s.input}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Corte, Barba, Progressiva..."
            />

            <label style={s.label}>Preço (R$)</label>
            <input
              style={s.input}
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />

            <label style={s.label}>Duração (minutos)</label>
            <input
              style={s.input}
              type="number"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              placeholder="30"
            />

            <label style={s.label}>Descrição (opcional)</label>
            <input
              style={s.input}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Descrição do serviço..."
            />

            <div style={s.modalBtns}>
              <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancelar</button>
              <button onClick={save} style={s.confirmBtn}>
                {editing ? 'Salvar' : 'Criar Serviço'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: '#71717a', margin: '4px 0 0' },
  newBtn: { background: '#f59e0b', color: '#09090b', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px', position: 'relative' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardIcon: { fontSize: '28px' },
  cardActions: { display: 'flex', gap: '6px' },
  iconBtn: { background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px', padding: '4px' },
  cardName: { fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 6px' },
  cardDesc: { fontSize: '13px', color: '#71717a', margin: '0 0 12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: '20px', fontWeight: '700', color: '#f59e0b' },
  cardDuration: { fontSize: '13px', color: '#71717a', display: 'flex', alignItems: 'center' },
  inactiveBadge: { position: 'absolute', top: '12px', right: '12px', background: '#27272a', color: '#71717a', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' },
  empty: { textAlign: 'center', color: '#71717a', padding: '60px' },
  emptyBox: { textAlign: 'center', padding: '80px 20px', background: '#18181b', borderRadius: '12px', border: '0.5px solid #27272a' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 20px' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#09090b', color: '#a1a1aa', fontSize: '14px', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#09090b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
}