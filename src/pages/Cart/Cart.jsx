import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { useCart } from '../../context/CartContext'
import { generateOrderPDF, downloadPDF } from '../../utils/generateOrderPDF'

// ─────────────────────────────────────────────
// EmailJS credentials from your .env file
// ─────────────────────────────────────────────

const EJ_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EJ_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EJ_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(price)
}

function generateRef() {
  // e.g. GV-20250524-4821
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `GV-${date}-${rand}`
}

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
const fullUrl    = (path) => (!path ? null : path.startsWith('http') ? path : `${API_ORIGIN}${path}`)

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function PlusSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function CartEmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25">
      <circle cx="9"  cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Cart row — single item
// ─────────────────────────────────────────────

function CartRow({ item, onRemove, onQuantityChange }) {
  const [imgError,      setImgError]      = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const thumbnailSrc = fullUrl(item.thumbnailUrl)
  const lineTotal    = item.price * item.quantity

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr auto',
      gap: '16px',
      alignItems: 'center',
      padding: '16px',
      background: 'var(--surface-0)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
    }}>

      {/* Thumbnail */}
      <Link to={`/gemstones/${item.id}`} style={{ flexShrink: 0 }}>
        <div style={{
          width: '80px', height: '80px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
        }}>
          {thumbnailSrc && !imgError ? (
            <img src={thumbnailSrc} alt={item.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" opacity="0.3">
                <polygon points="16,2 30,12 24,30 8,30 2,12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        {item.gemType && (
          <span style={{
            fontSize:'10px', fontWeight:500,
            padding:'1px 8px', borderRadius:'99px',
            background:'var(--gem-50)', color:'var(--gem-500)',
            border:'1px solid var(--gem-200)',
            display:'inline-block', marginBottom:'4px',
          }}>
            {item.gemType}
          </span>
        )}
        <Link to={`/gemstones/${item.id}`} style={{
          display:'block', fontFamily:'var(--font-display)',
          fontSize:'17px', fontWeight:500, color:'var(--text-primary)',
          textDecoration:'none', lineHeight:1.3,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          transition:'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gem-500)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        >
          {item.name}
        </Link>
        <div style={{ display:'flex',gap:'10px',marginTop:'3px',flexWrap:'wrap' }}>
          {item.weightInCarats && <span style={{ fontSize:'12px',color:'var(--text-muted)' }}>{item.weightInCarats} ct</span>}
          {item.color          && <span style={{ fontSize:'12px',color:'var(--text-muted)' }}>{item.color}</span>}
          {item.shape          && <span style={{ fontSize:'12px',color:'var(--text-muted)' }}>{item.shape}</span>}
          <span style={{ fontSize:'11px',color:'var(--text-muted)',fontFamily:'monospace' }}>{item.sku}</span>
        </div>

        {/* Quantity stepper */}
        <div style={{ display:'flex',alignItems:'center',gap:'12px',marginTop:'10px',flexWrap:'wrap' }}>
          <div style={{
            display:'flex', alignItems:'center',
            border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)',
            overflow:'hidden', background:'var(--surface-1)',
          }}>
            <button onClick={() => onQuantityChange(item.id, item.quantity - 1)} title="Decrease"
              style={{ width:'28px',height:'28px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)',transition:'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <MinusIcon />
            </button>
            <span style={{ minWidth:'28px',textAlign:'center',fontSize:'13px',fontWeight:600,color:'var(--text-primary)',padding:'0 4px' }}>
              {item.quantity}
            </span>
            <button onClick={() => onQuantityChange(item.id, item.quantity + 1)} title="Increase"
              style={{ width:'28px',height:'28px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)',transition:'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <PlusSmIcon />
            </button>
          </div>
          <span style={{ fontSize:'13px',color:'var(--text-muted)' }}>{formatPrice(item.price)} each</span>
        </div>
      </div>

      {/* Line total + remove */}
      <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'10px',flexShrink:0 }}>
        <span style={{ fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.01em',whiteSpace:'nowrap' }}>
          {formatPrice(lineTotal)}
        </span>
        {!confirmRemove ? (
          <button onClick={() => setConfirmRemove(true)} title="Remove"
            style={{ display:'flex',alignItems:'center',gap:'5px',background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'var(--text-muted)',padding:'4px',borderRadius:'var(--radius-sm)',transition:'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e03131')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <TrashIcon /> Remove
          </button>
        ) : (
          <div style={{ display:'flex',gap:'4px',alignItems:'center' }}>
            <span style={{ fontSize:'11px',color:'#e03131' }}>Remove?</span>
            <button onClick={() => onRemove(item.id)} style={{ padding:'3px 8px',fontSize:'11px',fontWeight:600,background:'#e03131',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer' }}>Yes</button>
            <button onClick={() => setConfirmRemove(false)} style={{ padding:'3px 8px',fontSize:'11px',background:'var(--surface-2)',color:'var(--text-secondary)',border:'1px solid var(--border)',borderRadius:'4px',cursor:'pointer' }}>No</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Enquiry form modal
// Shown when user clicks "Place enquiry"
// Collects: fullName (required), phone (required),
//           address (required), email (optional),
//           notes (optional)
// ─────────────────────────────────────────────

function EnquiryModal({ items, subtotal, tax, grandTotal, onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: '', phone: '', address: '', email: '', notes: '',
  })
  const [errors,    setErrors]    = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError,  setApiError]  = useState('')

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    setApiError('')
  }

  // ── Validate ──────────────────────────────
  function validate() {
    const errs = {}
    if (!form.fullName.trim())  errs.fullName = 'Full name is required'
    if (!form.phone.trim())     errs.phone    = 'Phone number is required'
    else if (!/^[+\d\s\-()]{7,20}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid phone number'
    if (!form.address.trim())   errs.address  = 'Address is required'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = 'Enter a valid email address'
    return errs
  }

  // ── Build order_summary string for EmailJS template ──
  function buildOrderSummary() {
    const lines = items.map(item =>
      `• ${item.name} (${item.gemType || 'Gemstone'})` +
      `\n  SKU: ${item.sku}` +
      (item.weightInCarats ? `  |  Weight: ${item.weightInCarats} ct` : '') +
      (item.color  ? `  |  Color: ${item.color}`  : '') +
      (item.shape  ? `  |  Shape: ${item.shape}`  : '') +
      `\n  Qty: ${item.quantity}  ×  ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`
    )
    return (
      lines.join('\n\n') +
      `\n\n─────────────────────────\n` +
      `Subtotal : ${formatPrice(subtotal)}\n` +
      `Tax (8%) : ${formatPrice(tax)}\n` +
      `TOTAL    : ${formatPrice(grandTotal)}`
    )
  }

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsLoading(true)
    setApiError('')

    const orderRef = generateRef()

    // ── 1. Generate PDF ──────────────────────
    let pdfResult = null
    try {
      pdfResult = generateOrderPDF({
        customer: form,
        items,
        totals:   { subtotal, tax, grandTotal },
        orderRef,
      })
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr)
      // Non-fatal — continue without PDF
    }

    // ── 2. Send email via EmailJS ────────────
    // Template variables match your EmailJS template exactly:
    //   {{customer_name}}   {{customer_phone}}
    //   {{customer_address}} {{customer_email}}
    //   {{order_summary}}   {{order_total}}
    //   {{order_date}}      {{order_ref}}

    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    const templateParams = {
      customer_name:    form.fullName.trim(),
      customer_phone:   form.phone.trim(),
      customer_address: form.address.trim(),
      customer_email:   form.email.trim() || 'Not provided',
      order_summary:    buildOrderSummary(),
      order_total:      formatPrice(grandTotal),
      order_date:       orderDate,
      order_ref:        orderRef,
      // Optional: if your EmailJS template supports notes
      customer_notes:   form.notes.trim() || 'None',
    }

    try {
      // EmailJS sends to ALL recipients configured in your template.
      // Make sure both sattimohsin418@gmail.com and
      // sattimohsinmurtaza@gmail.com are set as recipients
      // in your EmailJS template settings (To Email field).
      await emailjs.send(EJ_SERVICE, EJ_TEMPLATE, templateParams, EJ_KEY)

      // ── 3. Trigger success ───────────────────
      onSuccess({ orderRef, pdfResult })

    } catch (err) {
      console.error('EmailJS error:', err)
      setApiError(
        'Failed to send enquiry. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ── Field component ───────────────────────
  const Field = ({ label, required, error, children }) => (
    <div style={{ display:'flex',flexDirection:'column',gap:'5px' }}>
      <label style={{ fontSize:'13px',fontWeight:500,color:error?'#c92a2a':'var(--text-secondary)' }}>
        {label}
        {required && <span style={{ color:'var(--gold-500)',marginLeft:'3px' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize:'11.5px',color:'#c92a2a' }}>{error}</span>}
    </div>
  )

  const inputStyle = (hasError) => ({
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${hasError ? '#fca5a5' : 'var(--border)'}`,
    background: 'var(--surface-0)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  })

  return (
    // Backdrop
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--surface-0)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modalIn 0.2s ease',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0,
          background: 'var(--surface-0)',
          zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:500,color:'var(--text-primary)' }}>
              Place enquiry
            </h2>
            <p style={{ fontSize:'13px',color:'var(--text-muted)',marginTop:'2px' }}>
              Fill in your details and we will contact you to confirm
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'22px',lineHeight:1,padding:'4px',borderRadius:'var(--radius-sm)',transition:'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ×
          </button>
        </div>

        {/* Notice banner */}
        <div style={{
          margin: '16px 24px 0',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gem-50)',
          border: '1px solid var(--gem-200)',
          fontSize: '13px',
          color: 'var(--gem-500)',
          lineHeight: 1.6,
        }}>
          <strong>How it works:</strong> After you submit this form, our team will
          receive your enquiry with full order details. We will contact you within
          24–48 hours to confirm availability and arrange payment.
          A PDF receipt will be downloaded to your device automatically.
        </div>

        {/* API error */}
        {apiError && (
          <div style={{
            margin: '12px 24px 0',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: '#fff1f2',
            border: '1px solid #fca5a5',
            color: '#c92a2a',
            fontSize: '13.5px',
            display: 'flex', gap: '8px', alignItems: 'flex-start',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0,marginTop:'1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {apiError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ padding: '20px 24px 24px', display:'flex',flexDirection:'column',gap:'16px' }}
        >

          {/* Full name */}
          <Field label="Full name" required error={errors.fullName}>
            <input
              type="text"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="e.g. Ahmed Khan"
              autoFocus
              disabled={isLoading}
              style={inputStyle(!!errors.fullName)}
              onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
              onBlur={e  => (e.target.style.borderColor = errors.fullName ? '#fca5a5' : 'var(--border)')}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone number" required error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="e.g. +92 300 1234567"
              disabled={isLoading}
              style={inputStyle(!!errors.phone)}
              onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
              onBlur={e  => (e.target.style.borderColor = errors.phone ? '#fca5a5' : 'var(--border)')}
            />
          </Field>

          {/* Address */}
          <Field label="Delivery address" required error={errors.address}>
            <textarea
              value={form.address}
              onChange={set('address')}
              placeholder="Street, city, country"
              disabled={isLoading}
              rows={3}
              style={{
                ...inputStyle(!!errors.address),
                resize: 'vertical',
                minHeight: '80px',
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
              onBlur={e  => (e.target.style.borderColor = errors.address ? '#fca5a5' : 'var(--border)')}
            />
          </Field>

          {/* Email — optional */}
          <Field label="Email address" error={errors.email}>
            <div style={{ position:'relative' }}>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="Optional — for order updates"
                disabled={isLoading}
                style={inputStyle(!!errors.email)}
                onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
                onBlur={e  => (e.target.style.borderColor = errors.email ? '#fca5a5' : 'var(--border)')}
              />
              <span style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                background: 'var(--surface-2)',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                optional
              </span>
            </div>
          </Field>

          {/* Notes — optional */}
          <Field label="Additional notes">
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Any special requests or questions…"
              disabled={isLoading}
              rows={2}
              style={{
                ...inputStyle(false),
                resize: 'vertical',
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--gem-300)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
            />
          </Field>

          {/* Order total preview */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize:'13px',color:'var(--text-secondary)' }}>
              Order total ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
            <span style={{ fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:600,color:'var(--text-primary)' }}>
              {formatPrice(grandTotal)}
            </span>
          </div>

          {/* Required fields note */}
          <p style={{ fontSize:'12px',color:'var(--text-muted)',marginTop:'-4px' }}>
            Fields marked <span style={{ color:'var(--gold-500)' }}>*</span> are required
          </p>

          {/* Action buttons */}
          <div style={{ display:'flex',gap:'10px',marginTop:'4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1, padding: '11px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-0)',
                color: 'var(--text-secondary)',
                fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--surface-2)'; e.currentTarget.style.color='var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--surface-0)'; e.currentTarget.style.color='var(--text-secondary)' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 2, padding: '11px',
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Sending enquiry…
                </>
              ) : (
                'Confirm & send enquiry'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Success screen — shown after order is placed
// ─────────────────────────────────────────────

function SuccessScreen({ orderRef, pdfResult, onDownload }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', gap: '20px',
      textAlign: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Checkmark circle */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'var(--gem-50)',
        border: '2px solid var(--gem-300)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gem-500)" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>

      <div>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:'28px',fontWeight:500,color:'var(--text-primary)',marginBottom:'8px' }}>
          Enquiry sent!
        </h2>
        <p style={{ fontSize:'14px',color:'var(--text-muted)',lineHeight:1.7,maxWidth:'400px' }}>
          Your enquiry has been received by our team. We will contact you
          within 24–48 hours to confirm availability and arrange payment.
        </p>
      </div>

      {/* Order reference */}
      <div style={{
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize:'12px',color:'var(--text-muted)',marginBottom:'2px' }}>Order reference</p>
        <p style={{ fontSize:'16px',fontWeight:700,color:'var(--text-primary)',fontFamily:'monospace',letterSpacing:'0.04em' }}>
          {orderRef}
        </p>
      </div>

      {/* Download PDF button */}
      {pdfResult && (
        <button
          onClick={onDownload}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 22px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gem-300)',
            background: 'var(--gem-50)',
            color: 'var(--gem-500)',
            fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--gem-100,#c4ddd3)'; e.currentTarget.style.borderColor='var(--gem-400)' }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--gem-50)'; e.currentTarget.style.borderColor='var(--gem-300)' }}
        >
          <DownloadIcon />
          Download PDF receipt
        </button>
      )}

      <Link
        to="/"
        style={{
          marginTop: '4px',
          padding: '10px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gem-500)', color: '#fff',
          textDecoration: 'none', fontSize: '14px', fontWeight: 500,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gem-400)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--gem-500)')}
      >
        Continue browsing
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────
// Order summary sidebar
// ─────────────────────────────────────────────

function OrderSummary({ items, cartTotal, onPlaceEnquiry, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false)

  const tax        = cartTotal * 0.08
  const grandTotal = cartTotal + tax

  return (
    <div style={{
      background: 'var(--surface-0)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      position: 'sticky',
      top: 'calc(var(--nav-height) + 24px)',
    }}>
      {/* Header */}
      <div style={{ padding:'16px 20px',borderBottom:'1px solid var(--border)',background:'var(--surface-1)' }}>
        <p style={{ fontSize:'15px',fontWeight:600,color:'var(--text-primary)' }}>Order summary</p>
        <p style={{ fontSize:'12px',color:'var(--text-muted)',marginTop:'2px' }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ padding:'20px' }}>

        {/* Line items */}
        <div style={{ display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display:'flex',justifyContent:'space-between',gap:'12px' }}>
              <span style={{ fontSize:'13px',color:'var(--text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>
                {item.name}
                {item.quantity > 1 && <span style={{ color:'var(--text-muted)',marginLeft:'4px' }}>×{item.quantity}</span>}
              </span>
              <span style={{ fontSize:'13px',color:'var(--text-primary)',fontWeight:500,flexShrink:0 }}>
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div style={{ height:'1px',background:'var(--border)',margin:'0 0 14px' }} />

        {/* Subtotal */}
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'8px' }}>
          <span style={{ fontSize:'13px',color:'var(--text-muted)' }}>Subtotal</span>
          <span style={{ fontSize:'13px',color:'var(--text-primary)',fontWeight:500 }}>{formatPrice(cartTotal)}</span>
        </div>

        {/* Tax */}
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'14px' }}>
          <span style={{ fontSize:'13px',color:'var(--text-muted)' }}>Est. tax (8%)</span>
          <span style={{ fontSize:'13px',color:'var(--text-primary)',fontWeight:500 }}>{formatPrice(tax)}</span>
        </div>

        <div style={{ height:'1px',background:'var(--border)',margin:'0 0 14px' }} />

        {/* Grand total */}
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'20px' }}>
          <span style={{ fontSize:'15px',fontWeight:600,color:'var(--text-primary)' }}>Total</span>
          <span style={{ fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.01em' }}>
            {formatPrice(grandTotal)}
          </span>
        </div>

        {/* Place enquiry button */}
        <button
          onClick={() => onPlaceEnquiry(tax, grandTotal)}
          style={{
            width: '100%', padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gem-500)', color: '#fff',
            border: 'none', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--gem-400)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--gem-500)')}
        >
          Place enquiry
        </button>

        <p style={{ fontSize:'11.5px',color:'var(--text-muted)',textAlign:'center',marginTop:'10px',lineHeight:1.5 }}>
          Not a final purchase — our team will confirm with you.
        </p>

        {/* Clear cart */}
        <div style={{ marginTop:'16px',textAlign:'center' }}>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              style={{ background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'var(--text-muted)',transition:'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e03131')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Clear cart
            </button>
          ) : (
            <div style={{ display:'flex',justifyContent:'center',alignItems:'center',gap:'8px' }}>
              <span style={{ fontSize:'12px',color:'#e03131' }}>Clear all?</span>
              <button onClick={() => { onClear(); setConfirmClear(false) }} style={{ padding:'3px 10px',fontSize:'11px',fontWeight:600,background:'#e03131',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer' }}>Yes</button>
              <button onClick={() => setConfirmClear(false)} style={{ padding:'3px 10px',fontSize:'11px',background:'var(--surface-2)',color:'var(--text-secondary)',border:'1px solid var(--border)',borderRadius:'4px',cursor:'pointer' }}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Empty cart
// ─────────────────────────────────────────────

function EmptyCart() {
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 24px',gap:'16px',color:'var(--text-muted)' }}>
      <CartEmptyIcon />
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:500,color:'var(--text-secondary)',marginBottom:'8px' }}>
          Your cart is empty
        </p>
        <p style={{ fontSize:'14px' }}>Browse the catalog and add gemstones you love.</p>
      </div>
      <Link
        to="/"
        style={{ marginTop:'8px',padding:'10px 24px',borderRadius:'var(--radius-md)',background:'var(--gem-500)',color:'#fff',textDecoration:'none',fontSize:'14px',fontWeight:500,transition:'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gem-400)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--gem-500)')}
      >
        Browse gemstones
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function Cart() {
  const navigate = useNavigate()
  const { items, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()

  // Modal state
  const [showModal, setShowModal] = useState(false)

  // After order placed successfully
  const [orderResult, setOrderResult] = useState(null)
  // { orderRef: 'GV-...', pdfResult: {...} }

  // Tax and grand total — calculated when modal opens
  const [tax,        setTax]        = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)

  const handlePlaceEnquiry = (taxAmt, grandAmt) => {
    setTax(taxAmt)
    setGrandTotal(grandAmt)
    setShowModal(true)
  }

  const handleSuccess = ({ orderRef, pdfResult }) => {
    setShowModal(false)
    clearCart()
    setOrderResult({ orderRef, pdfResult })
  }

  const handleDownloadPDF = () => {
    if (orderResult?.pdfResult) {
      downloadPDF(orderResult.pdfResult)
    }
  }

  // Show success screen after order
  if (orderResult) {
    return (
      <div style={{ animation:'fadeIn 0.3s ease' }}>
        <button
          onClick={() => navigate('/')}
          style={{ display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,padding:'6px 0',marginBottom:'16px',transition:'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
          </svg>
          Back to catalog
        </button>
        <SuccessScreen
          orderRef={orderResult.orderRef}
          pdfResult={orderResult.pdfResult}
          onDownload={handleDownloadPDF}
        />
      </div>
    )
  }

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>

      {/* Page header */}
      <div style={{ marginBottom:'28px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,padding:'6px 0',marginBottom:'16px',transition:'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
          </svg>
          Back
        </button>
        <p style={{ fontSize:'12px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gold-500)',fontWeight:500,marginBottom:'6px' }}>Your selection</p>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'34px',fontWeight:500,color:'var(--text-primary)',letterSpacing:'-0.01em',lineHeight:1.1 }}>Cart</h1>
        {items.length > 0 && (
          <p style={{ fontSize:'14px',color:'var(--text-muted)',marginTop:'6px' }}>
            {items.length} item{items.length !== 1 ? 's' : ''} · {formatPrice(cartTotal)}
          </p>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:'28px',alignItems:'start' }} className="cart-grid">

          {/* Cart rows */}
          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
            {items.map(item => (
              <CartRow
                key={item.id}
                item={item}
                onRemove={removeFromCart}
                onQuantityChange={updateQuantity}
              />
            ))}
            <Link to="/" style={{ display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'var(--gem-500)',textDecoration:'none',fontWeight:500,padding:'8px 0',width:'fit-content',transition:'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
              </svg>
              Continue browsing
            </Link>
          </div>

          {/* Summary sidebar */}
          <OrderSummary
            items={items}
            cartTotal={cartTotal}
            onPlaceEnquiry={handlePlaceEnquiry}
            onClear={clearCart}
          />
        </div>
      )}

      {/* Enquiry modal */}
      {showModal && (
        <EnquiryModal
          items={items}
          subtotal={cartTotal}
          tax={tax}
          grandTotal={grandTotal}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);} }
        @media(max-width:768px){ .cart-grid{ grid-template-columns:1fr !important; } }
        @media(max-width:480px){ .cart-grid>div:first-child>div{ grid-template-columns:64px 1fr !important; } }
      `}</style>
    </div>
  )
}