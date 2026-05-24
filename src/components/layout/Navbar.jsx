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
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function MenuIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
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

// ─────────────────────────────────────────────
// Nav links — same for all users
// ─────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Catalog', to: '/' },
  { label: 'Natural', to: '/?natural=true' },
  { label: 'Certified', to: '/?certified=true' },
]

// ─────────────────────────────────────────────
// Shared nav link style
// ─────────────────────────────────────────────

const navLinkStyle = (isActive) => ({
  padding: '6px 14px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  color: isActive ? 'var(--gem-500)' : 'var(--text-secondary)',
  background: isActive ? 'var(--gem-50)' : 'transparent',
  transition: 'all 0.15s ease',
  letterSpacing: '0.01em',
})


// ─────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────

export default function Navbar({ theme, onToggleTheme }) {
  const { isAdmin, isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false) // mobile hamburger
  const [dropdownOpen, setDropdownOpen] = useState(false) // admin dropdown
  const [scrolled, setScrolled] = useState(false)

  const navRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false) }, [location])

  // Scroll detection for frosted glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Close admin dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem('authToken');
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
        transition: 'background 0.3s ease, border-color 0.3s ease',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >

        {/* ── Logo ── */}
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          <DiamondMark size={30} />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px', fontWeight: 600,
              color: 'var(--text-primary)', letterSpacing: '0.02em',
            }}>
              GMSTONES
            </span>
            <span style={{
              fontSize: '9px', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--gold-500)',
              fontWeight: 500, marginTop: '1px',
            }}>
              Fine Gemstones
            </span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div
          className="nav-links"
          style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}
        >
          {NAV_LINKS.map(({ label, to }) => (
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
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Right side actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Theme toggle — shown for everyone */}
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '34px', height: '34px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-3)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-2)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* ── ADMIN: user button + dropdown ── */}
          {isAdmin && (
            <button
              aria-label="Admin user"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-3)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <UserIcon />
              <span className="nav-username">{user?.username}</span>
            </button>
          )}

          {/* ── ADMIN: Add Stone button ── */}
          {isAdmin && (
            <Link
              to="/gemstones/create"
              className="nav-add-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gem-500)',
                color: '#fff',
                fontSize: '13px', fontWeight: 500,
                textDecoration: 'none',
                transition: 'background 0.15s, transform 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--gem-400)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--gem-500)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <PlusIcon /> Add Stone
            </Link>
          )}

          {/* ── GUEST: Login button ── */}
          {!isLoggedIn ? (
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface-0)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--border-strong)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface-0)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <UserIcon /> Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface-0)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--border-strong)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface-0)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              Logout
            </button>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              width: '34px', height: '34px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <MenuIcon open={menuOpen} />
          </button>

        </div>
      </nav>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: 'var(--nav-height)',
          left: 0, right: 0,
          background: 'var(--surface-0)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 20px 18px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', flexDirection: 'column', gap: '2px',
        }}>
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...navLinkStyle(isActive),
                padding: '10px 14px',
                fontSize: '15px',
                borderLeft: isActive ? '3px solid var(--gem-400)' : '3px solid transparent',
              })}
            >
              {label}
            </NavLink>
          ))}

          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

          {/* Mobile: Admin links */}
          {isAdmin && (
            <>
              <Link
                to="/gemstones/create"
                style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  fontSize: '15px', fontWeight: 500,
                  color: 'var(--gem-500)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <PlusIcon /> Add gemstone
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  fontSize: '15px', fontWeight: 500,
                  color: '#e03131', background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <LogOutIcon /> Sign out
              </button>
            </>
          )}

          {/* Mobile: Guest login link */}
          {!isLoggedIn && (
            <Link
              to="/login"
              style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: '15px', fontWeight: 500,
                color: 'var(--text-secondary)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <UserIcon />  login
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links      { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .nav-add-btn    { display: none !important; }
          .nav-username   { display: none !important; }
        }
        [data-theme="dark"] header {
          background: ${scrolled ? 'rgba(15,26,21,0.88)' : 'var(--surface-0)'};
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}