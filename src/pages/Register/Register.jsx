import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

// ─────────────────────────────────────────────
// POST /api/Auth/register
// Body: { username, email, password, confirmPassword }
// Response: { token, username, email, role, expiresAt }
// On success the user is automatically logged in
// ─────────────────────────────────────────────

async function registerRequest(username, email, password, confirmPassword, captchaToken) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/Auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, confirmPassword, captchaToken }),
    }
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // .NET ModelState errors come back as:
    // { errors: { Username: ['...'], Email: ['...'] } }
    // We flatten them into a single readable string
    if (data.errors) {
      const messages = Object.values(data.errors).flat().join(' ')
      throw new Error(messages)
    }
    throw new Error(data.message || 'Registration failed')
  }
  return data  // { token, username, email, role, expiresAt }
}

// ─────────────────────────────────────────────
// Client-side validation — mirrors your RegisterVM
// so the user gets instant feedback before the
// request even leaves the browser
// ─────────────────────────────────────────────

function validate(form) {
  const errs = {}
  if (!form.username.trim())
    errs.username = 'Username is required'
  else if (form.username.trim().length < 3)
    errs.username = 'Username must be at least 3 characters'
  else if (form.username.trim().length > 100)
    errs.username = 'Username must be under 100 characters'

  if (!form.email.trim())
    errs.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Invalid email format'

  if (!form.password)
    errs.password = 'Password is required'
  else if (form.password.length < 6)
    errs.password = 'Password must be at least 6 characters'

  if (!form.confirmPassword)
    errs.confirmPassword = 'Please confirm your password'
  else if (form.password !== form.confirmPassword)
    errs.confirmPassword = 'Passwords do not match'

  return errs
}

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// Reusable field wrapper
// ─────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '13px', fontWeight: 500,
        color: error ? '#c92a2a' : 'var(--text-secondary)',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '11.5px', color: '#c92a2a' }}>{error}</span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Password strength indicator
// ─────────────────────────────────────────────

function PasswordStrength({ password }) {
  if (!password) return null

  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: '3px', borderRadius: '99px',
              background: i <= strength ? colors[strength] : 'var(--surface-3)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '11px', color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const INITIAL = { username: '', email: '', password: '', confirmPassword: '' }

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoggedIn } = useAuth()

  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  // Already logged in — go home
  if (isLoggedIn) { navigate('/', { replace: true }); return null }

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setApiError('')
    if (submitted) {
      // Live-clear individual field errors after first submit attempt
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setApiError('')

    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    if (!executeRecaptcha) {
      setError('reCAPTCHA not ready. Please wait.')
      return
    }

    setIsLoading(true)
    try {
      const captchaToken = await executeRecaptcha('register')
      const data = await registerRequest(
        form.username.trim(),
        form.email.trim(),
        form.password,
        form.confirmPassword,
        captchaToken
      )
      toast.success('Account created! Please sign in.')
      setTimeout(() => navigate('/login', { replace: true }), 800)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = (hasError) => ({
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${hasError ? '#fca5a5' : 'var(--border)'}`,
    background: 'var(--surface-0)',
    color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    opacity: isLoading ? 0.6 : 1,
  })

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-height))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.3s ease' }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none" style={{ marginBottom: '14px' }}>
            <polygon points="16,2 30,12 24,30 8,30 2,12" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="16,8 24,13 21,24 11,24 8,13" fill="var(--gold-400)" opacity="0.18" />
            <line x1="2" y1="12" x2="30" y2="12" stroke="var(--gold-400)" strokeWidth="1" opacity="0.6" />
            <line x1="8" y1="30" x2="16" y2="12" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.5" />
            <line x1="24" y1="30" x2="16" y2="12" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.5" />
          </svg>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px', fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '0.01em', marginBottom: '6px',
          }}>
            Create account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Join the GemVault platform
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

          {/* API error banner */}
          {apiError && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 14px', marginBottom: '20px',
              borderRadius: 'var(--radius-md)',
              background: '#fff1f2', border: '1px solid #fca5a5',
              color: '#c92a2a', fontSize: '13.5px', lineHeight: 1.5,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Username */}
            <Field label="Username" error={errors.username}>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                placeholder="Choose a username (min. 3 chars)"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                maxLength={100}
                style={inputStyle(!!errors.username)}
                onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                onBlur={e => (e.target.style.borderColor = errors.username ? '#fca5a5' : 'var(--border)')}
              />
            </Field>

            {/* Email */}
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                maxLength={200}
                style={inputStyle(!!errors.email)}
                onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                onBlur={e => (e.target.style.borderColor = errors.email ? '#fca5a5' : 'var(--border)')}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    disabled={isLoading}
                    maxLength={100}
                    style={{ ...inputStyle(!!errors.password), paddingRight: '40px' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                    onBlur={e => (e.target.style.borderColor = errors.password ? '#fca5a5' : 'var(--border)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {/* Password strength bar */}
                <PasswordStrength password={form.password} />
              </div>
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password" error={errors.confirmPassword}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConf ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  maxLength={100}
                  style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: '40px' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                  onBlur={e => (e.target.style.borderColor = errors.confirmPassword ? '#fca5a5' : 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(v => !v)}
                  aria-label={showConf ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <EyeIcon open={showConf} />
                </button>
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
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
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              )}
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Login link */}
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--gem-500)', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign in
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