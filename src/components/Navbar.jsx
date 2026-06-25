import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Dashboard',     path: '/dashboard',    icon: 'ti-layout-dashboard' },
  { label: 'Clientes',      path: '/clients',      icon: 'ti-users' },
  { label: 'Barbeiros',     path: '/barbers',      icon: 'ti-scissors' },
  { label: 'Agendamentos',  path: '/appointments', icon: 'ti-calendar-event' },
  { label: 'Serviços', path: '/services', icon: 'ti-tools' },
  { label: 'Comandas',      path: '/orders',       icon: 'ti-receipt' },
  { label: 'Comissões',     path: '/commissions',  icon: 'ti-coin' },
  { label: 'Estoque',       path: '/stock',        icon: 'ti-package' },
  { label: 'WhatsApp',      path: '/whatsapp',     icon: 'ti-brand-whatsapp' },
  { label: 'Relatórios',    path: '/reports',      icon: 'ti-chart-bar' },
  { label: 'Configurações', path: '/settings',     icon: 'ti-settings' },
 ]

const MOBILE_BREAKPOINT = 1024

export default function Navbar() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [hoverLogout, setHoverLogout] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  const navigate = (path) => {
    window.location.href = path
  }

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (isMobile) {
    return (
      <>
        <nav style={m.nav}>
          <div style={m.logoSection} onClick={() => navigate('/dashboard')}>
            <div style={m.logoIcon}>
              <i className="ti ti-scissors" style={{ fontSize: 16, color: '#09090b' }} />
            </div>
            <span style={m.logoText}>BarberPro</span>
          </div>

          <button
            style={m.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} style={{ fontSize: 22, color: '#fff' }} />
          </button>
        </nav>

        {menuOpen && (
          <div style={m.overlay} onClick={() => setMenuOpen(false)}>
            <div style={m.drawer} onClick={(e) => e.stopPropagation()}>
              <div style={m.drawerHeader}>
                <div style={m.logoIcon}>
                  <i className="ti ti-scissors" style={{ fontSize: 16, color: '#09090b' }} />
                </div>
                <span style={m.logoText}>BarberPro</span>
                <button style={m.closeBtn} onClick={() => setMenuOpen(false)}>
                  <i className="ti ti-x" style={{ fontSize: 18, color: '#a1a1aa' }} />
                </button>
              </div>

              <div style={m.drawerItems}>
                {navItems.map((item) => {
                  const active = isActive(item.path)
                  const hover = hoveredItem === item.path
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      style={{
                        ...m.drawerItem,
                        ...(hover && !active ? m.drawerItemHover : {}),
                        ...(active ? m.drawerItemActive : {}),
                      }}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <i className={`ti ${item.icon}`} style={{ fontSize: 18, minWidth: 24 }} />
                      <span>{item.label}</span>
                      {active && <div style={m.activeIndicator} />}
                    </a>
                  )
                })}
              </div>

              <div style={m.drawerFooter}>
                <button onClick={handleLogout} style={m.logoutBtn}>
                  <i className="ti ti-logout" style={{ marginRight: 8, fontSize: 16 }} />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <nav style={d.nav}>
      <div style={d.container}>
        <div style={d.logoSection} onClick={() => navigate('/dashboard')}>
          <div style={d.logoIcon}>
            <i className="ti ti-scissors" style={{ fontSize: 18, color: '#09090b' }} />
          </div>
          <span style={d.logoText}>BarberPro</span>
        </div>

        <div style={d.menu}>
          {navItems.map((item) => {
            const active = isActive(item.path)
            const hover = hoveredItem === item.path
            return (
              <a
                key={item.path}
                href={item.path}
                style={{
                  ...d.menuItem,
                  ...(hover && !active ? d.menuItemHover : {}),
                  ...(active ? d.menuItemActive : {}),
                }}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 15 }} />
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>

        <button
          onClick={handleLogout}
          style={{ ...d.logoutBtn, ...(hoverLogout ? d.logoutBtnHover : {}) }}
          onMouseEnter={() => setHoverLogout(true)}
          onMouseLeave={() => setHoverLogout(false)}
        >
          <i className="ti ti-logout" style={{ marginRight: 6 }} />
          Sair
        </button>
      </div>
    </nav>
  )
}

const m = {
  nav: { background: '#18181b', borderBottom: '1px solid #27272a', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200 },
  logoSection: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  logoIcon: { width: 30, height: 30, background: '#f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontSize: 16, fontWeight: 600, color: '#fff' },
  hamburger: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)', zIndex: 300, display: 'flex' },
  drawer: { width: 280, maxWidth: '85vw', background: '#18181b', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #27272a', boxShadow: '4px 0 24px rgba(0,0,0,0.5)' },
  drawerHeader: { display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: '1px solid #27272a', flexShrink: 0 },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  drawerItems: { flex: 1, overflowY: 'auto', padding: '12px 8px' },
  drawerItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#a1a1aa', textDecoration: 'none', marginBottom: 2, position: 'relative' },
  drawerItemHover: { background: '#1f1f23', color: '#fff' },
  drawerItemActive: { background: '#27272a', color: '#f59e0b' },
  activeIndicator: { width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', marginLeft: 'auto' },
  drawerFooter: { padding: 16, borderTop: '1px solid #27272a', flexShrink: 0 },
  logoutBtn: { width: '100%', background: '#2a1414', color: '#f87171', border: '1px solid #7f1d1d', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

const d = {
  nav: { background: '#18181b', borderBottom: '1px solid #27272a', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: 1400, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  logoSection: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 },
  logoIcon: { width: 32, height: 32, background: '#f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' },
  menu: { display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap', overflow: 'hidden' },
  menuItem: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, fontSize: 10, fontWeight: 500, color: '#a1a1aa', textDecoration: 'none', whiteSpace: 'nowrap' },
  menuItemHover: { background: '#1f1f23', color: '#fff' },
  menuItemActive: { background: '#27272a', color: '#f59e0b' },
  logoutBtn: { background: '#2a1414', color: '#f87171', border: '1px solid #7f1d1d', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
  logoutBtnHover: { background: '#3a1a1a' },
}