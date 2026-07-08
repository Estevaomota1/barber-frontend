import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

export default function Settings() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    logo: '',
    working_hours: {
      open: '07:00',
      close: '18:00',
      working_days: [],
    },
  })

  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [savedPix, setSavedPix] = useState({})
  const logoRef = useRef()

  const token = localStorage.getItem('token')
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  useEffect(() => {
    fetch(`${API}/my-barbershop`, { headers })
      .then((r) => r.json())
      .then((d) => {
        let workingHours = d.working_hours || {}
        if (workingHours.monday !== undefined) {
          const days = []
          const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          weekdays.forEach((day) => {
            if (workingHours[day]?.active) days.push(day)
          })
          workingHours = {
            open: workingHours.monday?.open || '07:00',
            close: workingHours.monday?.close || '18:00',
            working_days: days,
          }
        } else {
          workingHours = {
            open: workingHours.open || '07:00',
            close: workingHours.close || '18:00',
            working_days: workingHours.working_days || [],
          }
        }

        setForm({
          name: d.name || '',
          phone: d.phone || '',
          address: d.address || '',
          description: d.description || '',
          opening_time: d.opening_time || '07:00',
          closing_time: d.closing_time || '18:00',
          logo: d.logo || '',
          working_hours: workingHours,
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
    reader.onload = (ev) => setForm((f) => ({ ...f, logo: ev.target.result }))
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
      setBarbers((bs) => bs.map((b) => (b.id === barberId ? { ...b, pix_qr } : b)))
      try {
        await fetch(`${API}/barbers/${barberId}/pix`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ pix_qr }),
        })
        setSavedPix((s) => ({ ...s, [barberId]: true }))
        setTimeout(() => setSavedPix((s) => ({ ...s, [barberId]: false })), 3000)
      } catch (err) {
        console.error(err)
      }
    }
    reader.readAsDataURL(file)
  }

  const removePix = async (barberId) => {
    setBarbers((bs) => bs.map((b) => (b.id === barberId ? { ...b, pix_qr: '' } : b)))
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

  const savePixKey = async (barberId, pixKey) => {
    try {
      await fetch(`${API}/barbers/${barberId}/pix`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ pix_key: pixKey }),
      })
      setBarbers((bs) => bs.map((b) => (b.id === barberId ? { ...b, pix_key: pixKey } : b)))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading)
    return (
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
                <button onClick={() => setForm((f) => ({ ...f, logo: '' }))} style={s.removeBtn}>
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
        <div style={{ ...s.card, marginTop: '20px' }}>
          <h2 style={s.sectionTitle}>
            <i className="ti ti-building-store" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
            Informações da Barbearia
          </h2>

          <label style={s.label}>Nome da Barbearia</label>
          <input
            style={s.input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Barbearia do João"
          />

          <label style={s.label}>Telefone / WhatsApp</label>
          <input
            style={s.input}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Ex: (11) 99999-9999"
          />

          <label style={s.label}>Endereço</label>
          <input
            style={s.input}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Ex: Av. Principal, 123 - Bairro - Cidade/UF"
          />

          <label style={s.label}>Descrição</label>
          <textarea
            style={{ ...s.input, height: '80px', resize: 'vertical' }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Frase de apresentação da barbearia..."
          />

          <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 15 }}>Horário de Funcionamento</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <label style={{ color: '#fff', width: '100px' }}>Horário padrão</label>
            <input
              type="time"
              value={form.working_hours?.open ?? '07:00'}
              onChange={(e) =>
                setForm({
                  ...form,
                  working_hours: {
                    ...form.working_hours,
                    open: e.target.value,
                  },
                })
              }
              style={s.input}
            />
            <span style={{ color: '#aaa' }}>até</span>
            <input
              type="time"
              value={form.working_hours?.close ?? '18:00'}
              onChange={(e) =>
                setForm({
                  ...form,
                  working_hours: {
                    ...form.working_hours,
                    close: e.target.value,
                  },
                })
              }
              style={s.input}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            {[
              ['monday', 'Seg'],
              ['tuesday', 'Ter'],
              ['wednesday', 'Qua'],
              ['thursday', 'Qui'],
              ['friday', 'Sex'],
              ['saturday', 'Sáb'],
              ['sunday', 'Dom'],
            ].map(([key, label]) => (
              <label key={key} style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={form.working_hours?.working_days?.includes(key) ?? false}
                  onChange={(e) => {
                    const current = form.working_hours?.working_days ?? []
                    const updated = e.target.checked
                      ? [...current, key]
                      : current.filter((d) => d !== key)
                    setForm({
                      ...form,
                      working_hours: {
                        ...form.working_hours,
                        working_days: updated,
                      },
                    })
                  }}
                />
                {label}
              </label>
            ))}
          </div>

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
              {barbers.map((barber) => (
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
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handlePixUpload(barber.id, e)}
                            />
                          </label>
                          <button onClick={() => removePix(barber.id)} style={s.pixRemoveBtn}>
                            <i className="ti ti-trash" style={{ marginRight: '4px' }}></i>Remover
                          </button>
                        </div>
                      </div>
                      <PixKeyField barber={barber} onSave={(key) => savePixKey(barber.id, key)} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={s.pixUploadArea}>
                        <i className="ti ti-upload" style={{ fontSize: '22px', color: '#52525b', marginBottom: '6px' }}></i>
                        <span style={{ fontSize: '12px', color: '#71717a' }}>Upload do QR Code Pix</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handlePixUpload(barber.id, e)}
                        />
                      </label>
                      <PixKeyField barber={barber} onSave={(key) => savePixKey(barber.id, key)} />
                    </div>
                  )}

                  <BarberBlocksSection barber={barber} headers={headers} API={API} />
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
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.slug) setSlug(d.slug)
      })
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
      <div
        style={{
          background: '#09090b',
          border: '0.5px solid #27272a',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: '#a1a1aa',
          marginBottom: '12px',
          wordBreak: 'break-all',
        }}
      >
        {link}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={copy}
          style={{
            flex: 1,
            padding: '10px',
            background: copied ? '#14532d' : '#27272a',
            border: 'none',
            borderRadius: '8px',
            color: copied ? '#4ade80' : '#fff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`}></i>
          {copied ? 'Copiado!' : 'Copiar Link'}
        </button>
        <button
          onClick={whatsapp}
          style={{
            flex: 1,
            padding: '10px',
            background: '#14532d',
            border: 'none',
            borderRadius: '8px',
            color: '#4ade80',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
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

  useEffect(() => {
    setKey(barber.pix_key || '')
  }, [barber.pix_key])

  const save = async () => {
    await onSave(key)
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
          onChange={(e) => setKey(e.target.value)}
          placeholder="CPF, email, telefone ou chave aleatória"
          style={{
            flex: 1,
            background: '#27272a',
            border: '0.5px solid #3f3f46',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
          }}
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
            cursor: 'pointer',
          }}
        >
          {saved ? '✓ Salvo' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

function BarberBlocksSection({ barber, headers, API }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('once')
  const [date, setDate] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('monday')
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const dayLabels = {
    monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
    thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
  }
  const dayShort = {
    monday: 'SEG', tuesday: 'TER', wednesday: 'QUA',
    thursday: 'QUI', friday: 'SEX', saturday: 'SÁB', sunday: 'DOM',
  }

  const getNext14Days = () => {
    const days = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      days.push(d)
    }
    return days
  }
  const formatDateValue = (d) =>
    d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

  const buildSlots = () => {
    const slots = []
    let h = 6, m = 0
    while (h < 22) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      m += 30
      if (m === 60) { m = 0; h++ }
    }
    return slots
  }
  const allSlots = buildSlots()
  const periods = [
    { label: 'Manhã', slots: allSlots.filter(t => t < '12:00') },
    { label: 'Tarde', slots: allSlots.filter(t => t >= '12:00' && t < '18:00') },
    { label: 'Noite', slots: allSlots.filter(t => t >= '18:00') },
  ]

  const loadBlocks = () => {
    setLoading(true)
    fetch(`${API}/barbers/${barber.id}/blocks`, { headers })
      .then(r => r.json())
      .then(d => setBlocks(d.blocks || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBlocks() }, [barber.id])

  const handleSlotClick = (slot) => {
    if (!startTime || (startTime && endTime)) {
      setStartTime(slot)
      setEndTime(null)
    } else if (slot > startTime) {
      setEndTime(slot)
    } else {
      setStartTime(slot)
      setEndTime(null)
    }
  }

  const isInRange = (slot) => startTime && endTime && slot > startTime && slot < endTime

  const addBlock = async () => {
    if (type === 'once' && !date) return alert('Escolha uma data.')
    if (!startTime || !endTime) return alert('Selecione o horário de início e fim clicando nos chips.')
    setSaving(true)
    try {
      const res = await fetch(`${API}/barbers/${barber.id}/blocks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          date: type === 'once' ? date : undefined,
          day_of_week: type === 'recurring' ? dayOfWeek : undefined,
          start_time: startTime,
          end_time: endTime,
          reason,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setReason('')
        setStartTime(null)
        setEndTime(null)
        loadBlocks()
      } else {
        alert('Erro ao salvar bloqueio.')
      }
    } finally {
      setSaving(false)
    }
  }

  const removeBlock = async (blockId) => {
    if (!confirm('Remover este bloqueio?')) return
    await fetch(`${API}/barbers/${barber.id}/blocks/${blockId}`, { method: 'DELETE', headers })
    loadBlocks()
  }

  return (
    <div style={s.blockCard}>
      <p style={s.blockTitle}>Bloqueios de horário — {barber.name}</p>

      <div style={s.blockTypeTabs}>
        <button
          onClick={() => setType('once')}
          style={{ ...s.blockTypeTab, ...(type === 'once' ? s.blockTypeTabActive : {}) }}
        >
          Data específica
        </button>
        <button
          onClick={() => setType('recurring')}
          style={{ ...s.blockTypeTab, ...(type === 'recurring' ? s.blockTypeTabActive : {}) }}
        >
          Toda semana
        </button>
      </div>

      {type === 'once' ? (
        <div style={s.blockDateTabsWrap}>
          {getNext14Days().map((d, i) => {
            const value = formatDateValue(d)
            return (
              <button
                key={i}
                onClick={() => setDate(value)}
                style={{ ...s.blockDateTab, ...(date === value ? s.blockDateTabActive : {}) }}
              >
                <span>{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()}</span>
                <span>{String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div style={s.blockDateTabsWrap}>
          {Object.entries(dayLabels).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setDayOfWeek(k)}
              style={{ ...s.blockDateTab, ...(dayOfWeek === k ? s.blockDateTabActive : {}) }}
            >
              <span>{v}</span>
            </button>
          ))}
        </div>
      )}

      {periods.map(period => (
        <div key={period.label}>
          <p style={s.blockSectionLabel}>{period.label}</p>
          <div style={s.blockChipGrid}>
            {period.slots.map(slot => {
              const isStart = slot === startTime
              const isEnd = slot === endTime
              const inRange = isInRange(slot)
              return (
                <button
                  key={slot}
                  onClick={() => handleSlotClick(slot)}
                  style={{
                    ...s.blockChip,
                    ...(isStart ? s.blockChipStart : {}),
                    ...(isEnd ? s.blockChipEnd : {}),
                    ...(inRange ? s.blockChipInRange : {}),
                  }}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {startTime && (
        <div style={s.blockRangePreview}>
          🔒 Bloqueando de {startTime} {endTime ? `até ${endTime}` : '— clique no horário final'}
        </div>
      )}

      <input
        placeholder="Motivo (ex: almoço, folga)"
        value={reason}
        onChange={e => setReason(e.target.value)}
        style={{ ...s.blockReasonInput, marginTop: '14px' }}
      />

      <button onClick={addBlock} disabled={saving} style={s.blockAddBtn}>
        {saving ? 'Salvando...' : '+ Adicionar bloqueio'}
      </button>

      <div style={{ marginTop: '18px' }}>
        {loading ? (
          <p style={{ color: '#71717a', fontSize: '13px' }}>Carregando...</p>
        ) : blocks.length === 0 ? (
          <p style={{ color: '#71717a', fontSize: '13px' }}>Nenhum bloqueio cadastrado.</p>
        ) : blocks.map(b => (
          <div key={b.id} style={s.blockListItem}>
            <span style={s.blockListText}>
              {b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR') : dayLabels[b.day_of_week] + ' (toda semana)'}
              {' • '}{b.start_time?.substring(0, 5)}–{b.end_time?.substring(0, 5)}
              {b.reason ? ` • ${b.reason}` : ''}
            </span>
            <button onClick={() => removeBlock(b.id)} style={s.blockRemoveBtn}>
              Remover
            </button>
          </div>
        ))}
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
  input: {
    width: '100%',
    background: '#09090b',
    border: '0.5px solid #27272a',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: '16px', marginTop: '4px' },
  saveBtn: {
    marginTop: '24px',
    width: '100%',
    padding: '12px',
    background: '#f59e0b',
    color: '#09090b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { textAlign: 'center', color: '#71717a', padding: '60px' },

  logoArea: { display: 'flex', flexDirection: 'column', gap: '12px' },
  logoPlaceholder: {
    border: '1.5px dashed #27272a',
    borderRadius: '10px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: '#09090b',
  },
  logoPreviewWrap: { display: 'flex', alignItems: 'center', gap: '16px' },
  logoPreview: {
    width: '80px',
    height: '80px',
    borderRadius: '10px',
    objectFit: 'contain',
    background: '#09090b',
    border: '0.5px solid #27272a',
  },
  removeBtn: {
    background: '#2a1414',
    color: '#f87171',
    border: '1px solid #7f1d1d',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  changeBtn: {
    background: '#27272a',
    color: '#a1a1aa',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
  },

  barberPixList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  barberPixCard: { background: '#09090b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '16px' },
  barberPixHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  barberPixAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#f59e0b',
    color: '#09090b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  barberPixName: { fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 },
  barberPixRole: { fontSize: '11px', color: '#71717a', margin: '2px 0 0' },
  savedBadge: {
    marginLeft: 'auto',
    background: '#14532d',
    color: '#4ade80',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
  },

  pixUploadArea: {
    border: '1.5px dashed #27272a',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: '#18181b',
  },
  pixPreviewWrap: { display: 'flex', alignItems: 'center', gap: '16px' },
  pixPreview: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'contain',
    background: '#18181b',
    border: '0.5px solid #27272a',
  },
  pixActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  pixChangeBtn: {
    background: '#27272a',
    color: '#a1a1aa',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  pixRemoveBtn: {
    background: '#2a1414',
    color: '#f87171',
    border: '1px solid #7f1d1d',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  // Estilos originais de bloqueio (mantidos para compatibilidade com a lista)
  blockCard: {
    background: '#09090b',
    border: '0.5px solid #27272a',
    borderRadius: '10px',
    padding: '16px',
    marginTop: '12px',
  },
  blockTitle: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    marginBottom: '12px',
  },
  blockRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '10px',
  },
  blockSelect: {
    background: '#18181b',
    color: '#fff',
    border: '0.5px solid #27272a',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '13px',
    flex: '1 1 120px',
    minWidth: '110px',
  },
  blockInput: {
    background: '#18181b',
    color: '#fff',
    border: '0.5px solid #27272a',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '13px',
    flex: '1 1 110px',
    minWidth: '100px',
    boxSizing: 'border-box',
  },
  blockReasonInput: {
    width: '100%',
    background: '#18181b',
    color: '#fff',
    border: '0.5px solid #27272a',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  blockAddBtn: {
    background: '#f59e0b',
    color: '#09090b',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  blockListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    borderTop: '0.5px solid #27272a',
    flexWrap: 'wrap',
  },
  blockListText: {
    color: '#a1a1aa',
    fontSize: '13px',
  },
  blockRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },

  // Novos estilos para o seletor de chips (bloqueios)
  blockTypeTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
  },
  blockTypeTab: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #27272a',
    background: '#18181b',
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
  },
  blockTypeTabActive: {
    borderColor: '#f59e0b',
    background: 'rgba(245,158,11,0.1)',
    color: '#f59e0b',
  },
  blockDateTabsWrap: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '8px',
    marginBottom: '14px',
    scrollbarWidth: 'none',
  },
  blockDateTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #27272a',
    background: '#18181b',
    color: '#71717a',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '56px',
    flexShrink: 0,
  },
  blockDateTabActive: {
    borderColor: '#f59e0b',
    background: 'rgba(245,158,11,0.1)',
    color: '#f59e0b',
  },
  blockSectionLabel: {
    fontSize: '12px',
    color: '#71717a',
    fontWeight: '600',
    margin: '14px 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  blockChipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: '8px',
  },
  blockChip: {
    padding: '10px 8px',
    borderRadius: '10px',
    border: '1px solid #27272a',
    background: '#18181b',
    color: '#e4e4e7',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
  },
  blockChipStart: {
    borderColor: '#f59e0b',
    background: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    fontWeight: '700',
  },
  blockChipEnd: {
    borderColor: '#f59e0b',
    background: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    fontWeight: '700',
  },
  blockChipInRange: {
    borderColor: 'rgba(245,158,11,0.4)',
    background: 'rgba(245,158,11,0.06)',
    color: '#fbbf24',
  },
  blockRangePreview: {
    marginTop: '12px',
    padding: '10px 14px',
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#fbbf24',
    fontWeight: '600',
  },
}