import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGemStones, useDeleteGemStone } from '../../hooks/useGemStones'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

const GEM_TYPE_COLORS = {
  Diamond:  { bg: '#f0f4ff', text: '#3b5bdb', border: '#bac8ff' },
  Emerald:  { bg: 'var(--gem-50)',  text: 'var(--gem-500)',  border: 'var(--gem-200)'  },
  Ruby:     { bg: '#fff1f2', text: '#e03131', border: '#ffc9c9' },
  Sapphire: { bg: '#e7f5ff', text: '#1971c2', border: '#a5d8ff' },
  Amethyst: { bg: '#f3f0ff', text: '#6741d9', border: '#d0bfff' },
  Topaz:    { bg: 'var(--gold-50)', text: 'var(--gold-700)', border: 'var(--gold-200)' },
  Opal:     { bg: '#f8f0fc', text: '#ae3ec9', border: '#e599f7' },
  Pearl:    { bg: '#f8fafa', text: '#495057', border: '#dee2e6' },
}
function gemTypeStyle(t) { return GEM_TYPE_COLORS[t] || { bg:'var(--surface-2)',text:'var(--text-secondary)',border:'var(--border)' } }
function formatPrice(p) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(p) }
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''

function EyeIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function TrashIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> }
function CartIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> }
function CheckIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg> }

function SkeletonCard() {
  return (
    <div style={{ borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',overflow:'hidden',background:'var(--surface-0)' }}>
      <div className="skeleton" style={{ height:'200px' }} />
      <div style={{ padding:'16px',display:'flex',flexDirection:'column',gap:'10px' }}>
        <div className="skeleton" style={{ height:'14px',borderRadius:'6px',width:'60%' }} />
        <div className="skeleton" style={{ height:'20px',borderRadius:'6px',width:'80%' }} />
        <div className="skeleton" style={{ height:'14px',borderRadius:'6px',width:'40%' }} />
        <div style={{ display:'flex',gap:'8px',marginTop:'4px' }}>
          <div className="skeleton" style={{ height:'32px',borderRadius:'6px',flex:1 }} />
          <div className="skeleton" style={{ height:'32px',borderRadius:'6px',width:'80px' }} />
        </div>
      </div>
    </div>
  )
}

const iconBtn = { width:'32px',height:'32px',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',background:'var(--surface-1)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)',textDecoration:'none',transition:'all 0.15s',flexShrink:0,cursor:'pointer' }
function applyHover(e,bg,bc,c){ e.currentTarget.style.background=bg; e.currentTarget.style.borderColor=bc; e.currentTarget.style.color=c }
function resetHover(e){ e.currentTarget.style.background='var(--surface-1)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }

function GemCard({ gem, onDelete }) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { addToCart, isInCart } = useCart()
  const [imgError,      setImgError]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const typeStyle    = gemTypeStyle(gem.gemType)
  const thumbnailSrc = gem.thumbnailUrl || null
  const inCart       = isInCart(gem.id)

  const handleAddToCart = () => {
    if (inCart) { navigate('/cart'); return }
    addToCart(gem)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  return (
    <article className="card-lift" style={{ borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',overflow:'hidden',background:'var(--surface-0)',display:'flex',flexDirection:'column',position:'relative' }}>

      {/* Thumbnail */}
      <div onClick={()=>navigate(`/gemstones/${gem.id}`)} style={{ cursor:'pointer',height:'200px',background:'var(--surface-2)',overflow:'hidden',position:'relative',flexShrink:0 }}>
        {thumbnailSrc && !imgError ? (
          <img src={thumbnailSrc} alt={gem.name} onError={()=>setImgError(true)} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s ease' }} onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.05)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')} />
        ) : (
          <div style={{ width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',color:'var(--text-muted)' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" opacity="0.35"><polygon points="16,2 30,12 24,30 8,30 2,12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><line x1="2" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="1"/></svg>
            <span style={{ fontSize:'12px' }}>No image</span>
          </div>
        )}
        {!gem.isAvailable && <div style={{ position:'absolute',top:'10px',left:'10px',background:'rgba(0,0,0,0.65)',color:'#fff',fontSize:'11px',fontWeight:500,padding:'3px 10px',borderRadius:'99px',backdropFilter:'blur(4px)' }}>Unavailable</div>}
        {gem.isNatural   && <div style={{ position:'absolute',top:'10px',right:'10px',background:'rgba(46,80,64,0.85)',color:'#c4ddd3',fontSize:'10px',fontWeight:500,padding:'3px 10px',borderRadius:'99px',backdropFilter:'blur(4px)',letterSpacing:'0.06em',textTransform:'uppercase' }}>Natural</div>}
        {inCart          && <div style={{ position:'absolute',bottom:'10px',right:'10px',background:'rgba(196,154,46,0.9)',color:'#fff',fontSize:'10px',fontWeight:600,padding:'3px 10px',borderRadius:'99px',backdropFilter:'blur(4px)' }}>In cart</div>}
      </div>

      {/* Body */}
      <div style={{ padding:'14px 16px 16px',flex:1,display:'flex',flexDirection:'column',gap:'8px' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <span style={{ background:typeStyle.bg,color:typeStyle.text,border:`1px solid ${typeStyle.border}`,fontSize:'11px',fontWeight:500,padding:'2px 10px',borderRadius:'99px' }}>{gem.gemType||'Unknown'}</span>
          <span style={{ fontSize:'11px',color:'var(--text-muted)',fontFamily:'monospace' }}>{gem.sku}</span>
        </div>

        <h3 onClick={()=>navigate(`/gemstones/${gem.id}`)} style={{ fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:500,color:'var(--text-primary)',cursor:'pointer',lineHeight:1.3,letterSpacing:'0.01em',transition:'color 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.color='var(--gem-500)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-primary)')}>
          {gem.name}
        </h3>

        <div style={{ display:'flex',gap:'12px',flexWrap:'wrap' }}>
          {gem.weightInCarats && <span style={{ fontSize:'12px',color:'var(--text-secondary)' }}>⬡ {gem.weightInCarats} ct</span>}
          {gem.color          && <span style={{ fontSize:'12px',color:'var(--text-secondary)' }}>◉ {gem.color}</span>}
          {gem.shape          && <span style={{ fontSize:'12px',color:'var(--text-secondary)' }}>◈ {gem.shape}</span>}
        </div>

        {gem.certificationLab && (
          <div style={{ display:'flex',alignItems:'center',gap:'5px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
            <span style={{ fontSize:'11.5px',color:'var(--gold-700)',fontWeight:500 }}>{gem.certificationLab} certified</span>
          </div>
        )}

        <div style={{ flex:1 }} />

        {/* Price + actions */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid var(--border)',marginTop:'4px',gap:'8px' }}>
          <span style={{ fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.01em',flexShrink:0 }}>
            {formatPrice(gem.price)}
          </span>

          <div style={{ display:'flex',gap:'6px',alignItems:'center' }}>

            {/* View — everyone */}
            <Link to={`/gemstones/${gem.id}`} title="View details" style={iconBtn} onMouseEnter={e=>applyHover(e,'var(--surface-3)','var(--border-strong)','var(--text-primary)')} onMouseLeave={resetHover}><EyeIcon /></Link>

            {/* Add to cart — guests only */}
            {!isAdmin && (
              <button onClick={handleAddToCart} title={inCart?'Go to cart':'Add to cart'} style={{ ...iconBtn, width:addedFeedback?'auto':'32px', padding:addedFeedback?'0 10px':'0', background:inCart?'var(--gold-50)':addedFeedback?'var(--gem-50)':'var(--surface-1)', borderColor:inCart?'var(--gold-300)':addedFeedback?'var(--gem-300)':'var(--border)', color:inCart?'var(--gold-700)':addedFeedback?'var(--gem-500)':'var(--text-secondary)', gap:'4px', transition:'all 0.2s ease' }} onMouseEnter={e=>{if(!inCart&&!addedFeedback)applyHover(e,'var(--gem-50)','var(--gem-300)','var(--gem-500)')}} onMouseLeave={e=>{if(!inCart&&!addedFeedback)resetHover(e)}}>
                {addedFeedback ? <><CheckIcon /><span style={{fontSize:'11px'}}>Added</span></> : <CartIcon />}
              </button>
            )}

            {/* Edit — admin only */}
            {isAdmin && <Link to={`/gemstones/${gem.id}/edit`} title="Edit" style={iconBtn} onMouseEnter={e=>applyHover(e,'var(--gold-50)','var(--gold-300)','var(--gold-700)')} onMouseLeave={resetHover}><EditIcon /></Link>}

            {/* Delete — admin only */}
            {isAdmin && (!confirmDelete ? (
              <button onClick={()=>setConfirmDelete(true)} title="Delete" style={iconBtn} onMouseEnter={e=>applyHover(e,'#fff1f2','#fca5a5','#e03131')} onMouseLeave={resetHover}><TrashIcon /></button>
            ) : (
              <div style={{ display:'flex',alignItems:'center',gap:'4px' }}>
                <span style={{ fontSize:'11px',color:'#e03131',whiteSpace:'nowrap' }}>Sure?</span>
                <button onClick={()=>{onDelete(gem.id);setConfirmDelete(false)}} style={{ padding:'4px 8px',fontSize:'11px',fontWeight:600,background:'#e03131',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer' }}>Yes</button>
                <button onClick={()=>setConfirmDelete(false)} style={{ padding:'4px 8px',fontSize:'11px',background:'var(--surface-2)',color:'var(--text-secondary)',border:'1px solid var(--border)',borderRadius:'4px',cursor:'pointer' }}>No</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function Toolbar({ search, onSearch, typeFilter, onTypeFilter, total, gemTypes }) {
  return (
    <div style={{ display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center',marginBottom:'28px' }}>
      <div style={{ position:'relative',flex:1,minWidth:'220px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search by name, type, color, origin…" value={search} onChange={e=>onSearch(e.target.value)} style={{ width:'100%',padding:'9px 36px 9px 38px',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',background:'var(--surface-0)',color:'var(--text-primary)',fontSize:'14px',outline:'none' }} onFocus={e=>(e.target.style.borderColor='var(--gem-300)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
        {search && <button onClick={()=>onSearch('')} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'18px',lineHeight:1 }}>×</button>}
      </div>
      <select value={typeFilter} onChange={e=>onTypeFilter(e.target.value)} style={{ padding:'9px 14px',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',background:'var(--surface-0)',color:'var(--text-primary)',fontSize:'14px',cursor:'pointer',outline:'none',minWidth:'160px' }}>
        <option value="">All types</option>
        {gemTypes.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
      <span style={{ fontSize:'13px',color:'var(--text-muted)',whiteSpace:'nowrap' }}>{total} stone{total!==1?'s':''}</span>
    </div>
  )
}

function EmptyState({ hasSearch, isAdmin }) {
  return (
    <div style={{ gridColumn:'1 / -1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 24px',gap:'16px',color:'var(--text-muted)' }}>
      <svg width="56" height="56" viewBox="0 0 32 32" fill="none" opacity="0.35"><polygon points="16,2 30,12 24,30 8,30 2,12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:500,marginBottom:'6px',color:'var(--text-secondary)' }}>{hasSearch?'No stones found':'No gemstones yet'}</p>
        <p style={{ fontSize:'14px' }}>{hasSearch?'Try a different search or clear the filter.':isAdmin?'Add your first gemstone to get started.':'Check back soon.'}</p>
      </div>
      {!hasSearch && isAdmin && (
        <Link to="/gemstones/create" style={{ padding:'10px 22px',borderRadius:'var(--radius-md)',background:'var(--gem-500)',color:'#fff',textDecoration:'none',fontSize:'14px',fontWeight:500,marginTop:'8px' }}>Add first gemstone</Link>
      )}
    </div>
  )
}

export default function GemStoneList() {
  const { data: gems = [], isLoading, isError, error } = useGemStones()
  const deleteMutation = useDeleteGemStone()
  const { isAdmin }    = useAuth()
  const toast          = useToast()

  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('')
  const [showDeleted, setShowDeleted] = useState(false)

  const gemTypes = useMemo(() => [...new Set(gems.map(g=>g.gemType).filter(Boolean))].sort(), [gems])

  const filtered = useMemo(() => {
    let list = gems
    if (!showDeleted) list = list.filter(g => !g.isDeleted)
    if (typeFilter)   list = list.filter(g => g.gemType === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(g => g.name?.toLowerCase().includes(q) || g.gemType?.toLowerCase().includes(q) || g.color?.toLowerCase().includes(q) || g.origin?.toLowerCase().includes(q) || g.sku?.toLowerCase().includes(q))
    }
    return list
  }, [gems, search, typeFilter, showDeleted])

  const handleDelete = async (id) => {
    try { await deleteMutation.mutateAsync(id); toast.success('Gemstone archived') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',marginBottom:'32px' }}>
        <div>
          <p style={{ fontSize:'12px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gold-500)',fontWeight:500,marginBottom:'6px' }}>Collection</p>
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:'36px',fontWeight:500,color:'var(--text-primary)',letterSpacing:'-0.01em',lineHeight:1.1 }}>Gemstone Vault</h1>
          <p style={{ fontSize:'15px',color:'var(--text-muted)',marginTop:'6px' }}>{isLoading?'Loading…':`${gems.filter(g=>!g.isDeleted).length} stones in collection`}</p>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
          {isAdmin && (
            <label style={{ display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'13px',color:'var(--text-secondary)' }}>
              <input type="checkbox" checked={showDeleted} onChange={e=>setShowDeleted(e.target.checked)} style={{ accentColor:'var(--gem-400)',width:'15px',height:'15px' }} />
              Show archived
            </label>
          )}
        </div>
      </div>

      {isError && (
        <div style={{ padding:'14px 18px',borderRadius:'var(--radius-md)',background:'#fff1f2',border:'1px solid #fca5a5',color:'#c92a2a',fontSize:'14px',marginBottom:'24px',display:'flex',gap:'10px',alignItems:'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error?.message || 'Failed to load gemstones.'}
        </div>
      )}

      {!isLoading && !isError && <Toolbar search={search} onSearch={setSearch} typeFilter={typeFilter} onTypeFilter={setTypeFilter} total={filtered.length} gemTypes={gemTypes} />}

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:'20px' }}>
        {isLoading
          ? Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)
          : filtered.length===0
          ? <EmptyState hasSearch={!!search||!!typeFilter} isAdmin={isAdmin} />
          : filtered.map(gem=><GemCard key={gem.id} gem={gem} onDelete={handleDelete}/>)
        }
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  )
}