import { useState, useEffect } from 'react'

export default function Navbar() {
  const [active] = useState(window.location.pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fechar menu ao pressionar ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Bloquear scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navItems = [
    { label: 'Dashboard',     path: '/dashboard',    icon: 'ti-layout-dashboard' },
    { label: 'Clientes',      path: '/clients',      icon: 'ti-users' },
    { label: 'Barbeiros',     path: '/barbers',      icon: 'ti-scissors' },
    { label: 'Agendamentos',  path: '/appointments', icon: 'ti-calendar-event' },
    { label: 'Serviços',      path: '/services',     icon: 'ti-cut' },
    { label: 'Comandas',      path: '/orders',       icon: 'ti-receipt' },
    { label: 'Comissões',     path: '/commissions',  icon: 'ti-coin' },
    { label: 'Estoque',       path: '/stock',        icon: 'ti-package' },
    { label: 'WhatsApp',      path: '/whatsapp',     icon: 'ti-brand-whatsapp' },
    { label: 'Relatórios',    path: '/reports',      icon: 'ti-chart-bar' },
    { label: 'Configurações', path: '/settings',     icon: 'ti-settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  // ── MOBILE / TABLET ──────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <nav style={m.nav}>
          <div style={m.logoSection} onClick={() => window.location.href = '/dashboard'}>
            <div style={m.logoIcon}>
              <i className="ti ti-scissors" style={{ fontSize: '16px', color: '#09090b' }}></i>
            </div>
            <span style={m.logoText}>BarberPro</span>
          </div>
          <button style={m.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} style={{ fontSize: '22px', color: '#fff' }}></i>
          </button>
        </nav>

        {/* Overlay + Drawer */}
        {menuOpen && (
          <div style={m.overlay} onClick={() => setMenuOpen(false)}>
            <div style={m.drawer} onClick={e => e.stopPropagation()}>

              {/* Drawer Header */}
              <div style={m.drawerHeader}>
                <div style={m.logoIcon}>
                  <i className="ti ti-scissors" style={{ fontSize: '16px', color: '#09090b' }}></i>
                </div>
                <span style={m.logoText}>BarberPro</span>
                <button style={m.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                  <i className="ti ti-x" style={{ fontSize: '18px', color: '#71717a' }}></i>
                </button>
              </div>

              {/* Drawer Items */}
              <div style={m.drawerItems}>
                {navItems.map(item => (
                  
                    key={item.path}
                    href={item.path}
                    style={{
                      ...m.drawerItem,
                      ...(active === item.path ? m.drawerItemActive : {})
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className={`ti ${item.icon}`} style={{ fontSize: '18px', minWidth: '24px' }}></i>
                    <span>{item.label}</span>
                    {active === item.path && (
                      <div style={m.activeIndicator}></div>
                    )}
                  </a>
                ))}
              </div>

              {/* Drawer Footer */}
              <div style={m.drawerFooter}>
                <button onClick={handleLogout} style={m.logoutBtn}>
                  <i className="ti ti-logout" style={{ marginRight: '8px', fontSize: '16px' }}></i>
                  Sair da conta
                </button>
              </div>

            </div>
          </div>
        )}
      </>
    )
  }

  // ── DESKTOP ──────────────────────────────────────────────
  return (
    <nav style={d.nav}>
      <div style={d.container}>

        {/* Logo */}
        <div style={d.logoSection} onClick={() => window.location.href = '/dashboard'}>
          <div style={d.logoIcon}>
            <i className="ti ti-scissors" style={{ fontSize: '18px', color: '#09090b' }}></i>
          </div>
          <span style={d.logoText}>BarberPro</span>
        </div>

        {/* Menu */}
        <div style={d.menu}>
          {navItems.map(item => (
            
              key={item.path}
              href={item.path}
              style={{ ...d.menuItem, ...(active === item.path ? d.menuItemActive : {}) }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: '15px' }}></i>
              {item.label}
            </a>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={d.logoutBtn}>
          <i className="ti ti-logout" style={{ marginRight: '6px' }}></i>
          Sair
        </button>

      </div>
    </nav>
  )
}

// ── Mobile styles ─────────────────────────────────────────
const m = {
  nav: {
    background: '#18181b',
    borderBottom: '0.5px solid #27272a',
    padding: '0 16px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 200,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '30px',
    height: '30px',
    background: '#f59e0b',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 300,
    display: 'flex',
  },
  drawer: {
    width: '280px',
    maxWidth: '85vw',
    background: '#18181b',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '0.5px solid #27272a',
    boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    borderBottom: '0.5px solid #27272a',
    flexShrink: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
  },
  drawerItems: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px',
  },
  drawerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#a1a1aa',
    textDecoration: 'none',
    marginBottom: '2px',
    position: 'relative',
  },
  drawerItemActive: {
    background: '#27272a',
    color: '#f59e0b',
  },
  activeIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#f59e0b',
    marginLeft: 'auto',
  },
  drawerFooter: {
    padding: '16px',
    borderTop: '0.5px solid #27272a',
    flexShrink: 0,
  },
  logoutBtn: {
    width: '100%',
    background: '#2a1414',
    color: '#f87171',
    border: '0.5px solid #7f1d1d',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

// ── Desktop styles ────────────────────────────────────────
const d = {
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
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flexShrink: 0,
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
    gap: '2px',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#a1a1aa',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  menuItemActive: {
    background: '#27272a',
    color: '#f59e0b',
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
    flexShrink: 0,
  },
}