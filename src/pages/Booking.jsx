import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

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
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`${API}/booking/${slug}`)
      .then(r => r.json())
      .then(d => { setBarbershop(d.barbershop); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (step === 3 && selected.barber && selected.date && selected.service) {
      setLoadingTimes(true)
      setAvailableTimes([])
      fetch(`${API}/booking/${slug}/availability?barber_id=${selected.barber.id}&date=${selected.date}&duration=${selected.service.duration}`)
        .then(r => r.json())
        .then(d => {
          setAvailableTimes(d.available || [])
          setLoadingTimes(false)
        })
        .catch(() => setLoadingTimes(false))
    }
  }, [step, selected.barber, selected.date, selected.service])

  const confirm = async () => {
    if (!selected.client_name || !selected.client_phone) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/booking/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          service_id:   String(selected.service.id),
          barber_id:    String(selected.barber.id),
          date:         selected.date,
          time:         selected.time,
          client_name:  selected.client_name,
          client_phone: selected.client_phone,
        })
      })
      const data = await res.json()
      if (data.success) setSuccess(true)
      else alert('Erro ao agendar: ' + data.error)
    } catch(e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
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

  const formatDateValue = (d) => d.toISOString().split('T')[0]

  const STEPS = ['Serviço', 'Barbeiro', 'Data', 'Horário', 'Confirmação']

  if (loading) return (
    <div style={s.splash}>
      <div style={s.splashSpinner}></div>
    </div>
  )

  if (!barbershop) return (
    <div style={s.splash}>
      <p style={{ color: '#71717a' }}>Barbearia não encontrada.</p>
    </div>
  )

  if (success) return (
    <div style={s.page}>
      <div style={s.successWrap}>
        <div style={s.successIcon}>🎉</div>
        <h2 style={s.successTitle}>Agendado!</h2>
        <p style={s.successSub}>
          <b>{selected.service.name}</b> com <b>{selected.barber.name}</b>
        </p>
        <p style={s.successDate}>
          {new Date(selected.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selected.time}
        </p>
        <p style={s.successNote}>Aguarde a confirmação da barbearia.</p>

        {/* QR Code Pix do barbeiro selecionado */}
        {selected.barber?.pix_qr && (
          <div style={s.pixSection}>
            <div style={s.pixDivider}></div>
            <p style={s.pixTitle}>💳 Pagamento via Pix</p>
            <p style={s.pixSubtitle}>
              Escaneie o QR Code para pagar <b>{selected.barber.name}</b>
            </p>
            <div style={s.pixQrWrap}>
              <img src={selected.barber.pix_qr} alt="QR Code Pix" style={s.pixQrImg} />
            </div>
            <p style={s.pixNote}>O pagamento é opcional e pode ser feito na barbearia.</p>
          </div>
        )}

        <button onClick={() => { setSuccess(false); setStep(0); setSelected({ service: null, barber: null, date: null, time: null, client_name: '', client_phone: '' }) }} style={s.newBtn}>
          Fazer outro agendamento
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>

      {/* Hero */}
      <div style={s.hero}>
        {barbershop.logo ? (
          <img src={barbershop.logo} alt={barbershop.name} style={s.heroLogo} />
        ) : (
          <div style={s.heroAvatar}>✂️</div>
        )}
        <h1 style={s.heroName}>{barbershop.name}</h1>
        <p style={s.heroDesc}>{barbershop.description || 'Agende seu horário com os melhores.'}</p>
        {barbershop.address && (
          <p style={s.heroAddr}>
            <span style={{ marginRight: '6px' }}>📍</span>{barbershop.address}
          </p>
        )}
        <p style={s.heroHours}>
          🕐 {barbershop.opening_time} às {barbershop.closing_time}
        </p>
      </div>

      {/* Steps Bar */}
      <div style={s.stepsBar}>
        {STEPS.map((st, i) => (
          <button
            key={i}
            onClick={() => i < step ? setStep(i) : null}
            style={{
              ...s.stepBtn,
              ...(i === step ? s.stepBtnActive : {}),
              ...(i < step ? s.stepBtnDone : {}),
              cursor: i < step ? 'pointer' : 'default',
            }}
          >
            <div style={{ ...s.stepCircle, ...(i === step ? s.stepCircleActive : {}), ...(i < step ? s.stepCircleDone : {}) }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={s.stepLabel}>{st}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>

        {/* Step 0 — Serviço */}
        {step === 0 && (
          <div style={s.stepWrap}>
            <h2 style={s.stepTitle}>Escolha o Serviço</h2>
            {barbershop.services.length === 0 ? (
              <div style={s.emptyBox}>
                <p>Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <div style={s.serviceList}>
                {barbershop.services.map(sv => (
                  <button
                    key={sv.id}
                    onClick={() => { setSelected({ ...selected, service: sv }); setStep(1) }}
                    style={{ ...s.serviceCard, ...(selected.service?.id === sv.id ? s.serviceCardSelected : {}) }}
                  >
                    <div style={s.serviceInfo}>
                      <span style={s.serviceName}>{sv.name}</span>
                      <span style={s.serviceMeta}>{sv.duration} min</span>
                    </div>
                    <span style={s.servicePrice}>R$ {Number(sv.price).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Barbeiro */}
        {step === 1 && (
          <div style={s.stepWrap}>
            <h2 style={s.stepTitle}>Escolha o Barbeiro</h2>
            <div style={s.barberList}>
              {barbershop.barbers.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setSelected({ ...selected, barber: b }); setStep(2) }}
                  style={{ ...s.barberCard, ...(selected.barber?.id === b.id ? s.barberCardSelected : {}) }}
                >
                  <div style={s.barberAvatar}>{b.name[0].toUpperCase()}</div>
                  <div>
                    <p style={s.barberName}>{b.name}</p>
                    <p style={s.barberRole}>Barbeiro</p>
                  </div>
                  {b.pix_qr && (
                    <span style={s.pixBadge}>Pix ✓</span>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

        {/* Step 2 — Data */}
        {step === 2 && (
          <div style={s.stepWrap}>
            <h2 style={s.stepTitle}>Escolha a Data</h2>
            <div style={s.dateScroll}>
              {getDates().map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelected({ ...selected, date: formatDateValue(d), time: null }); setStep(3) }}
                  style={{ ...s.dateCard, ...(selected.date === formatDateValue(d) ? s.dateCardSelected : {}) }}
                >
                  <span style={s.dateWeek}>{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                  <span style={s.dateNum}>{d.getDate()}</span>
                  <span style={s.dateMon}>{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

        {/* Step 3 — Horário */}
        {step === 3 && (
          <div style={s.stepWrap}>
            <h2 style={s.stepTitle}>Escolha o Horário</h2>
            {loadingTimes ? (
              <div style={s.emptyBox}>Buscando horários...</div>
            ) : availableTimes.length === 0 ? (
              <div style={s.emptyBox}>Nenhum horário disponível para este dia.</div>
            ) : (
              <div style={s.timeGrid}>
                {availableTimes.map(t => (
                  <button
                    key={t}
                    onClick={() => { setSelected({ ...selected, time: t }); setStep(4) }}
                    style={{ ...s.timeBtn, ...(selected.time === t ? s.timeBtnSelected : {}) }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setStep(2)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

        {/* Step 4 — Confirmação */}
        {step === 4 && (
          <div style={s.stepWrap}>
            <h2 style={s.stepTitle}>Confirme seu Agendamento</h2>

            <div style={s.confirmCard}>
              <div style={s.confirmRow}>
                <span style={s.confirmLabel}>Serviço</span>
                <span style={s.confirmVal}>{selected.service?.name}</span>
              </div>
              <div style={s.confirmRow}>
                <span style={s.confirmLabel}>Barbeiro</span>
                <span style={s.confirmVal}>{selected.barber?.name}</span>
              </div>
              <div style={s.confirmRow}>
                <span style={s.confirmLabel}>Data</span>
                <span style={s.confirmVal}>
                  {selected.date && new Date(selected.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>
              <div style={s.confirmRow}>
                <span style={s.confirmLabel}>Horário</span>
                <span style={s.confirmVal}>{selected.time}</span>
              </div>
              <div style={{ ...s.confirmRow, borderBottom: 'none' }}>
                <span style={s.confirmLabel}>Valor</span>
                <span style={{ ...s.confirmVal, color: '#f59e0b', fontWeight: '700' }}>
                  R$ {Number(selected.service?.price).toFixed(2)}
                </span>
              </div>
            </div>

            <input
              style={s.input}
              placeholder="Seu nome completo"
              value={selected.client_name}
              onChange={e => setSelected({ ...selected, client_name: e.target.value })}
            />
            <input
              style={s.input}
              placeholder="WhatsApp (ex: 11999999999)"
              value={selected.client_phone}
              onChange={e => setSelected({ ...selected, client_phone: e.target.value })}
              type="tel"
            />

            <button
              onClick={confirm}
              disabled={submitting || !selected.client_name || !selected.client_phone}
              style={{ ...s.confirmBtn, opacity: (!selected.client_name || !selected.client_phone) ? 0.5 : 1 }}
            >
              {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
            </button>
            <button onClick={() => setStep(3)} style={s.backBtn}>← Voltar</button>
          </div>
        )}

      </div>

      {/* Equipe */}
      <div style={s.teamSection}>
        <h2 style={s.teamTitle}>Nossa Equipe</h2>
        <div style={s.teamList}>
          {barbershop.barbers.map(b => (
            <div key={b.id} style={s.teamCard}>
              <div style={s.teamAvatar}>{b.name[0].toUpperCase()}</div>
              <p style={s.teamName}>{b.name}</p>
              <p style={s.teamRole}>Barbeiro</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#09090b', fontFamily: 'system-ui, sans-serif' },
  splash: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  splashSpinner: { width: '36px', height: '36px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' },

  hero: { background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)', padding: '48px 20px 32px', textAlign: 'center', borderBottom: '0.5px solid #27272a' },
  heroAvatar: { fontSize: '52px', marginBottom: '12px' },
  heroLogo: { width: '80px', height: '80px', borderRadius: '16px', objectFit: 'contain', marginBottom: '12px', background: '#27272a', padding: '4px' },
  heroName: { fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 8px' },
  heroDesc: { fontSize: '15px', color: '#a1a1aa', margin: '0 0 10px' },
  heroAddr: { fontSize: '13px', color: '#71717a', margin: '0 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroHours: { fontSize: '13px', color: '#71717a', margin: 0 },

  stepsBar: { display: 'flex', overflowX: 'auto', padding: '16px 12px', gap: '4px', borderBottom: '0.5px solid #27272a', background: '#18181b', scrollbarWidth: 'none' },
  stepBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '20px', border: 'none', background: 'transparent', color: '#52525b', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'default' },
  stepBtnActive: { background: '#f59e0b22', color: '#f59e0b' },
  stepBtnDone: { color: '#4ade80' },
  stepCircle: { width: '22px', height: '22px', borderRadius: '50%', background: '#27272a', color: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 },
  stepCircleActive: { background: '#f59e0b', color: '#09090b' },
  stepCircleDone: { background: '#14532d', color: '#4ade80' },
  stepLabel: { fontSize: '12px', fontWeight: '500' },

  content: { maxWidth: '480px', margin: '0 auto', padding: '24px 16px' },
  stepWrap: { display: 'flex', flexDirection: 'column', gap: '12px' },
  stepTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },

  serviceList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  serviceCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', cursor: 'pointer', width: '100%', textAlign: 'left' },
  serviceCardSelected: { borderColor: '#f59e0b', background: '#f59e0b11' },
  serviceInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  serviceName: { fontSize: '15px', fontWeight: '600', color: '#fff' },
  serviceMeta: { fontSize: '12px', color: '#71717a' },
  servicePrice: { fontSize: '16px', fontWeight: '700', color: '#f59e0b' },

  barberList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  barberCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', cursor: 'pointer', width: '100%', textAlign: 'left' },
  barberCardSelected: { borderColor: '#f59e0b', background: '#f59e0b11' },
  barberAvatar: { width: '44px', height: '44px', borderRadius: '50%', background: '#f59e0b', color: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  barberName: { fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 },
  barberRole: { fontSize: '12px', color: '#71717a', margin: '2px 0 0' },
  pixBadge: { marginLeft: 'auto', fontSize: '11px', color: '#4ade80', background: '#14532d', padding: '3px 8px', borderRadius: '20px' },

  dateScroll: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' },
  dateCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 14px', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', cursor: 'pointer', minWidth: '64px', flexShrink: 0 },
  dateCardSelected: { borderColor: '#f59e0b', background: '#f59e0b11' },
  dateWeek: { fontSize: '11px', color: '#71717a', textTransform: 'uppercase', marginBottom: '4px' },
  dateNum: { fontSize: '24px', fontWeight: '700', color: '#fff' },
  dateMon: { fontSize: '11px', color: '#71717a', marginTop: '2px' },

  timeGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  timeBtn: { padding: '12px 16px', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', minWidth: '72px', textAlign: 'center' },
  timeBtnSelected: { borderColor: '#f59e0b', background: '#f59e0b11', color: '#f59e0b' },

  confirmCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
  confirmRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '0.5px solid #27272a' },
  confirmLabel: { fontSize: '13px', color: '#71717a' },
  confirmVal: { fontSize: '14px', color: '#fff', fontWeight: '500', textAlign: 'right', maxWidth: '60%' },

  input: { width: '100%', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '15px', boxSizing: 'border-box', marginBottom: '10px', display: 'block' },
  confirmBtn: { width: '100%', background: '#f59e0b', color: '#09090b', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  backBtn: { background: 'none', border: 'none', color: '#71717a', fontSize: '14px', cursor: 'pointer', padding: '8px 0' },

  emptyBox: { textAlign: 'center', color: '#71717a', padding: '40px 20px', background: '#18181b', borderRadius: '12px', fontSize: '14px' },

  teamSection: { maxWidth: '480px', margin: '0 auto', padding: '32px 16px' },
  teamTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 16px' },
  teamList: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  teamCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '16px', textAlign: 'center', minWidth: '100px' },
  teamAvatar: { width: '44px', height: '44px', borderRadius: '50%', background: '#f59e0b', color: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', margin: '0 auto 8px' },
  teamName: { fontSize: '13px', fontWeight: '600', color: '#fff', margin: 0 },
  teamRole: { fontSize: '11px', color: '#71717a', margin: '2px 0 0' },

  successWrap: { maxWidth: '400px', margin: '60px auto', textAlign: 'center', padding: '20px' },
  successIcon: { fontSize: '64px', marginBottom: '16px' },
  successTitle: { fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 8px' },
  successSub: { fontSize: '16px', color: '#a1a1aa', margin: '0 0 8px' },
  successDate: { fontSize: '15px', color: '#f59e0b', fontWeight: '600', margin: '0 0 16px' },
  successNote: { fontSize: '13px', color: '#71717a', margin: '0 0 8px' },
  newBtn: { background: '#f59e0b', color: '#09090b', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '20px' },

  pixSection: { marginTop: '8px', marginBottom: '8px' },
  pixDivider: { height: '1px', background: '#27272a', margin: '20px 0' },
  pixTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 6px' },
  pixSubtitle: { fontSize: '13px', color: '#a1a1aa', margin: '0 0 16px' },
  pixQrWrap: { background: '#fff', borderRadius: '12px', padding: '12px', display: 'inline-block', marginBottom: '12px' },
  pixQrImg: { width: '180px', height: '180px', objectFit: 'contain', display: 'block' },
  pixNote: { fontSize: '12px', color: '#52525b', margin: 0 },
}