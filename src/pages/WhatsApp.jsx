import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'

const API_URL = 'https://barber-saas-1-fpjl.onrender.com/api'

export default function WhatsApp() {
  const [status, setStatus] = useState('loading')
  const [qrCode, setQrCode] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [error, setError] = useState(null)
  const pollRef = useRef(null)

  function getHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_URL}/whatsapp/status`, { headers: getHeaders() })
      const data = await res.json()
      if (data.status === 'connected') {
        setStatus('connected')
        setQrCode(null)
        if (pollRef.current) clearInterval(pollRef.current)
      } else {
        setStatus('disconnected')
      }
    } catch {
      setStatus('disconnected')
    }
  }

  async function generateQR() {
    // Limpa qualquer polling anterior
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    setQrLoading(true)
    setQrCode(null)
    setError(null)
    setStatus('connecting')

    try {
      const res = await fetch(`${API_URL}/whatsapp/connect`, { headers: getHeaders() })
      const data = await res.json()

      // LOG PARA DEBUG
      console.log('🔍 [generateQR] Status HTTP:', res.status)
      console.log('📦 [generateQR] Resposta:', data)

      if (!res.ok) {
        // Se o backend retornou erro (401, 500, etc), mostramos a mensagem
        const msg = data.message || data.error || `Erro ${res.status} ao conectar.`
        setError(msg)
        setStatus('disconnected')
        setQrLoading(false)
        return
      }

      // Se já veio o QR na resposta (base64)
      if (data.base64) {
        setQrCode(data.base64)
        setQrLoading(false)
        // Inicia polling de status
        pollRef.current = setInterval(fetchStatus, 3000)
        return
      }

      // Se não veio QR, faz polling para buscar o QR depois
      let attempts = 0
      const maxAttempts = 10

      const pollQR = setInterval(async () => {
        attempts++
        try {
          const res2 = await fetch(`${API_URL}/whatsapp/status`, { headers: getHeaders() })
          const data2 = await res2.json()
          console.log(`🔄 [poll ${attempts}]`, data2)

          if (data2.base64) {
            setQrCode(data2.base64)
            setQrLoading(false)
            clearInterval(pollQR)
            // Agora que o QR apareceu, monitora o status
            pollRef.current = setInterval(fetchStatus, 3000)
          } else if (attempts >= maxAttempts) {
            clearInterval(pollQR)
            setError('O QR Code demorou muito para ser gerado. Tente novamente.')
            setStatus('disconnected')
            setQrLoading(false)
          }
        } catch (err) {
          console.error('Erro no polling:', err)
        }
      }, 3000)

    } catch (err) {
      console.error('❌ Erro de rede:', err)
      setError('Erro de rede ao conectar com a Evolution API.')
      setStatus('disconnected')
      setQrLoading(false)
    }
  }

  async function disconnect() {
    try {
      await fetch(`${API_URL}/whatsapp/disconnect`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      setStatus('disconnected')
      setQrCode(null)
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    } catch {
      setError('Erro ao desconectar.')
    }
  }

  useEffect(() => {
    fetchStatus()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      <div style={styles.container}>
        {/* Header igual... */}

        <div style={styles.card}>
          {status === 'loading' && (
            <div style={styles.center}>
              <div style={styles.spinner}></div>
              <p style={styles.hint}>Verificando status...</p>
            </div>
          )}

          {status === 'connected' && (
            <div style={styles.center}>
              <h2 style={styles.connectedTitle}>✅ WhatsApp Conectado!</h2>
              <p style={styles.hint}>Seu WhatsApp está ativo e pronto para enviar mensagens automáticas.</p>
              <button style={styles.disconnectBtn} onClick={disconnect}>Desconectar</button>
            </div>
          )}

          {(status === 'disconnected' || status === 'connecting') && !qrCode && (
            <div style={styles.center}>
              <h2 style={styles.disconnectedTitle}>WhatsApp Desconectado</h2>
              <p style={styles.hint}>Clique no botão abaixo para gerar o QR Code e conectar.</p>
              {error && <p style={styles.errorMsg}>{error}</p>}
              <button style={styles.connectBtn} onClick={generateQR} disabled={qrLoading}>
                {qrLoading ? 'Gerando QR Code...' : 'Gerar QR Code'}
              </button>
            </div>
          )}

          {qrCode && status !== 'connected' && (
            <div style={styles.center}>
              <h2 style={styles.qrTitle}>Escaneie o QR Code</h2>
              <p style={styles.hint}>Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
              <div style={styles.qrWrapper}>
                <img
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp"
                  style={styles.qrImage}
                />
              </div>
              <button style={styles.retryBtn} onClick={generateQR}>Gerar novo QR Code</button>
            </div>
          )}
        </div>

        {/* Info cards ... */}
      </div>
    </div>
  )
}
const styles = {
  pageWrapper: { minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '20px', flexWrap: 'wrap' },
  pageTitle: { fontSize: '26px', fontWeight: '600', margin: '0 0 6px 0', color: '#fff' },
  pageSubtitle: { fontSize: '14px', color: '#71717a', margin: 0 },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', border: '0.5px solid' },
  badgeGreen: { background: '#14271e', color: '#4ade80', borderColor: '#166534' },
  badgeYellow: { background: '#2a1f10', color: '#fb923c', borderColor: '#7c2d12' },
  badgeRed: { background: '#2a1414', color: '#f87171', borderColor: '#7f1d1d' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '48px 24px', marginBottom: '24px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  connectedTitle: { fontSize: '22px', fontWeight: '600', color: '#4ade80', margin: '0 0 8px 0' },
  disconnectedTitle: { fontSize: '22px', fontWeight: '600', color: '#fff', margin: '0 0 8px 0' },
  qrTitle: { fontSize: '22px', fontWeight: '600', color: '#fff', margin: '0 0 8px 0' },
  hint: { fontSize: '14px', color: '#71717a', margin: '0 0 24px 0', maxWidth: '400px' },
  errorMsg: { fontSize: '13px', color: '#f87171', background: '#2a1414', border: '0.5px solid #7f1d1d', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' },
  connectBtn: { padding: '12px 28px', background: '#f59e0b', color: '#09090b', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  disconnectBtn: { padding: '10px 24px', background: '#2a1414', color: '#f87171', border: '0.5px solid #7f1d1d', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  retryBtn: { padding: '10px 20px', background: '#27272a', color: '#a1a1aa', border: '0.5px solid #3f3f46', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '8px' },
  qrWrapper: { background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '8px' },
  qrImage: { width: '220px', height: '220px', display: 'block' },
  spinner: { width: '32px', height: '32px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', marginBottom: '16px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  infoCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '24px' },
  infoTitle: { fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 8px 0' },
  infoText: { fontSize: '13px', color: '#71717a', margin: 0, lineHeight: '1.6' },
}