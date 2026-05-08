import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const links = [
    { path: '/dashboard', label: '🏠 Dashboard' },
    { path: '/clients', label: '👥 Clientes' },
    { path: '/barbers', label: '✂️ Barbeiros' },
    { path: '/appointments', label: '📅 Agendamentos' },
  ]

  return (
    <div style={styles.navbar}>
      <div style={styles.brand}>BarberPro</div>
      <div style={styles.links}>
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              ...styles.link,
              ...(location.pathname === link.path ? styles.active : {})
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
      <button onClick={handleLogout} style={styles.logout}>Sair</button>
    </div>
  )
}

const styles = {
  navbar: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '0 24px', height: '60px', gap: '16px' },
  brand: { color: '#fff', fontWeight: '700', fontSize: '18px', marginRight: '16px' },
  links: { display: 'flex', gap: '8px', flex: 1 },
  link: { padding: '8px 16px', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  active: { backgroundColor: '#2563eb', color: '#fff' },
  logout: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
}