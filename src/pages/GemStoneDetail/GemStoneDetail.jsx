import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGemStone, useDeleteGemStone, useRestoreGemStone } from '../../hooks/useGemStones'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
const fullUrl = (path) => (!path ? null : path.startsWith('http') ? path : `${API_ORIGIN}${path}`)

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      style={{ display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,padding:'6px 0',marginBottom:'28px',transition:'color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
      </svg>
      Back to catalog
    </button>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Image gallery
// ─────────────────────────────────────────────

function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const thumbIdx = images.findIndex(img => img.isThumbnail)
    return thumbIdx >= 0 ? thumbIdx : 0
  })
  const [imgErrors, setImgErrors] = useState({})

  if (!images || images.length === 0) {
    return (
      <div style={{ height:'420px',borderRadius:'var(--radius-lg)',background:'var(--surface-2)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'12px',color:'var(--text-muted)',border:'1px solid var(--border)' }}>
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" opacity="0.3">
          <polygon points="16,2 30,12 24,30 8,30 2,12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <line x1="2" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="1"/>
        </svg>
        <span style={{ fontSize:'14px' }}>No images available</span>
      </div>
    )
  }

  const active    = images[activeIndex]
  const activeSrc = fullUrl(active?.imageUrl)

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>

      {/* Main image */}
      <div style={{ height:'420px',borderRadius:'var(--radius-lg)',overflow:'hidden',background:'var(--surface-2)',border:'1px solid var(--border)',position:'relative' }}>
        {activeSrc && !imgErrors[activeIndex] ? (
          <img
            src={activeSrc}
            alt={active.imageName || 'Gemstone image'}
            onError={() => setImgErrors(prev => ({ ...prev, [activeIndex]: true }))}
            style={{ width:'100%',height:'100%',objectFit:'contain',padding:'12px' }}
          />
        ) : (
          <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:'13px' }}>
            Image unavailable
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div style={{ position:'absolute',bottom:'12px',right:'12px',background:'rgba(0,0,0,0.55)',color:'#fff',fontSize:'12px',padding:'3px 10px',borderRadius:'99px',backdropFilter:'blur(4px)' }}>
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Cover badge */}
        {active.isThumbnail && (
          <div style={{ position:'absolute',top:'12px',left:'12px',background:'rgba(196,154,46,0.88)',color:'#fff',fontSize:'10px',fontWeight:600,padding:'3px 10px',borderRadius:'99px',letterSpacing:'0.06em',textTransform:'uppercase' }}>
            Cover
          </div>
        )}
      </div>

      {/* Thumbnail strip — shows all images */}
      {images.length > 1 && (
        <div style={{ display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px' }}>
          {images.map((img, idx) => {
            const src      = fullUrl(img.imageUrl)
            const isActive = idx === activeIndex
            return (
              <button
                key={img.id ?? idx}
                onClick={() => setActiveIndex(idx)}
                title={img.imageName || `Image ${idx + 1}`}
                style={{ flexShrink:0,width:'72px',height:'72px',borderRadius:'var(--radius-md)',overflow:'hidden',border:isActive?'2px solid var(--gem-400)':'2px solid var(--border)',background:'var(--surface-2)',cursor:'pointer',padding:0,transition:'border-color 0.15s',position:'relative' }}
              >
                {src && !imgErrors[idx] ? (
                  <img
                    src={src}
                    alt={img.imageName || `Image ${idx + 1}`}
                    onError={() => setImgErrors(prev => ({ ...prev, [idx]: true }))}
                    style={{ width:'100%',height:'100%',objectFit:'cover' }}
                  />
                ) : (
                  <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:'10px' }}>—</div>
                )}
                {/* Gold dot on thumbnail strip for cover image */}
                {img.isThumbnail && (
                  <div style={{ position:'absolute',bottom:'4px',right:'4px',width:'8px',height:'8px',borderRadius:'50%',background:'var(--gold-400)',border:'1px solid #fff' }} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Spec row
// ─────────────────────────────────────────────

function SpecRow({ label, value }) {
  if (!value && value !== 0 && value !== false) return null
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:'16px',padding:'10px 0',borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:'13px',color:'var(--text-muted)',flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:'14px',color:'var(--text-primary)',fontWeight:500,textAlign:'right' }}>{value}</span>
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <p style={{ fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gold-500)',fontWeight:600,marginBottom:'4px',marginTop:'24px' }}>
      {children}
    </p>
  )
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'48px' }} className="detail-grid">
      <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
        <div className="skeleton" style={{ height:'420px',borderRadius:'var(--radius-lg)' }} />
        <div style={{ display:'flex',gap:'8px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ width:'72px',height:'72px',borderRadius:'var(--radius-md)',flexShrink:0 }} />)}
        </div>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
        <div className="skeleton" style={{ height:'14px',width:'40%',borderRadius:'6px' }} />
        <div className="skeleton" style={{ height:'40px',width:'75%',borderRadius:'8px' }} />
        <div className="skeleton" style={{ height:'36px',width:'35%',borderRadius:'8px' }} />
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:'14px',borderRadius:'6px' }} />)}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function GemStoneDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const toast       = useToast()
  const { isAdmin } = useAuth()
  const { addToCart, isInCart, items } = useCart()

  const { data: gem, isLoading, isError, error } = useGemStone(Number(id))
  const deleteMutation  = useDeleteGemStone()
  const restoreMutation = useRestoreGemStone()

  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [addedFeedback,  setAddedFeedback]  = useState(false)

  // Current quantity in cart for this gem
  const cartItem      = items.find(i => i.id === Number(id))
  const inCart        = isInCart(Number(id))
  const cartQuantity  = cartItem?.quantity || 0

  const handleAddToCart = () => {
    if (inCart) { navigate('/cart'); return }
    addToCart(gem)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2500)
    toast.success(`${gem.name} added to cart`)
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(Number(id))
      toast.success('Gemstone archived successfully')
      navigate('/')
    } catch (e) { toast.error(e.message) }
  }

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync(Number(id))
      toast.success('Gemstone restored')
    } catch (e) { toast.error(e.message) }
  }

  if (isLoading) return <div><BackButton /><DetailSkeleton /></div>

  if (isError || !gem) {
    return (
      <div>
        <BackButton />
        <div style={{ padding:'20px',borderRadius:'var(--radius-md)',background:'#fff1f2',border:'1px solid #fca5a5',color:'#c92a2a',fontSize:'14px' }}>
          {error?.message || 'Gemstone not found.'}
        </div>
      </div>
    )
  }

  const images = gem.images || []

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <BackButton />

      {/* Archived warning */}
      {gem.isDeleted && (
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',flexWrap:'wrap',padding:'12px 18px',marginBottom:'24px',borderRadius:'var(--radius-md)',background:'#fff8e1',border:'1px solid #ffe082',color:'#7a5c10',fontSize:'14px' }}>
          <span>⚠️ This gemstone is archived and not visible in the catalog.</span>
          {isAdmin && (
            <button onClick={handleRestore} style={{ padding:'6px 16px',borderRadius:'var(--radius-sm)',background:'var(--gem-500)',color:'#fff',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:500 }}>
              Restore
            </button>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:'48px',alignItems:'start' }} className="detail-grid">

        {/* Left: gallery */}
        <ImageGallery images={images} />

        {/* Right: info */}
        <div>

          {/* Badges */}
          <div style={{ display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'10px' }}>
            <span style={{ fontSize:'11px',fontWeight:500,padding:'3px 12px',borderRadius:'99px',background:'var(--gem-50)',color:'var(--gem-500)',border:'1px solid var(--gem-200)' }}>
              {gem.gemType}
            </span>
            {gem.isNatural && (
              <span style={{ fontSize:'11px',fontWeight:500,padding:'3px 12px',borderRadius:'99px',background:'var(--gold-50)',color:'var(--gold-700)',border:'1px solid var(--gold-200)' }}>
                Natural
              </span>
            )}
            {!gem.isAvailable && (
              <span style={{ fontSize:'11px',fontWeight:500,padding:'3px 12px',borderRadius:'99px',background:'#f8f9fa',color:'#868e96',border:'1px solid #dee2e6' }}>
                Unavailable
              </span>
            )}
            {inCart && (
              <span style={{ fontSize:'11px',fontWeight:500,padding:'3px 12px',borderRadius:'99px',background:'var(--gold-50)',color:'var(--gold-700)',border:'1px solid var(--gold-300)' }}>
                ✓ In cart ×{cartQuantity}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:'34px',fontWeight:500,color:'var(--text-primary)',letterSpacing:'-0.01em',lineHeight:1.2,marginBottom:'6px' }}>
            {gem.name}
          </h1>

          {/* SKU */}
          <p style={{ fontSize:'12px',color:'var(--text-muted)',fontFamily:'monospace',marginBottom:'16px' }}>
            SKU: {gem.sku}
          </p>

          {/* Price */}
          <div style={{ marginBottom:'20px' }}>
            <span style={{ fontFamily:'var(--font-display)',fontSize:'38px',fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.02em' }}>
              {formatPrice(gem.price)}
            </span>
            {gem.stockQuantity > 0 && (
              <span style={{ fontSize:'13px',color:'var(--text-muted)',marginLeft:'12px' }}>
                {gem.stockQuantity} in stock
              </span>
            )}
          </div>

          {/* Certification */}
          {gem.certificationLab && (
            <div style={{ display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 14px',borderRadius:'var(--radius-md)',background:'var(--gold-50)',border:'1px solid var(--gold-200)',marginBottom:'20px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <span style={{ fontSize:'13px',color:'var(--gold-700)',fontWeight:500 }}>
                {gem.certificationLab} certified
              </span>
              {gem.certificateNumber && (
                <span style={{ fontSize:'12px',color:'var(--gold-500)',fontFamily:'monospace' }}>
                  #{gem.certificateNumber}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {gem.description && (
            <p style={{ fontSize:'14px',lineHeight:1.7,color:'var(--text-secondary)',marginBottom:'8px' }}>
              {gem.description}
            </p>
          )}

          {/* Specs */}
          <SectionHeading>The 4 Cs</SectionHeading>
          <SpecRow label="Weight"  value={gem.weightInCarats ? `${gem.weightInCarats} carats` : null} />
          <SpecRow label="Color"   value={gem.color} />
          <SpecRow label="Clarity" value={gem.clarity} />
          <SpecRow label="Cut"     value={gem.cut} />

          <SectionHeading>Physical details</SectionHeading>
          <SpecRow label="Shape" value={gem.shape} />
          <SpecRow label="Dimensions" value={gem.lengthMM && gem.widthMM && gem.depthMM ? `${gem.lengthMM} × ${gem.widthMM} × ${gem.depthMM} mm` : null} />

          <SectionHeading>Origin &amp; sourcing</SectionHeading>
          <SpecRow label="Origin"    value={gem.origin} />
          <SpecRow label="Treatment" value={gem.treatment} />
          <SpecRow label="Natural"   value={gem.isNatural ? 'Yes' : 'No'} />

          <SectionHeading>Record</SectionHeading>
          <SpecRow label="Added"   value={formatDate(gem.createdAt)} />
          <SpecRow label="Updated" value={formatDate(gem.updatedAt)} />

          {/* ── Action buttons ── */}
          <div style={{ display:'flex',gap:'10px',marginTop:'28px',flexWrap:'wrap' }}>

            {/* GUEST: Add to cart */}
            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={!gem.isAvailable && !inCart}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: (!gem.isAvailable && !inCart) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  background: inCart
                    ? 'var(--gold-500)'
                    : addedFeedback
                    ? 'var(--gem-400)'
                    : !gem.isAvailable
                    ? 'var(--surface-3)'
                    : 'var(--gem-500)',
                  color: (!gem.isAvailable && !inCart) ? 'var(--text-muted)' : '#fff',
                }}
                onMouseEnter={e => {
                  if (gem.isAvailable || inCart) {
                    e.currentTarget.style.opacity = '0.88'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {inCart ? (
                  <><CartIcon /> View cart</>
                ) : addedFeedback ? (
                  <><CheckIcon /> Added to cart!</>
                ) : !gem.isAvailable ? (
                  'Unavailable'
                ) : (
                  <><CartIcon /> Add to cart</>
                )}
              </button>
            )}

            {/* ADMIN: Edit */}
            {isAdmin && (
              <Link
                to={`/gemstones/${gem.id}/edit`}
                style={{ flex:1,minWidth:'120px',padding:'12px 20px',borderRadius:'var(--radius-md)',background:'var(--gem-500)',color:'#fff',textDecoration:'none',fontSize:'14px',fontWeight:500,textAlign:'center',transition:'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gem-400)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--gem-500)')}
              >
                Edit gemstone
              </Link>
            )}

            {/* ADMIN: Archive / Restore */}
            {isAdmin && (
              gem.isDeleted ? (
                <button
                  onClick={handleRestore}
                  style={{ padding:'12px 20px',borderRadius:'var(--radius-md)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,cursor:'pointer',transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--gem-50)'; e.currentTarget.style.color='var(--gem-500)'; e.currentTarget.style.borderColor='var(--gem-300)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--surface-2)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)' }}
                >
                  Restore
                </button>
              ) : !confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ padding:'12px 20px',borderRadius:'var(--radius-md)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,cursor:'pointer',transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.borderColor='#fca5a5'; e.currentTarget.style.color='#e03131' }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--surface-2)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
                >
                  Archive
                </button>
              ) : (
                <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                  <span style={{ fontSize:'13px',color:'#e03131' }}>Archive this stone?</span>
                  <button onClick={handleDelete} style={{ padding:'8px 16px',borderRadius:'var(--radius-sm)',background:'#e03131',color:'#fff',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600 }}>Yes</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ padding:'8px 14px',borderRadius:'var(--radius-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--text-secondary)',cursor:'pointer',fontSize:'13px' }}>Cancel</button>
                </div>
              )
            )}
          </div>

          {/* GUEST: Cart link if in cart */}
          {!isAdmin && inCart && (
            <p style={{ fontSize:'13px',color:'var(--text-muted)',marginTop:'12px' }}>
              {cartQuantity} × in your cart —{' '}
              <Link to="/cart" style={{ color:'var(--gem-500)',fontWeight:500,textDecoration:'none' }}
                onMouseEnter={e=>(e.currentTarget.style.textDecoration='underline')}
                onMouseLeave={e=>(e.currentTarget.style.textDecoration='none')}
              >
                view cart
              </Link>
            </p>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @media(max-width:768px){ .detail-grid{ grid-template-columns:1fr !important; gap:28px !important; } }
      `}</style>
    </div>
  )
}