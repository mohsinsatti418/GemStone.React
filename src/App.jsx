import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import AppRoutes from './routes/AppRoutes'
import { useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'
import { Link } from 'react-router-dom'

export default function App() {

  // Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  )
  const { cartCount } = useCart()
  const { isAdmin }   = useAuth()
  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    // Save theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // Toggle function
  const toggleTheme = () => {
    setTheme(prev =>
      prev === 'dark' ? 'light' : 'dark'
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-1)',
        color: 'var(--text-primary)',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main  className="container py-8">
        <AppRoutes />
      </main>
      {!isAdmin && cartCount > 0 && (
  <Link
    to="/cart"
    style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 20px',
      borderRadius: '99px',
      background: 'var(--gem-500)',
      color: '#fff',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 600,
      boxShadow: '0 4px 20px rgba(46,80,64,0.45)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 6px 28px rgba(46,80,64,0.55)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,80,64,0.45)'
    }}
  >
    {/* Cart icon */}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9"  cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>

    <span>Cart</span>

    {/* Item count badge */}
    <span style={{
      background: '#fff',
      color: 'var(--gem-500)',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: 700,
      padding: '1px 8px',
      minWidth: '24px',
      textAlign: 'center',
    }}>
      {cartCount}
    </span>
  </Link>
)}
    </div>
  )
}