import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

function DiamondMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon points="16,2 30,12 24,30 8,30 2,12" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="16,8 24,13 21,24 11,24 8,13" fill="var(--gold-400)" opacity="0.18" />
      <line x1="2" y1="12" x2="30" y2="12" stroke="var(--gold-400)" strokeWidth="1" opacity="0.6" />
      <line x1="8" y1="30" x2="16" y2="12" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.5" />
      <line x1="24" y1="30" x2="16" y2="12" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function MenuIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {open ? (
        <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
      ) : (
        <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
      )}
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34 C3.82 19.34 8 22 12 19 C16 16 18 12 18 8Z" />
      <path d="M3.82 19.34 L12 12" />
    </svg>
  )
}

function BadgeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// Nav links — relabelled for Pakistani audience
// "Catalog" → "All Stones" (clear, direct)
// "Natural"  → "Natural"   (universally understood)
// "Certified" → "Certified" (fine as-is)
// ─────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'All Stones', to: '/',               icon: HomeIcon  },
  { label: 'Natural',    to: '/?natural=true',   icon: LeafIcon  },
  { label: 'Certified',  to: '/?certified=true', icon: BadgeIcon },
]

const navLinkStyle = (isActive) => ({
  padding: '6px 13px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  color: isActive ? 'var(--gem-500)' : 'var(--text-secondary)',
  background: isActive ? 'var(--gem-50)' : 'transparent',
  transition: 'all 0.15s ease',
  letterSpacing: '0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
})

// ─────────────────────────────────────────────
// Avatar circle — shows first letter of username
// ─────────────────────────────────────────────

function Avatar({ username, size = 28 }) {
  const letter = (username || 'U')[0].toUpperCase()
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      background: 'var(--gem-500)',
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.42}px`,
      fontWeight: 600,
      flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {letter}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────

export default function Navbar({ theme, onToggleTheme }) {
  const { isAdmin, isLoggedIn, user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [menuOpen,  setMenuOpen]  = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const navRef = useRef(null)

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    logout()
    navigate('/')
  }

  return (
    <header
      ref={navRef}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'var(--nav-height)',
        background: 'var(--surface-0)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'var(--surface-3)'}`,
        transition: 'border-color 0.3s ease',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <nav style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 20px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:'9px',textDecoration:'none',flexShrink:0 }}>
          <DiamondMark size={28} />
          <span style={{ display:'flex',flexDirection:'column',lineHeight:1 }}>
            <span style={{ fontFamily:'var(--font-display)',fontSize:'19px',fontWeight:600,color:'var(--text-primary)',letterSpacing:'0.02em' }}>
              GMSTONES
            </span>
            <span style={{ fontSize:'8.5px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--gold-500)',fontWeight:500,marginTop:'1px' }}>
              Fine Gemstones
            </span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="nav-links" style={{ display:'flex',alignItems:'center',gap:'2px',flex:1 }}>
          {NAV_LINKS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              style={({ isActive }) => navLinkStyle(isActive)}
              onMouseEnter={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'var(--surface-2)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Right actions ── */}
        <div style={{ display:'flex',alignItems:'center',gap:'6px',flexShrink:0 }}>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width:'34px', height:'34px',
              borderRadius:'var(--radius-sm)',
              border:'1px solid var(--border)',
              background:'var(--surface-2)',
              cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--text-secondary)',
              transition:'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--surface-3)'; e.currentTarget.style.color='var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--surface-2)'; e.currentTarget.style.color='var(--text-secondary)' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* ── ADMIN: Add Stone button (desktop) ── */}
          {isAdmin && (
            <Link
              to="/gemstones/create"
              className="nav-add-btn"
              style={{
                display:'flex', alignItems:'center', gap:'5px',
                padding:'7px 13px',
                borderRadius:'var(--radius-sm)',
                background:'var(--gem-500)',
                color:'#fff',
                fontSize:'13px', fontWeight:500,
                textDecoration:'none',
                transition:'background 0.15s, transform 0.1s',
                whiteSpace:'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--gem-400)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--gem-500)'; e.currentTarget.style.transform='translateY(0)' }}
            >
              <PlusIcon /> Add Stone
            </Link>
          )}

          {/* ── User pill — shown when logged in (admin or user) ── */}
          {isLoggedIn && (
            <div style={{
              display:'flex', alignItems:'center', gap:'7px',
              padding:'4px 10px 4px 5px',
              borderRadius:'99px',
              border:'1px solid var(--border)',
              background:'var(--surface-1)',
              flexShrink: 0,
            }}>
              <Avatar username={user?.username} size={24} />
              <span className="nav-username" style={{
                fontSize:'13px', fontWeight:500,
                color:'var(--text-primary)',
                maxWidth:'90px',
                overflow:'hidden',
                textOverflow:'ellipsis',
                whiteSpace:'nowrap',
              }}>
                {user?.username}
              </span>
            </div>
          )}

          {/* ── GUEST: Login button ── */}
          {!isLoggedIn && (
            <Link
              to="/login"
              style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'7px 13px',
                borderRadius:'var(--radius-sm)',
                border:'1px solid var(--border)',
                background:'var(--surface-0)',
                color:'var(--text-secondary)',
                fontSize:'13px', fontWeight:500,
                textDecoration:'none',
                transition:'all 0.15s',
                whiteSpace:'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--surface-2)'; e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--surface-0)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)' }}
            >
              <UserIcon /> Login
            </Link>
          )}

          {/* ── Logout button (desktop, logged in) ── */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="nav-logout-btn"
              style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'7px 13px',
                borderRadius:'var(--radius-sm)',
                border:'1px solid var(--border)',
                background:'var(--surface-0)',
                color:'var(--text-secondary)',
                fontSize:'13px', fontWeight:500,
                cursor:'pointer',
                transition:'all 0.15s',
                whiteSpace:'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.color='#e03131'; e.currentTarget.style.borderColor='#fca5a5' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--surface-0)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)' }}
            >
              <LogOutIcon /> Logout
            </button>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="mobile-menu-btn"
            style={{
              display:'none',
              width:'34px', height:'34px',
              borderRadius:'var(--radius-sm)',
              border:'1px solid var(--border)',
              background:'transparent',
              cursor:'pointer',
              alignItems:'center', justifyContent:'center',
              color:'var(--text-primary)',
            }}
          >
            <MenuIcon open={menuOpen} />
          </button>

        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={{
          position:'absolute',
          top:'var(--nav-height)',
          left:0, right:0,
          background:'var(--surface-0)',
          borderBottom:'1px solid var(--border)',
          boxShadow:'var(--shadow-md)',
          zIndex:99,
        }}>

          {/* User info strip at top of mobile menu */}
          {isLoggedIn && (
            <div style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'14px 20px',
              borderBottom:'1px solid var(--border)',
              background:'var(--surface-1)',
            }}>
              <Avatar username={user?.username} size={32} />
              <div>
                <p style={{ fontSize:'14px',fontWeight:600,color:'var(--text-primary)',margin:0 }}>
                  {user?.username}
                </p>
                <p style={{ fontSize:'11px',color:'var(--text-muted)',margin:0,marginTop:'1px',textTransform:'capitalize' }}>
                  {user?.role || 'Member'}
                </p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div style={{ padding:'8px 12px' }}>
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'11px 12px',
                  borderRadius:'var(--radius-sm)',
                  fontSize:'15px', fontWeight:500,
                  textDecoration:'none',
                  color: isActive ? 'var(--gem-500)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--gem-50)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--gem-400)' : '3px solid transparent',
                  marginBottom:'2px',
                })}
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div style={{ padding:'0 12px 8px', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
              <p style={{ fontSize:'10px',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',padding:'4px 12px 8px' }}>
                Admin
              </p>
              <Link
                to="/gemstones/create"
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'11px 12px',
                  borderRadius:'var(--radius-sm)',
                  fontSize:'15px', fontWeight:500,
                  color:'var(--gem-500)', textDecoration:'none',
                  background:'var(--gem-50)',
                  border:'1px solid var(--gem-200)',
                }}
              >
                <PlusIcon /> Add New Gemstone
              </Link>
            </div>
          )}

          {/* Auth section */}
          <div style={{ padding:'0 12px 12px', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  width:'100%',
                  padding:'11px 12px',
                  borderRadius:'var(--radius-sm)',
                  fontSize:'15px', fontWeight:500,
                  color:'#e03131', background:'#fff1f2',
                  border:'1px solid #fca5a5',
                  cursor:'pointer', textAlign:'left',
                }}
              >
                <LogOutIcon /> Sign out
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'11px 12px',
                  borderRadius:'var(--radius-sm)',
                  fontSize:'15px', fontWeight:500,
                  color:'var(--text-secondary)', textDecoration:'none',
                }}
              >
                <UserIcon /> Login
              </Link>
            )}
          </div>

        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links       { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .nav-add-btn     { display: none !important; }
          .nav-logout-btn  { display: none !important; }
          .nav-username    { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-username { display: none !important; }
        }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </header>
  )
}