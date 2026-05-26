import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

// ─────────────────────────────────────────────
// API call — matches your AuthController exactly
// POST /api/Auth/login
// Body: { username, password }
// Response: { token, username, email, role, expiresAt }
// ─────────────────────────────────────────────

async function loginRequest(username, password) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/Auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Invalid username or password')
  return data  // { token, username, email, role, expiresAt }
}

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, isLoggedIn } = useAuth()

  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  // Where to send the user after login
  // ProtectedRoute saves the attempted path here
  const from = location.state?.from || '/'

  // Already logged in — redirect away immediately
  if (isLoggedIn) {
    navigate(from, { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) { setError('Username is required'); return }
    if (!password)        { setError('Password is required'); return }
    if (!executeRecaptcha) {
      setError('reCAPTCHA not ready. Please wait.')
      return
    }

    setIsLoading(true)
    try {
      const captchaToken = await executeRecaptcha('login')
      // data = { token, username, email, role, expiresAt }
      const data = await loginRequest(username.trim(), password, captchaToken )

      // Pass just the token — AuthContext decodes it
      login(data.token)

      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-height))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.3s ease' }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none" style={{ marginBottom: '16px' }}>
            <polygon points="16,2 30,12 24,30 8,30 2,12" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="16,8 24,13 21,24 11,24 8,13" fill="var(--gold-400)" opacity="0.18"/>
            <line x1="2"  y1="12" x2="30" y2="12" stroke="var(--gold-400)" strokeWidth="1"   opacity="0.6"/>
            <line x1="8"  y1="30" x2="16" y2="12" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.5"/>
            <line x1="24" y1="30" x2="16" y2="12" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.5"/>
          </svg>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px', fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '0.01em', marginBottom: '6px',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Sign in to the Gems portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface-0)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-md)',
        }}>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', marginBottom: '20px',
              borderRadius: 'var(--radius-md)',
              background: '#fff1f2', border: '1px solid #fca5a5',
              color: '#c92a2a', fontSize: '13.5px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-0)',
                  color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.15s',
                  opacity: isLoading ? 0.6 : 1,
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-0)',
                    color: 'var(--text-primary)',
                    fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.15s',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex',
                    alignItems: 'center', padding: '2px', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '4px',
                padding: '11px',
                borderRadius: 'var(--radius-md)',
                background: isLoading ? 'var(--gem-300)' : 'var(--gem-500)',
                color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'var(--gem-400)' }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = 'var(--gem-500)' }}
            >
              {isLoading && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              )}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--gem-500)', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Back to catalog */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          <Link
            to="/"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ← Back to catalog
          </Link>
        </p>

      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin   { to{transform:rotate(360deg);} }
      `}</style>
    </div>
  )
}