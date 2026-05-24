import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

const STEPS = ['Serviço', 'Barbeiro', 'Data', 'Horário', 'Confirmação']

export default function Booking() {
  const { slug } = useParams()
  const [barbershop, setBarbershop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState({
    service: null, barber: null, date: null, time: null,
    client_name: '', client_phone: ''
  })
  const [availableTimes, setAvailableTimes] = useState([])
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`${API}/booking/${slug}`)
      .then(r => r.json())
      .then(d => { setBarbershop(d.barbershop); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (selected.barber && selected.date && selected.service) {
      fetch(`${API}/booking/${slug}/availability?barber_id=${selected.barber.id}&date=${selected.date}&duration=${selected.service.duration}`)
        .then(r => r.json())
        .then(d => setAvailableTimes(d.available || []))
    }
  }, [selected.barber, selected.date, selected.service])

  const confirm = async () => {
    const res = await fetch(`${API}/booking/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        service_id:   selected.service.id,
        barber_id:    selected.barber.id,
        date:         selected.date,
        time:         selected.time,
        client_name:  selected.client_name,
        client_phone: selected.client_phone,
      })
    })
    const data = await res.json()
    if (data.success) setSuccess(true)
  }

  const getDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      if (d.getDay() !== 0) dates.push(d)
    }
    return dates
  }

  const formatDate = (d) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const formatDateValue = (d) => d.toISOString().split('T')[0]

  if (loading) return <div style={s.loading}>Carregando...</div>
  if (!barbershop) return <div style={s.loading}>Barbearia não encontrada.</div>

  if (success) return (
    <div style={s.page}>
      <div style={s.successBox}>
        <div style={s.successIcon}>✅</div>
        <h2 style={s.successTitle}>Agendamento Confirmado!</h2>
        <p style={s.successText}>
          {selected.service.name} com {selected.barber.name}<br />
          {new Date(selected.date).toLocaleDateString('pt-BR')} às {selected.time}
        </p>
        <p style={s.successSub}>Aguarde a confirmação da barbearia.</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroLogo}>✂️</div>
        <h1 style={s.heroTitle}>{barbershop.name}</h1>
        <p style={s.heroSub}>{barbershop.description || 'Agende seu horário com os melhores.'}</p>
        <button onClick={() => setStep(0)} style={s.heroBtn}>Agendar Agora</button>
      </div>

      {/* Serviços */}
      {barbershop.services.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Nossos Serviços</h2>
          <div style={s.serviceGrid}>
            {barbershop.services.map(sv => (
              <div key={sv.id} style={s.serviceCard}>
                <p style={s.serviceName}>{sv.name}</p>
                <p style={s.servicePrice}>R$ {Number(sv.price).toFixed(2)}</p>
                <p style={s.serviceDuration}>{sv.duration} min</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipe */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Nossa Equipe</h2>
        <div style={s.barberGrid}>
          {barbershop.barbers.map(b => (
            <div key={b.id} style={s.barberCard}>
              <div style={s.barberAvatar}>{b.name[0].toUpperCase()}</div>
              <p style={s.barberName}>{b.name}</p>
              <p style={s.barberRole}>Barbeiro</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agendamento */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Agendar</h2>

        {/* Steps */}
        <div style={s.steps}>
          {STEPS.map((st, i) => (
            <div key={i} style={{ ...s.stepItem, ...(i === step ? s.stepActive : i < step ? s.stepDone : {}) }}>
              <div style={s.stepNum}>{i < step ? '✓' : i + 1}</div>
              <span style={s.stepLabel}>{st}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Serviço */}
        {step === 0 && (
          <div style={s.stepContent}>
            <h3 style={s.stepTitle}>1. Escolha o Serviço</h3>
            {barbershop.services.length === 0 ? (
              <p style={s.empty}>Nenhum serviço cadastrado ainda.</p>
            ) : (
              <div style={s.optionList}>
                {barbershop.services.map(sv => (
                  <div
                    key={sv.id}
                    onClick={() => { setSelected({ ...selected, service: sv }); setStep(1) }}
                    style={{ ...s.optionCard, ...(selected.service?.id === sv.id ? s.optionSelected : {}) }}
                  >
                    <span style={s.optionName}>{sv.name}</span>
                    <span style={s.optionInfo}>{sv.duration} min | R$ {Number(sv.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Barbeiro */}
        {step === 1 && (
          <div style={s.stepContent}>
            <h3 style={s.stepTitle}>2. Escolha o Barbeiro</h3>
            <div style={s.optionList}>
              {barbershop.barbers.map(b => (
                <div
                  key={b.id}
                  onClick={() => { setSelected({ ...selected, barber: b }); setStep(2) }}
                  style={{ ...s.optionCard, ...(selected.barber?.id === b.id ? s.optionSelected : {}) }}
                >
                  <div style={s.barberAvatar}>{b.name[0].toUpperCase()}</div>
                  <span style={s.optionName}>{b.name}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(0)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

        {/* Step 2 — Data */}
        {step === 2 && (
          <div style={s.stepContent}>
            <h3 style={s.stepTitle}>3. Escolha a Data</h3>
            <div style={s.dateGrid}>
              {getDates().map((d, i) => (
                <div
                  key={i}
                  onClick={() => { setSelected({ ...selected, date: formatDateValue(d), time: null }); setStep(3) }}
                  style={{ ...s.dateCard, ...(selected.date === formatDateValue(d) ? s.optionSelected : {}) }}
                >
                  <span style={s.dateDay}>{formatDate(d).split(',')[0]}</span>
                  <span style={s.dateNum}>{d.getDate()}</span>
                  <span style={s.dateMon}>{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

        {/* Step 3 — Horário */}
        {step === 3 && (
          <div style={s.stepContent}>
            <h3 style={s.stepTitle}>4. Escolha o Horário</h3>
            {availableTimes.length === 0 ? (
              <p style={s.empty}>Nenhum horário disponível para este dia.</p>
            ) : (
              <div style={s.timeGrid}>
                {availableTimes.map(t => (
                  <div
                    key={t}
                    onClick={() => { setSelected({ ...selected, time: t }); setStep(4) }}
                    style={{ ...s.timeCard, ...(selected.time === t ? s.optionSelected : {}) }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setStep(2)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

        {/* Step 4 — Confirmação */}
        {step === 4 && (
          <div style={s.stepContent}>
            <h3 style={s.stepTitle}>5. Confirme seu Agendamento</h3>
            <div style={s.confirmCard}>
              <p style={s.confirmItem}><b>Serviço:</b> {selected.service?.name}</p>
              <p style={s.confirmItem}><b>Barbeiro:</b> {selected.barber?.name}</p>
              <p style={s.confirmItem}><b>Data:</b> {selected.date && new Date(selected.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              <p style={s.confirmItem}><b>Horário:</b> {selected.time}</p>
              <p style={s.confirmItem}><b>Valor:</b> R$ {Number(selected.service?.price).toFixed(2)}</p>
            </div>
            <input
              style={s.input}
              placeholder="Seu Nome"
              value={selected.client_name}
              onChange={e => setSelected({ ...selected, client_name: e.target.value })}
            />
            <input
              style={s.input}
              placeholder="Seu Telefone (WhatsApp)"
              value={selected.client_phone}
              onChange={e => setSelected({ ...selected, client_phone: e.target.value })}
            />
            <button onClick={confirm} style={s.confirmBtn}>Confirmar Agendamento</button>
            <button onClick={() => setStep(3)} style={s.backBtn}>← Voltar</button>
          </div>
        )}
      </div>

      {/* Contato */}
      {(barbershop.phone || barbershop.address) && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Entre em Contato</h2>
          {barbershop.phone && <p style={s.contactItem}>📞 {barbershop.phone}</p>}
          {barbershop.address && <p style={s.contactItem}>📍 {barbershop.address}</p>}
          <p style={s.contactItem}>🕐 {barbershop.opening_time} às {barbershop.closing_time}</p>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'system-ui, sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#71717a', background: '#09090b' },
  hero: { background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', padding: '80px 20px', textAlign: 'center', borderBottom: '0.5px solid #27272a' },
  heroLogo: { fontSize: '48px', marginBottom: '16px' },
  heroTitle: { fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 12px' },
  heroSub: { fontSize: '16px', color: '#a1a1aa', margin: '0 0 28px' },
  heroBtn: { background: '#f59e0b', color: '#09090b', border: 'none', padding: '14px 32px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  section: { maxWidth: '800px', margin: '0 auto', padding: '48px 20px' },
  sectionTitle: { fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 24px', borderBottom: '0.5px solid #27272a', paddingBottom: '12px' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' },
  serviceCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  serviceName: { fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 8px' },
  servicePrice: { fontSize: '18px', fontWeight: '700', color: '#f59e0b', margin: '0 0 4px' },
  serviceDuration: { fontSize: '12px', color: '#71717a', margin: 0 },
  barberGrid: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  barberCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '20px', textAlign: 'center', minWidth: '120px' },
  barberAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: '#f59e0b', color: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', margin: '0 auto 10px' },
  barberName: { fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 4px' },
  barberRole: { fontSize: '12px', color: '#71717a', margin: 0 },
  steps: { display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '8px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', background: '#18181b', border: '0.5px solid #27272a', whiteSpace: 'nowrap' },
  stepActive: { background: '#f59e0b22', border: '0.5px solid #f59e0b' },
  stepDone: { background: '#14532d22', border: '0.5px solid #4ade80' },
  stepNum: { width: '20px', height: '20px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff' },
  stepLabel: { fontSize: '13px', color: '#a1a1aa' },
  stepContent: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '24px' },
  stepTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 20px' },
  optionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' },
  optionSelected: { borderColor: '#f59e0b', background: '#f59e0b11' },
  optionName: { fontSize: '15px', fontWeight: '600', color: '#fff' },
  optionInfo: { fontSize: '13px', color: '#71717a' },
  dateGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  dateCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '10px', cursor: 'pointer', minWidth: '70px' },
  dateDay: { fontSize: '11px', color: '#71717a', textTransform: 'uppercase' },
  dateNum: { fontSize: '22px', fontWeight: '700', color: '#fff' },
  dateMon: { fontSize: '11px', color: '#71717a' },
  timeGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  timeCard: { padding: '10px 18px', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff', fontWeight: '500' },
  confirmCard: { background: '#09090b', borderRadius: '10px', padding: '16px', marginBottom: '20px' },
  confirmItem: { fontSize: '14px', color: '#e4e4e7', margin: '8px 0' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', display: 'block' },
  confirmBtn: { width: '100%', background: '#f59e0b', color: '#09090b', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  backBtn: { background: 'none', border: 'none', color: '#71717a', fontSize: '13px', cursor: 'pointer', marginTop: '8px' },
  contactItem: { fontSize: '14px', color: '#a1a1aa', margin: '8px 0' },
  empty: { color: '#71717a', fontSize: '14px' },
  successBox: { maxWidth: '400px', margin: '100px auto', textAlign: 'center', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '40px' },
  successIcon: { fontSize: '48px', marginBottom: '16px' },
  successTitle: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 12px' },
  successText: { fontSize: '15px', color: '#a1a1aa', margin: '0 0 8px', lineHeight: '1.6' },
  successSub: { fontSize: '13px', color: '#71717a', margin: 0 },
}