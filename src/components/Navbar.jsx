import { useState } from 'react'

export default function Navbar() {
  const [active, setActive] = useState(window.location.pathname)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'ti-layout-dashboard' },
    { label: 'Clientes', path: '/clients', icon: 'ti-users' },
    { label: 'Barbeiros', path: '/barbers', icon: 'ti-scissors' },
    { label: 'Agendamentos', path: '/appointments', icon: 'ti-calendar-event' },
    { label: 'Comandas', path: '/orders', icon: 'ti-receipt' },
    { label: 'Comissões', path: '/commissions', icon: 'ti-coin' },
    { label: 'WhatsApp', path: '/whatsapp', icon: 'ti-brand-whatsapp' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.logoSection} onClick={() => window.location.href = '/dashboard'}>
          <div style={styles.logoIcon}>
            <i className="ti ti-scissors" style={{ fontSize: '18px', color: '#09090b' }}></i>
          </div>
          <span style={styles.logoText}>BarberPro</span>
        </div>

        <div style={styles.menu}>
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              style={{
                ...styles.menuItem,
                ...(active === item.path ? styles.menuItemActive : {})
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: '16px' }}></i>
              {item.label}
            </a>
          ))}
        </div>

        <div style={styles.userSection}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <i className="ti ti-logout" style={{ marginRight: '6px' }}></i>
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#18181b',
    borderBottom: '0.5px solid #27272a',
    padding: '0 20px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: '#f59e0b',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#a1a1aa',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  menuItemActive: {
    background: '#27272a',
    color: '#f59e0b',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    background: '#2a1414',
    color: '#f87171',
    border: '0.5px solid #7f1d1d',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  }
}