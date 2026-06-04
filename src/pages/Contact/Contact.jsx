import { useState } from 'react'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'

// ─────────────────────────────────────────────
// EmailJS — reuse same service, separate template
// ─────────────────────────────────────────────

const EJ_SERVICE          = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EJ_CONTACT_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID
const EJ_KEY              = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function validate(form) {
  const errs = {}
  if (!form.name.trim())
    errs.name = 'Please enter your name'
  if (!form.phone.trim())
    errs.phone = 'Please enter your phone number'
  else if (!/^[+\d\s\-()]{7,20}$/.test(form.phone.trim()))
    errs.phone = 'Please enter a valid phone number'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errs.email = 'Please enter a valid email address'
  if (!form.message.trim())
    errs.message = 'Please write your message'
  else if (form.message.trim().length < 10)
    errs.message = 'Message is too short'
  return errs
}

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.27 6.27l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Contact info card
// ─────────────────────────────────────────────

function InfoCard({ icon, label, value, href, extra }) {
  const content = (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '18px 20px',
      background: 'var(--surface-0)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      textDecoration: 'none',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--gem-300)'
      e.currentTarget.style.boxShadow   = 'var(--shadow-sm)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.boxShadow   = 'none'
    }}
    >
      {/* Icon circle */}
      <div style={{
        width: '40px', height: '40px',
        borderRadius: '50%',
        background: 'var(--gem-50)',
        border: '1px solid var(--gem-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--gem-500)',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
          {label}
        </p>
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {value}
        </p>
        {extra && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {extra}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>{content}</a>
  }
  return content
}

// ─────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{
        fontSize: '13px', fontWeight: 500,
        color: error ? '#c92a2a' : 'var(--text-secondary)',
      }}>
        {label}
        {required && <span style={{ color: 'var(--gold-500)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: '11.5px', color: '#c92a2a' }}>{error}</span>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const INITIAL = { name: '', phone: '', email: '', message: '' }

export default function Contact() {
  const [form,      setForm]      = useState(INITIAL)
  const [errors,    setErrors]    = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [success,   setSuccess]   = useState(false)

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setApiError('')
    if (submitted) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const inputStyle = (hasError) => ({
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${hasError ? '#fca5a5' : 'var(--border)'}`,
    background: 'var(--surface-0)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setApiError('')

    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsLoading(true)
    try {
      await emailjs.send(
        EJ_SERVICE,
        EJ_CONTACT_TEMPLATE,
        {
          from_name:  form.name.trim(),
          from_phone: form.phone.trim(),
          from_email: form.email.trim() || 'Not provided',
          message:    form.message.trim(),
          sent_at:    new Date().toLocaleString('en-PK', {
            timeZone: 'Asia/Karachi',
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
        },
        EJ_KEY
      )
      setSuccess(true)
      setForm(INITIAL)
      setSubmitted(false)
    } catch (err) {
      console.error('EmailJS contact error:', err)
      setApiError('Could not send your message. Please try calling or WhatsApp instead.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Page heading */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{
          fontSize: '12px', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gold-500)',
          fontWeight: 500, marginBottom: '6px',
        }}>
          Get in touch
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px', fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em', lineHeight: 1.1,
          marginBottom: '10px',
        }}>
          Contact Us
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '540px' }}>
          Visit us at our Rawalpindi store, call us directly, or send a message
          below. We will get back to you as soon as possible.
        </p>
      </div>

      {/* Two column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: '40px',
        alignItems: 'start',
      }}
      className="contact-grid"
      >

        {/* ── Left: Contact info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <InfoCard
            icon={<PhoneIcon />}
            label="Phone / WhatsApp"
            value="0323 731 3160"
            href="https://wa.me/923237313160"
            extra="Tap to open WhatsApp"
          />

          <InfoCard
            icon={<MailIcon />}
            label="Email"
            value="gmsatti72@gmail.com"
            href="mailto:gmsatti72@gmail.com"
            extra="We reply within 24 hours"
          />

          <InfoCard
            icon={<LocationIcon />}
            label="Our Store"
            value="Chandni Chowk, Rawalpindi"
            href="https://maps.google.com/?q=Chandni+Chowk+Rawalpindi"
            extra="Tap to open in Google Maps"
          />

          <InfoCard
            icon={<ClockIcon />}
            label="Store Hours"
            value="Mon – Sat: 10am – 8pm"
            extra="Sunday: 12pm – 6pm (PKT)"
          />

          {/* WhatsApp quick button */}
          <a
            href="https://wa.me/923237313160"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              background: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px', fontWeight: 600,
              transition: 'opacity 0.15s, transform 0.15s',
              marginTop: '4px',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <WhatsAppIcon />
            Chat on WhatsApp
          </a>

          {/* Map embed */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            height: '200px',
            marginTop: '4px',
          }}>
            <iframe
              title="GMSTONES location — Chandni Chowk Rawalpindi"
              src="https://maps.google.com/maps?q=Chandni+Chowk+Rawalpindi+Pakistan&output=embed&z=15"
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* ── Right: Contact form ── */}
        <div style={{
          background: 'var(--surface-0)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-1)',
          }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              Send us a message
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              We will respond within 24 hours
            </p>
          </div>

          <div style={{ padding: '24px' }}>

            {/* Success state */}
            {success ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '14px',
                padding: '32px 16px', textAlign: 'center',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gem-50)',
                  border: '2px solid var(--gem-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gem-500)" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Message sent!
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Thank you for reaching out. We will contact you shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  style={{
                    marginTop: '8px', padding: '9px 22px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gem-500)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontSize: '14px', fontWeight: 500,
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* API error */}
                {apiError && (
                  <div style={{
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#fff1f2',
                    border: '1px solid #fca5a5',
                    color: '#c92a2a',
                    fontSize: '13.5px',
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {apiError}
                  </div>
                )}

                {/* Name */}
                <Field label="Your name" required error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Ahmed Khan"
                    autoComplete="name"
                    disabled={isLoading}
                    style={inputStyle(!!errors.name)}
                    onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                    onBlur={e  => (e.target.style.borderColor = errors.name ? '#fca5a5' : 'var(--border)')}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone number" required error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="e.g. 0323 731 3160"
                    autoComplete="tel"
                    disabled={isLoading}
                    style={inputStyle(!!errors.phone)}
                    onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                    onBlur={e  => (e.target.style.borderColor = errors.phone ? '#fca5a5' : 'var(--border)')}
                  />
                </Field>

                {/* Email — optional */}
                <Field label="Email address" error={errors.email}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="Optional"
                      autoComplete="email"
                      disabled={isLoading}
                      style={inputStyle(!!errors.email)}
                      onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                      onBlur={e  => (e.target.style.borderColor = errors.email ? '#fca5a5' : 'var(--border)')}
                    />
                    <span style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '10px', color: 'var(--text-muted)',
                      background: 'var(--surface-2)',
                      padding: '1px 6px', borderRadius: '4px',
                      pointerEvents: 'none',
                    }}>
                      optional
                    </span>
                  </div>
                </Field>

                {/* Message */}
                <Field label="Your message" required error={errors.message}>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us which gemstone you are interested in, or ask any question…"
                    disabled={isLoading}
                    rows={4}
                    style={{
                      ...inputStyle(!!errors.message),
                      resize: 'vertical',
                      minHeight: '100px',
                      lineHeight: 1.6,
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                    onBlur={e  => (e.target.style.borderColor = errors.message ? '#fca5a5' : 'var(--border)')}
                  />
                </Field>

                {/* Required note */}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-4px' }}>
                  Fields marked <span style={{ color: 'var(--gold-500)' }}>*</span> are required
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '12px',
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
                  {isLoading ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Sending…
                    </>
                  ) : 'Send message'}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin   { to{transform:rotate(360deg);} }
        @media(max-width:720px){
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}