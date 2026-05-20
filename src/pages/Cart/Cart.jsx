import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(price)
}

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
const fullUrl = (path) => (!path ? null : path.startsWith('http') ? path : `${API_ORIGIN}${path}`)

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

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
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

// ─────────────────────────────────────────────
// Single cart row
// ─────────────────────────────────────────────

function CartRow({ item, onRemove, onQuantityChange }) {
  const [imgError,       setImgError]       = useState(false)
  const [confirmRemove,  setConfirmRemove]  = useState(false)

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
      transition: 'border-color 0.15s',
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
            <img
              src={thumbnailSrc}
              alt={item.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" opacity="0.3">
                <polygon points="16,2 30,12 24,30 8,30 2,12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        {/* Type badge */}
        {item.gemType && (
          <span style={{
            fontSize: '10px', fontWeight: 500,
            padding: '1px 8px', borderRadius: '99px',
            background: 'var(--gem-50)',
            color: 'var(--gem-500)',
            border: '1px solid var(--gem-200)',
            display: 'inline-block',
            marginBottom: '4px',
          }}>
            {item.gemType}
          </span>
        )}

        {/* Name */}
        <Link
          to={`/gemstones/${item.id}`}
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontSize: '17px', fontWeight: 500,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gem-500)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        >
          {item.name}
        </Link>

        {/* Specs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
          {item.weightInCarats && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {item.weightInCarats} ct
            </span>
          )}
          {item.color && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {item.color}
            </span>
          )}
          {item.shape && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {item.shape}
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {item.sku}
          </span>
        </div>

        {/* Quantity control + unit price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>

          {/* Quantity stepper */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            background: 'var(--surface-1)',
          }}>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              title="Decrease quantity"
              style={{
                width: '28px', height: '28px',
                background: 'none', border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <MinusIcon />
            </button>

            <span style={{
              minWidth: '28px', textAlign: 'center',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--text-primary)',
              padding: '0 4px',
            }}>
              {item.quantity}
            </span>

            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              title="Increase quantity"
              style={{
                width: '28px', height: '28px',
                background: 'none', border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <PlusIcon />
            </button>
          </div>

          {/* Unit price */}
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {formatPrice(item.price)} each
          </span>
        </div>
      </div>

      {/* Right: line total + remove */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', gap: '10px',
        flexShrink: 0,
      }}>
        {/* Line total */}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px', fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}>
          {formatPrice(lineTotal)}
        </span>

        {/* Remove — two-step confirm */}
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            title="Remove from cart"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'none', border: 'none',
              cursor: 'pointer',
              fontSize: '12px', color: 'var(--text-muted)',
              padding: '4px', borderRadius: 'var(--radius-sm)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e03131')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <TrashIcon /> Remove
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#e03131' }}>Remove?</span>
            <button
              onClick={() => onRemove(item.id)}
              style={{ padding:'3px 8px',fontSize:'11px',fontWeight:600,background:'#e03131',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer' }}
            >Yes</button>
            <button
              onClick={() => setConfirmRemove(false)}
              style={{ padding:'3px 8px',fontSize:'11px',background:'var(--surface-2)',color:'var(--text-secondary)',border:'1px solid var(--border)',borderRadius:'4px',cursor:'pointer' }}
            >No</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Order summary sidebar
// ─────────────────────────────────────────────

function OrderSummary({ items, cartTotal, onClear }) {
  const [ordered,      setOrdered]      = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const tax          = cartTotal * 0.08   // 8% illustrative tax
  const grandTotal   = cartTotal + tax

  const handleOrder = () => {
    // In a real app this would call an orders API.
    // For now we simulate success and clear the cart.
    setOrdered(true)
    onClear()
  }

  if (ordered) {
    return (
      <div style={{
        background: 'var(--surface-0)',
        border: '1px solid var(--gem-300)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--gem-50)',
          border: '2px solid var(--gem-300)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gem-500)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)' }}>
          Order placed!
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Thank you for your enquiry. Our team will contact you shortly.
        </p>
        <Link
          to="/"
          style={{
            marginTop: '8px',
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gem-500)', color: '#fff',
            textDecoration: 'none', fontSize: '14px', fontWeight: 500,
          }}
        >
          Continue browsing
        </Link>
      </div>
    )
  }

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
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Order summary
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{
                fontSize: '13px', color: 'var(--text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
              }}>
                {item.name}
                {item.quantity > 1 && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>×{item.quantity}</span>
                )}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, flexShrink: 0 }}>
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 0 14px' }} />

        {/* Subtotal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Subtotal</span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {formatPrice(cartTotal)}
          </span>
        </div>

        {/* Tax */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Est. tax (8%)</span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {formatPrice(tax)}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 0 14px' }} />

        {/* Grand total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px', fontWeight: 600,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
          }}>
            {formatPrice(grandTotal)}
          </span>
        </div>

        {/* Place order button */}
        <button
          onClick={handleOrder}
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

        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
          This sends an enquiry to our team. Not a final purchase.
        </p>

        {/* Clear cart */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e03131')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Clear cart
            </button>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#e03131' }}>Clear all items?</span>
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
// Empty cart state
// ─────────────────────────────────────────────

function EmptyCart() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', gap: '16px',
      color: 'var(--text-muted)',
      gridColumn: '1 / -1',
    }}>
      <CartEmptyIcon />
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px', fontWeight: 500,
          color: 'var(--text-secondary)', marginBottom: '8px',
        }}>
          Your cart is empty
        </p>
        <p style={{ fontSize: '14px' }}>
          Browse the catalog and add gemstones you love.
        </p>
      </div>
      <Link
        to="/"
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gem-500)', color: '#fff',
          textDecoration: 'none', fontSize: '14px', fontWeight: 500,
          transition: 'background 0.15s',
        }}
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

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
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

        <p style={{ fontSize:'12px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gold-500)',fontWeight:500,marginBottom:'6px' }}>
          Your selection
        </p>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'34px',fontWeight:500,color:'var(--text-primary)',letterSpacing:'-0.01em',lineHeight:1.1 }}>
          Cart
        </h1>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 320px',
          gap: '28px',
          alignItems: 'start',
        }}
        className="cart-grid"
        >
          {/* Left: cart rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => (
              <CartRow
                key={item.id}
                item={item}
                onRemove={removeFromCart}
                onQuantityChange={updateQuantity}
              />
            ))}

            {/* Continue shopping link */}
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: 'var(--gem-500)',
                textDecoration: 'none', fontWeight: 500,
                padding: '8px 0', width: 'fit-content',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
              </svg>
              Continue browsing
            </Link>
          </div>

          {/* Right: order summary */}
          <OrderSummary
            items={items}
            cartTotal={cartTotal}
            onClear={clearCart}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @media(max-width:768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:480px) {
          .cart-grid > div:first-child > div { grid-template-columns: 64px 1fr !important; }
        }
      `}</style>
    </div>
  )
}