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
  const [cancelToken, setCancelToken] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)

  // === NOVOS ESTADOS PARA MEUS AGENDAMENTOS ===
  const [showMyAppointments, setShowMyAppointments] = useState(false)
  const [myAppointments, setMyAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [appointmentPhone, setAppointmentPhone] = useState('')
  const [appointmentName, setAppointmentName] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  function formatAppointmentDate(dateStr) {
    if (!dateStr) return "-";

    const formatted = dateStr
      .replace("T", " ")
      .replace("Z", "")
      .split(".")[0];

    const [datePart, timePart] = formatted.split(" ");

    return (
      new Date(datePart + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }) +
      " às " +
      timePart.substring(0, 5)
    );
  }

  const VALID_DDDS = [
    11,12,13,14,15,16,17,18,19, // SP
    21,22,24, // RJ
    27,28, // ES
    31,32,33,34,35,37,38, // MG
    41,42,43,44,45,46, // PR
    47,48,49, // SC
    51,53,54,55, // RS
    61, // DF
    62,64, // GO
    63, // TO
    65,66, // MT
    67, // MS
    68, // AC
    69, // RO
    71,73,74,75,77, // BA
    79, // SE
    81,87, // PE
    82, // AL
    83, // PB
    84, // RN
    85,88, // CE
    86,89, // PI
    91,93,94, // PA
    92,97, // AM
    95, // RR
    96, // AP
    98,99, // MA
  ]

  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '')

    if (digits.length !== 10 && digits.length !== 11) return false

    const ddd = parseInt(digits.substring(0, 2), 10)
    if (!VALID_DDDS.includes(ddd)) return false

    // Celular (11 dígitos) precisa começar com 9 logo após o DDD
    if (digits.length === 11 && digits[2] !== '9') return false

    // Bloqueia sequências óbvias tipo 11111111111, 99999999999, etc
    const restNumber = digits.substring(2)
    if (/^(\d)\1+$/.test(restNumber)) return false

    return true
  }

  // ========== FUNÇÃO NOVA: onlyDigits ==========
  function onlyDigits(value, maxLength = 11) {
    return value.replace(/\D/g, '').slice(0, maxLength)
  }

  // Buscar dados da barbearia
  useEffect(() => {
    fetch(`${API}/booking/${slug}`)
      .then(r => r.json())
      .then(d => {
        setBarbershop(d.barbershop)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  // Buscar horários disponíveis (step 3)
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

  // Confirmar agendamento
  const confirm = async () => {
    if (!selected.client_name || !isValidPhone(selected.client_phone)) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
      if (data.success) {
        setCancelToken(data.cancel_token)
        setSuccess(true)
      } else {
        alert('Este horário já está ocupado. Escolha outro horário ' + (data.error || data.message || 'Tente novamente.'))
      }
    } catch(e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  // Cancelar o agendamento recém-criado (token)
  const cancelAppointment = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`${API}/cancel/${cancelToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      })
      const data = await res.json()
      if (data.success) {
        setCancelDone(true)
        setCancelConfirm(false)
      }
    } catch(e) {
      console.error(e)
    } finally {
      setCancelling(false)
    }
  }

  // === FUNÇÕES PARA MEUS AGENDAMENTOS ===

  // Buscar agendamentos do cliente
  const fetchMyAppointments = async () => {
    if (!appointmentName || !isValidPhone(appointmentPhone)) {
      alert('Preencha nome e telefone válido para buscar.')
      return
    }
    setLoadingAppointments(true)
    try {
      const res = await fetch(`${API}/booking/${slug}/my-appointments?client_name=${encodeURIComponent(appointmentName)}&client_phone=${encodeURIComponent(appointmentPhone)}`)
      const data = await res.json()
      if (data.success) {
        setMyAppointments(data.appointments)
      } else {
        setMyAppointments([])
      }
    } catch (e) {
      console.error(e)
      setMyAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

  // Cancelar um agendamento da lista (por token)
  const cancelMyAppointment = async (token) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento? O horário será liberado.')) return
    setCancellingId(token)
    try {
      const res = await fetch(`${API}/cancel/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      })
      const data = await res.json()
      if (data.success) {
        setMyAppointments(prev => prev.filter(a => a.cancel_token !== token))
        alert('Agendamento cancelado com sucesso!')
      } else {
        alert('Erro ao cancelar: ' + (data.error || 'tente novamente'))
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao cancelar agendamento.')
    } finally {
      setCancellingId(null)
    }
  }

  // Datas disponíveis (30 dias)
  const getDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i <= 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const formatDateValue = (d) => {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0')
  }

  const STEPS = ['Serviço', 'Barbeiro', 'Data', 'Horário', 'Confirmação']

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  if (loading) return (
    <div style={s.splash}><div style={s.splashSpinner}></div></div>
  )

  if (!barbershop) return (
    <div style={s.splash}><p style={{ color: '#71717a' }}>Barbearia não encontrada.</p></div>
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

        {(selected.barber?.pix_qr || selected.barber?.pix_key) && (
          <div style={s.pixSection}>
            <div style={s.pixDivider}></div>
            <p style={s.pixTitle}>💳 Pagamento via Pix</p>
            <p style={s.pixSubtitle}>Pague <b>{selected.barber.name}</b> via Pix</p>
            {selected.barber?.pix_qr && (
              <div style={s.pixQrWrap}>
                <img src={selected.barber.pix_qr} alt="QR Code Pix" style={s.pixQrImg} />
              </div>
            )}
            {selected.barber?.pix_key && (
              <PixCopyBox pixKey={selected.barber.pix_key} />
            )}
            <p style={s.pixNote}>O pagamento é opcional e pode ser feito na barbearia.</p>
          </div>
        )}

        <button
          onClick={() => {
            setSuccess(false); setStep(0); setCancelToken(null)
            setCancelConfirm(false); setCancelDone(false)
            setSelected({ service: null, barber: null, date: null, time: null, client_name: '', client_phone: '' })
          }}
          style={s.newBtn}
        >
          Fazer outro agendamento
        </button>
         
        {/* Cancelamento do agendamento recém-criado */}
        {cancelToken && !cancelDone && (
          <div style={{ marginTop: '20px' }}>
            {!cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Cancelar agendamento
              </button>
            ) : (
              <div style={{ background: '#18181b', border: '0.5px solid #3f3f46', borderRadius: '12px', padding: '16px', marginTop: '8px', textAlign: 'left' }}>
                <p style={{ color: '#f87171', fontSize: '14px', fontWeight: '600', margin: '0 0 6px' }}>
                  ⚠️ Confirmar cancelamento?
                </p>
                <p style={{ color: '#a1a1aa', fontSize: '13px', margin: '0 0 14px' }}>
                  O horário será liberado e não poderá ser desfeito.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={cancelAppointment}
                    disabled={cancelling}
                    style={{ flex: 1, background: '#7f1d1d', color: '#f87171', border: '1px solid #450a0a', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {cancelling ? 'Cancelando...' : 'Sim, cancelar'}
                  </button>
                  <button
                    onClick={() => setCancelConfirm(false)}
                    style={{ flex: 1, background: '#27272a', color: '#a1a1aa', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {cancelDone && (
          <div style={{ marginTop: '16px', background: '#14271e', border: '0.5px solid #166534', borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ color: '#4ade80', fontSize: '13px', margin: 0 }}>
              ✓ Agendamento cancelado. O horário foi liberado.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // ============================================
  // PÁGINA PRINCIPAL (com agendamento + meus agendamentos)
  // ============================================
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
          <p style={s.heroAddr}><span style={{ marginRight: '6px' }}>📍</span>{barbershop.address}</p>
        )}
        <p style={s.heroHours}>
          🕐 {barbershop.working_hours?.open || barbershop.opening_time || '07:00'} às {barbershop.working_hours?.close || barbershop.closing_time || '18:00'}
        </p>
      </div>

      {/* Botão para alternar entre agendamento e meus agendamentos */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '12px 16px', background: '#18181b', borderBottom: '0.5px solid #27272a' }}>
        <button
          onClick={() => setShowMyAppointments(false)}
          style={{
            ...s.tabBtn,
            background: !showMyAppointments ? '#f59e0b' : 'transparent',
            color: !showMyAppointments ? '#09090b' : '#a1a1aa',
          }}
        >
          ✂️ Novo Agendamento
        </button>
        <button
          onClick={() => setShowMyAppointments(true)}
          style={{
            ...s.tabBtn,
            background: showMyAppointments ? '#f59e0b' : 'transparent',
            color: showMyAppointments ? '#09090b' : '#a1a1aa',
          }}
        >
          📋 Meus agendamentos
        </button>
      </div>

      {/* ========================================= */}
      {/* SEÇÃO: NOVO AGENDAMENTO */}
      {/* ========================================= */}
      {!showMyAppointments && (
        <>
          <div style={s.stepsBar}>
            {STEPS.map((st, i) => (
              <button
                key={i}
                onClick={() => i < step ? setStep(i) : null}
                style={{ ...s.stepBtn, ...(i === step ? s.stepBtnActive : {}), ...(i < step ? s.stepBtnDone : {}), cursor: i < step ? 'pointer' : 'default' }}
              >
                <div style={{ ...s.stepCircle, ...(i === step ? s.stepCircleActive : {}), ...(i < step ? s.stepCircleDone : {}) }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={s.stepLabel}>{st}</span>
              </button>
            ))}
          </div>

          <div style={s.content}>
            {step === 0 && (
              <div style={s.stepWrap}>
                <h2 style={s.stepTitle}>Escolha o Serviço</h2>
                {barbershop.services.length === 0 ? (
                  <div style={s.emptyBox}><p>Nenhum serviço disponível no momento.</p></div>
                ) : (
                  <div style={s.serviceList}>
                    {barbershop.services.map(sv => (
                      <button key={sv.id} onClick={() => { setSelected({ ...selected, service: sv }); setStep(1) }}
                        style={{ ...s.serviceCard, ...(selected.service?.id === sv.id ? s.serviceCardSelected : {}) }}>
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

            {step === 1 && (
              <div style={s.stepWrap}>
                <h2 style={s.stepTitle}>Escolha o Barbeiro</h2>
                <div style={s.barberList}>
                  {barbershop.barbers.map(b => (
                    <button key={b.id} onClick={() => { setSelected({ ...selected, barber: b }); setStep(2) }}
                      style={{ ...s.barberCard, ...(selected.barber?.id === b.id ? s.barberCardSelected : {}) }}>
                      <div style={s.barberAvatar}>{b.name[0].toUpperCase()}</div>
                      <div>
                        <p style={s.barberName}>{b.name}</p>
                        <p style={s.barberRole}>Barbeiro</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(0)} style={s.backBtn}>← Voltar</button>
              </div>
            )}

            {step === 2 && (
              <div style={s.stepWrap}>
                <h2 style={s.stepTitle}>Escolha a Data</h2>
                <div style={s.dateScroll}>
                  {getDates().map((d, i) => (
                    <button key={i} onClick={() => { setSelected({ ...selected, date: formatDateValue(d), time: null }); setStep(3) }}
                      style={{ ...s.dateCard, ...(selected.date === formatDateValue(d) ? s.dateCardSelected : {}) }}>
                      <span style={s.dateWeek}>{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                      <span style={s.dateNum}>{d.getDate()}</span>
                      <span style={s.dateMon}>{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} style={s.backBtn}>← Voltar</button>
              </div>
            )}

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
                      <button key={t} onClick={() => { setSelected({ ...selected, time: t }); setStep(4) }}
                        style={{ ...s.timeBtn, ...(selected.time === t ? s.timeBtnSelected : {}) }}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setStep(2)} style={s.backBtn}>← Voltar</button>
              </div>
            )}

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
                  onChange={e => setSelected({ ...selected, client_phone: onlyDigits(e.target.value) })}
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                />

                {/* Mensagem de erro de telefone */}
                {selected.client_phone && !isValidPhone(selected.client_phone) && (
                  <p style={{ color: '#f87171', fontSize: '12px', margin: '-6px 0 10px' }}>
                    Telefone inválido. Use um DDD real e um celular começando com 9 (ex: 11987654321).
                  </p>
                )}

                <button
                  onClick={confirm}
                  disabled={submitting || !selected.client_name || !isValidPhone(selected.client_phone)}
                  style={{
                    ...s.confirmBtn,
                    opacity: (!selected.client_name || !isValidPhone(selected.client_phone)) ? 0.5 : 1
                  }}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                </button>

                <button onClick={() => setStep(3)} style={s.backBtn}>← Voltar</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================= */}
      {/* SEÇÃO: MEUS AGENDAMENTOS */}
      {/* ========================================= */}
      {showMyAppointments && (
        <div style={s.myAppointmentsSection}>
          <h2 style={s.stepTitle}>Meus Agendamentos</h2>
          <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '16px' }}>
            Informe os dados que usou no agendamento para consultar.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
            <input
              style={s.input}
              placeholder="Seu nome completo"
              value={appointmentName}
              onChange={e => setAppointmentName(e.target.value)}
            />
            <input
              style={s.input}
              placeholder="WhatsApp (ex: 11999999999)"
              value={appointmentPhone}
              onChange={e => setAppointmentPhone(onlyDigits(e.target.value))}
              type="tel"
              inputMode="numeric"
              maxLength={11}
            />
            <button
              onClick={fetchMyAppointments}
              disabled={loadingAppointments}
              style={{ ...s.confirmBtn, background: '#27272a', color: '#fff', marginBottom: '16px' }}
            >
              {loadingAppointments ? 'Buscando...' : '🔍 Buscar meus agendamentos'}
            </button>
          </div>
          
          {myAppointments.length === 0 && !loadingAppointments && (
            <div style={s.emptyBox}>Nenhum agendamento ativo encontrado.</div>
          )}
          
          {myAppointments.map(app => (
            <div key={app.id} style={s.appointmentCard}>
              <div style={s.appointmentInfo}>
                <div>
                  <strong style={{ color: '#fff' }}>{app.service_name}</strong>
                  <span style={{ color: '#71717a', fontSize: '13px', display: 'block' }}>
                    {app.barber_name} • {formatAppointmentDate(app.appointment_date)}
                  </span>
                </div>
                <button
                  onClick={() => cancelMyAppointment(app.cancel_token)}
                  disabled={cancellingId === app.cancel_token}
                  style={{
                    background: '#7f1d1d',
                    color: '#f87171',
                    border: '1px solid #450a0a',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: cancellingId === app.cancel_token ? 0.6 : 1,
                  }}
                >
                  {cancellingId === app.cancel_token ? 'Cancelando...' : 'Cancelar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipe (sempre visível) */}
      <div style={s.teamSection}>
        <h2 style={s.teamTitle}>Nossa Equipe</h2>
        <div style={s.teamList}>
          {barbershop.barbers.map(b => (
            <div key={b.id} style={s.teamCard}>
              <div style={s.teamAvatar}>
                {b.photo ? (
                  <img src={b.photo} alt={b.name} style={s.teamAvatarImg} />
                ) : (
                  b.name[0].toUpperCase()
                )}
              </div>
              <p style={s.teamName}>{b.name}</p>
              <p style={s.teamRole}>Barbeiro</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente PixCopyBox (inalterado)
function PixCopyBox({ pixKey }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ margin: '12px 0', background: '#18181b', border: '0.5px solid #27272a', borderRadius: '10px', padding: '12px 14px' }}>
      <p style={{ fontSize: '11px', color: '#71717a', margin: '0 0 6px', textAlign: 'left' }}>Chave Pix</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#fff', flex: 1, textAlign: 'left', wordBreak: 'break-all' }}>{pixKey}</span>
        <button onClick={copy} style={{ background: copied ? '#14532d' : '#27272a', color: copied ? '#4ade80' : '#a1a1aa', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

const s = {
  // ... mantém todos os estilos que você já tinha
}