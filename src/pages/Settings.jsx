import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

export default function Settings() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    opening_time: '09:00',
    closing_time: '18:00',
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const token = localStorage.getItem('token')
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  useEffect(() => {
  fetch(`${API}/my-barbershop`, { headers })
    .then(r => r.json())
    .then(d => {
      setForm({
        name:         d.name         || '',
        phone:        d.phone        || '',
        address:      d.address      || '',
        description:  d.description  || '',
        opening_time: d.opening_time || '09:00',
        closing_time: d.closing_time || '18:00',
      })
      setLoading(false)
    })
    .catch(() => setLoading(false))
}, [])

  const save = async () => {
    try {
      await fetch(`${API}/my-barbershop`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div style={s.page}>
      <Navbar />
      <div style={s.empty}>Carregando...</div>
    </div>
  )

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        <div style={s.header}>
          <div>
            <h1 style={s.title}>Configurações</h1>
            <p style={s.subtitle}>Gerencie as informações da sua barbearia</p>
          </div>
        </div>

        <div style={s.card}>
          <h2 style={s.sectionTitle}>
            <i className="ti ti-building-store" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
            Informações da Barbearia
          </h2>

          <label style={s.label}>Nome da Barbearia</label>
          <input
            style={s.input}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Barbearia do João"
          />

          <label style={s.label}>Telefone / WhatsApp</label>
          <input
            style={s.input}
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Ex: (11) 99999-9999"
          />

          <label style={s.label}>Endereço</label>
          <input
            style={s.input}
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Ex: Av. Principal, 123 - Bairro - Cidade/UF"
          />

          <label style={s.label}>Descrição</label>
          <textarea
            style={{ ...s.input, height: '80px', resize: 'vertical' }}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Frase de apresentação da barbearia..."
          />

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Horário de Abertura</label>
              <input
                style={s.input}
                type="time"
                value={form.opening_time}
                onChange={e => setForm({ ...form, opening_time: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Horário de Fechamento</label>
              <input
                style={s.input}
                type="time"
                value={form.closing_time}
                onChange={e => setForm({ ...form, closing_time: e.target.value })}
              />
            </div>
          </div>

          <button onClick={save} style={s.saveBtn}>
            <i className={`ti ${saved ? 'ti-check' : 'ti-device-floppy'}`} style={{ marginRight: '8px' }}></i>
            {saved ? 'Salvo!' : 'Salvar Configurações'}
          </button>
        </div>

        {/* Link de Agendamento */}
        <div style={{ ...s.card, marginTop: '20px' }}>
          <h2 style={s.sectionTitle}>
            <i className="ti ti-link" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
            Link de Agendamento
          </h2>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 16px' }}>
            Compartilhe este link com seus clientes
          </p>
          <LinkBox />
        </div>

      </div>
    </div>
  )
}

function LinkBox() {
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetch('https://barber-saas-1-fpjl.onrender.com/api/my-barbershop', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
      .then(r => r.json())
      .then(d => { if (d.slug) setSlug(d.slug) })
  }, [])

  const link = `https://barber-frontend-tan.vercel.app/agendar/${slug}`

  const copy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsapp = () => {
    const msg = encodeURIComponent(`Olá! Agende seu horário aqui: ${link}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (!slug) return <p style={{ fontSize: '13px', color: '#71717a' }}>Carregando...</p>

  return (
    <div>
      <div style={{ background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#a1a1aa', marginBottom: '12px', wordBreak: 'break-all' }}>
        {link}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={copy} style={{ flex: 1, padding: '10px', background: copied ? '#14532d' : '#27272a', border: 'none', borderRadius: '8px', color: copied ? '#4ade80' : '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`}></i>
          {copied ? 'Copiado!' : 'Copiar Link'}
        </button>
        <button onClick={whatsapp} style={{ flex: 1, padding: '10px', background: '#14532d', border: 'none', borderRadius: '8px', color: '#4ade80', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <i className="ti ti-brand-whatsapp"></i>
          Enviar WhatsApp
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '32px 20px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: '#71717a', margin: '4px 0 0' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '16px', marginTop: '4px' },
  saveBtn: { marginTop: '24px', width: '100%', padding: '12px', background: '#f59e0b', color: '#09090b', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#71717a', padding: '60px' },
}