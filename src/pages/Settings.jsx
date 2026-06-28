import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
 
const API = 'https://barber-saas-1-fpjl.onrender.com/api'
 
export default function Settings( ) {
  const [form, setForm] = useState({
  name: '',  phone: '',  address: '',  description: '',  opening_time: '07:00',  closing_time: '18:00',  logo: '',
  working_hours: {    monday: {      active: true,      open: '07:00',      close: '18:00'    },
  tuesday: {      active: true,      open: '07:00',      close: '18:00'    },
  wednesday: {      active: true,      open: '07:00',      close: '18:00'    },
  thursday: {      active: true,      open: '07:00',      close: '18:00'    },
  friday: {      active: true,      open: '07:00',      close: '18:00'    },
  saturday: {      active: true,      open: '07:00',      close: '18:00'    },
  sunday: {      active: true,      open: '07:00',     close: '18:00'   }
  }
})
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [savedPix, setSavedPix] = useState({})
  const logoRef = useRef()
 
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
          logo:         d.logo         || '',
        })
        setBarbers(d.barbers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
 
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({ ...f, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }
 
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
 
  const handlePixUpload = (barberId, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const pix_qr = ev.target.result
      setBarbers(bs => bs.map(b => b.id === barberId ? { ...b, pix_qr } : b))
      try {
        await fetch(`${API}/barbers/${barberId}/pix`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ pix_qr }),
        })
        setSavedPix(s => ({ ...s, [barberId]: true }))
        setTimeout(() => setSavedPix(s => ({ ...s, [barberId]: false })), 3000)
      } catch (err) {
        console.error(err)
      }
    }
    reader.readAsDataURL(file)
  }
 
  const removePix = async (barberId) => {
    setBarbers(bs => bs.map(b => b.id === barberId ? { ...b, pix_qr: '' } : b))
    try {
      await fetch(`${API}/barbers/${barberId}/pix`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ pix_qr: null }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const savePixKey = async (barberId, pixKey, headers) => {
    try {
      await fetch(`${API}/barbers/${barberId}/pix`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ pix_key: pixKey }),
      })
      setBarbers(bs => bs.map(b => b.id === barberId ? { ...b, pix_key: pixKey } : b))
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
 
        {/* Logo da Barbearia */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>
            <i className="ti ti-photo" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
            Logo da Barbearia
          </h2>
          <p style={s.hint}>Aparece na página de agendamento dos seus clientes</p>
 
          <div style={s.logoArea}>
            {form.logo ? (
              <div style={s.logoPreviewWrap}>
                <img src={form.logo} alt="Logo" style={s.logoPreview} />
                <button onClick={() => setForm(f => ({ ...f, logo: '' }))} style={s.removeBtn}>
                  <i className="ti ti-trash" style={{ marginRight: '4px' }}></i>Remover
                </button>
              </div>
            ) : (
              <div style={s.logoPlaceholder} onClick={() => logoRef.current.click()}>
                <i className="ti ti-upload" style={{ fontSize: '28px', color: '#52525b', marginBottom: '8px' }}></i>
                <span style={{ fontSize: '13px', color: '#71717a' }}>Clique para fazer upload da logo</span>
                <span style={{ fontSize: '11px', color: '#52525b', marginTop: '4px' }}>PNG, JPG ou SVG</span>
              </div>
            )}
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            {form.logo && (
              <button onClick={() => logoRef.current.click()} style={s.changeBtn}>
                <i className="ti ti-pencil" style={{ marginRight: '6px' }}></i>Trocar imagem
              </button>
            )}
          </div>
        </div>
 
        
       {/* Informações da Barbearia */}
{/* Informações da Barbearia */}
<div style={{ ...s.card, marginTop: '20px' }}>
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

  <h3 style={{ color: "#fff", marginTop: 20, marginBottom: 15 }}>
    Horário de Funcionamento
  </h3>

  {[
    ["monday", "Segunda"],
    ["tuesday", "Terça"],
    ["wednesday", "Quarta"],
    ["thursday", "Quinta"],
    ["friday", "Sexta"],
    ["saturday", "Sábado"],
    ["sunday", "Domingo"],
  ].map(([key, label]) => (
    <div
      key={key}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <label style={{ width: 90, color: "#fff" }}>
        {label}
      </label>

      <input
        type="checkbox"
        checked={form.working_hours?.[key]?.active ?? true}
        onChange={(e) =>
          setForm({
            ...form,
            working_hours: {
              ...form.working_hours,
              [key]: {
                ...form.working_hours?.[key],
                active: e.target.checked,
              },
            },
          })
        }
      />

      <input
        style={s.input}
        type="time"
        value={form.working_hours?.[key]?.open ?? "09:00"}
        onChange={(e) =>
          setForm({
            ...form,
            working_hours: {
              ...form.working_hours,
              [key]: {
                ...form.working_hours?.[key],
                open: e.target.value,
              },
            },
          })
        }
      />

      <span style={{ color: "#aaa" }}>até</span>

      <input
        style={s.input}
        type="time"
        value={form.working_hours?.[key]?.close ?? "18:00"}
        onChange={(e) =>
          setForm({
            ...form,
            working_hours: {
              ...form.working_hours,
              [key]: {
                ...form.working_hours?.[key],
                close: e.target.value,
              },
            },
          })
        }
      />
    </div>
  ))}

  {/* BOTÃO SALVAR – único, no final do card */}
  <button onClick={save} style={s.saveBtn}>
    <i
      className={`ti ${saved ? 'ti-check' : 'ti-device-floppy'}`}
      style={{ marginRight: '8px' }}
    ></i>
    {saved ? 'Salvo!' : 'Salvar Configurações'}
  </button>
</div>
        {/* QR Code Pix por Barbeiro */}
        <div style={{ ...s.card, marginTop: '20px' }}>
          <h2 style={s.sectionTitle}>
            <i className="ti ti-qrcode" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
            QR Code Pix dos Barbeiros
          </h2>
          <p style={s.hint}>Aparece na tela de confirmação após o cliente agendar</p>
 
          {barbers.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#71717a' }}>
              Nenhum barbeiro cadastrado. <a href="/barbers" style={{ color: '#f59e0b' }}>Cadastrar barbeiros</a>
            </p>
          ) : (
            <div style={s.barberPixList}>
              {barbers.map(barber => (
                <div key={barber.id} style={s.barberPixCard}>
                  <div style={s.barberPixHeader}>
                    <div style={s.barberPixAvatar}>{barber.name[0].toUpperCase()}</div>
                    <div>
                      <p style={s.barberPixName}>{barber.name}</p>
                      <p style={s.barberPixRole}>Barbeiro</p>
                    </div>
                    {savedPix[barber.id] && (
                      <span style={s.savedBadge}>
                        <i className="ti ti-check" style={{ marginRight: '4px' }}></i>Salvo!
                      </span>
                    )}
                  </div>
 
                  {barber.pix_qr ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={s.pixPreviewWrap}>
                        <img src={barber.pix_qr} alt="QR Pix" style={s.pixPreview} />
                        <div style={s.pixActions}>
                          <label style={s.pixChangeBtn}>
                            <i className="ti ti-pencil" style={{ marginRight: '4px' }}></i>Trocar
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={(e) => handlePixUpload(barber.id, e)} />
                          </label>
                          <button onClick={() => removePix(barber.id)} style={s.pixRemoveBtn}>
                            <i className="ti ti-trash" style={{ marginRight: '4px' }}></i>Remover
                          </button>
                        </div>
                      </div>
                      <PixKeyField barber={barber} onSave={(key) => savePixKey(barber.id, key, headers)} headers={headers} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={s.pixUploadArea}>
                        <i className="ti ti-upload" style={{ fontSize: '22px', color: '#52525b', marginBottom: '6px' }}></i>
                        <span style={{ fontSize: '12px', color: '#71717a' }}>Upload do QR Code Pix</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handlePixUpload(barber.id, e)} />
                      </label>
                      <PixKeyField barber={barber} onSave={(key) => savePixKey(barber.id, key, headers)} headers={headers} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
    } )
      .then(r => r.json())
      .then(d => { if (d.slug) setSlug(d.slug) })
  }, [])
 
  const link = `https://barber-frontend-tan.vercel.app/agendar/${slug}`
 
  const copy = ( ) => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
 
  const whatsapp = () => {
    const msg = encodeURIComponent(`Olá! Agende seu horário aqui: ${link}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank' )
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

function PixKeyField({ barber, onSave }) {
  const [key, setKey] = useState(barber.pix_key || '')
  const [saved, setSaved] = useState(false)

  // ✅ Sincroniza quando o barber.pix_key muda no pai
  useEffect(() => {
    setKey(barber.pix_key || '')
  }, [barber.pix_key])

  const save = async () => {
    await onSave(key)  // Passa só a chave
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
        Chave Pix (copia e cola)
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="CPF, email, telefone ou chave aleatória"
          style={{ flex: 1, background: '#27272a', border: '0.5px solid #3f3f46', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
        />
        <button 
          onClick={save} 
          style={{ 
            background: saved ? '#14532d' : '#27272a', 
            color: saved ? '#4ade80' : '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '8px 16px', 
            fontSize: '13px', 
            fontWeight: '600', 
            cursor: 'pointer' 
          }}
        >
          {saved ? '✓ Salvo' : 'Salvar'}
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
  hint: { fontSize: '13px', color: '#52525b', margin: '0 0 16px' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 4px', display: 'flex', alignItems: 'center' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '16px', marginTop: '4px' },
  saveBtn: { marginTop: '24px', width: '100%', padding: '12px', background: '#f59e0b', color: '#09090b', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#71717a', padding: '60px' },
 
  logoArea: { display: 'flex', flexDirection: 'column', gap: '12px' },
  logoPlaceholder: { border: '1.5px dashed #27272a', borderRadius: '10px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#09090b' },
  logoPreviewWrap: { display: 'flex', alignItems: 'center', gap: '16px' },
  logoPreview: { width: '80px', height: '80px', borderRadius: '10px', objectFit: 'contain', background: '#09090b', border: '0.5px solid #27272a' },
  removeBtn: { background: '#2a1414', color: '#f87171', border: '1px solid #7f1d1d', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  changeBtn: { background: '#27272a', color: '#a1a1aa', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', width: 'fit-content' },
 
  barberPixList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  barberPixCard: { background: '#09090b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '16px' },
  barberPixHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  barberPixAvatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#f59e0b', color: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  barberPixName: { fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 },
  barberPixRole: { fontSize: '11px', color: '#71717a', margin: '2px 0 0' },
  savedBadge: { marginLeft: 'auto', background: '#14532d', color: '#4ade80', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center' },
 
  pixUploadArea: { border: '1.5px dashed #27272a', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#18181b' },
  pixPreviewWrap: { display: 'flex', alignItems: 'center', gap: '16px' },
  pixPreview: { width: '80px', height: '80px', borderRadius: '8px', objectFit: 'contain', background: '#18181b', border: '0.5px solid #27272a' },
  pixActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  pixChangeBtn: { background: '#27272a', color: '#a1a1aa', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  pixRemoveBtn: { background: '#2a1414', color: '#f87171', border: '1px solid #7f1d1d', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
}