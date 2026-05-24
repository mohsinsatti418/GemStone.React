import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useGemStone, useUpdateGemStone } from '../../hooks/useGemStones'
import { useToast } from '../../context/ToastContext'

const GEM_TYPES = ['Diamond','Emerald','Ruby','Sapphire','Amethyst','Topaz','Opal','Pearl','Garnet','Aquamarine','Peridot','Tanzanite','Tourmaline','Spinel','Other']
const CLARITY_OPTIONS = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3']
const CUT_OPTIONS = ['Excellent','Very Good','Good','Fair','Poor']
const SHAPE_OPTIONS = ['Round','Princess','Cushion','Oval','Emerald Cut','Pear','Marquise','Radiant','Asscher','Heart','Other']
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
const fullUrl = (path) => (!path ? null : path.startsWith('http') ? path : `${API_ORIGIN}${path}`)

function BackButton() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)} style={{ display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,padding:'6px 0',marginBottom:'28px',transition:'color 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.color='var(--text-primary)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-secondary)')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
      Back
    </button>
  )
}

function Field({ label, required, error, hint, id, children }) {
  return (
    <div id={id} style={{ display:'flex',flexDirection:'column',gap:'5px' }}>
      <label style={{ fontSize:'13px',fontWeight:500,color:error?'#c92a2a':'var(--text-secondary)' }}>
        {label}{required&&<span style={{color:'var(--gold-500)',marginLeft:'3px'}}>*</span>}
      </label>
      {children}
      {hint&&!error&&<span style={{fontSize:'11.5px',color:'var(--text-muted)'}}>{hint}</span>}
      {error&&<span style={{fontSize:'11.5px',color:'#c92a2a'}}>{error}</span>}
    </div>
  )
}

function Input({ error, ...props }) {
  const [focused, setFocused] = useState(false)
  return <input {...props} style={{ padding:'9px 12px',borderRadius:'var(--radius-md)',border:`1px solid ${focused?'var(--gem-300)':error?'#fca5a5':'var(--border)'}`,background:'var(--surface-0)',color:'var(--text-primary)',fontSize:'14px',outline:'none',width:'100%',transition:'border-color 0.15s',...(props.style||{}) }} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
}

function Select({ error, children, ...props }) {
  const [focused, setFocused] = useState(false)
  return <select {...props} style={{ padding:'9px 12px',borderRadius:'var(--radius-md)',border:`1px solid ${focused?'var(--gem-300)':error?'#fca5a5':'var(--border)'}`,background:'var(--surface-0)',color:'var(--text-primary)',fontSize:'14px',outline:'none',width:'100%',cursor:'pointer',transition:'border-color 0.15s' }} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}>{children}</select>
}

function Textarea({ error, ...props }) {
  const [focused, setFocused] = useState(false)
  return <textarea {...props} style={{ padding:'9px 12px',borderRadius:'var(--radius-md)',border:`1px solid ${focused?'var(--gem-300)':error?'#fca5a5':'var(--border)'}`,background:'var(--surface-0)',color:'var(--text-primary)',fontSize:'14px',outline:'none',width:'100%',resize:'vertical',minHeight:'90px',lineHeight:1.6,transition:'border-color 0.15s' }} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ background:'var(--surface-0)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden' }}>
      <div style={{ padding:'16px 24px',borderBottom:'1px solid var(--border)',background:'var(--surface-1)' }}>
        <p style={{ fontSize:'15px',fontWeight:600,color:'var(--text-primary)',marginBottom:subtitle?'2px':0 }}>{title}</p>
        {subtitle&&<p style={{ fontSize:'12.5px',color:'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      <div style={{ padding:'24px' }}>{children}</div>
    </div>
  )
}

function Grid2({ children }) { return <div className="form-grid-2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px' }}>{children}</div> }
function Grid3({ children }) { return <div className="form-grid-3" style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'18px' }}>{children}</div> }

function ExistingImages({ images, deleteIds, onToggleDelete, newThumbnailId, onSetThumbnail }) {
  const [imgErrors, setImgErrors] = useState({})
  if (!images || images.length === 0) return <p style={{ fontSize:'13px',color:'var(--text-muted)' }}>No images saved yet.</p>
  return (
    <div>
      <p style={{ fontSize:'12px',color:'var(--text-muted)',marginBottom:'10px' }}>Click ★ to change cover. Click × to remove.</p>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))',gap:'10px' }}>
        {images.map(img => {
          const src = fullUrl(img.imageUrl)
          const isDeleted = deleteIds.includes(img.id)
          const isThumb = newThumbnailId ? newThumbnailId === img.id : img.isThumbnail
          return (
            <div key={img.id} style={{ position:'relative',borderRadius:'var(--radius-md)',overflow:'hidden',aspectRatio:'1',border:isDeleted?'2px solid #fca5a5':isThumb?'2px solid var(--gold-400)':'2px solid var(--border)',background:'var(--surface-2)',opacity:isDeleted?0.45:1,transition:'opacity 0.2s,border-color 0.2s' }}>
              {src&&!imgErrors[img.id] ? (
                <img src={src} alt={img.imageName||'Image'} onError={()=>setImgErrors(p=>({...p,[img.id]:true}))} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              ) : (
                <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:'11px' }}>No preview</div>
              )}
              {!isDeleted&&(
                <button type="button" onClick={()=>onSetThumbnail(img.id)} title="Set as cover" style={{ position:'absolute',top:'5px',left:'5px',width:'24px',height:'24px',borderRadius:'50%',background:isThumb?'var(--gold-400)':'rgba(0,0,0,0.45)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px' }}>★</button>
              )}
              <button type="button" onClick={()=>onToggleDelete(img.id)} title={isDeleted?'Undo':'Remove'} style={{ position:'absolute',top:'5px',right:'5px',width:'24px',height:'24px',borderRadius:'50%',background:isDeleted?'rgba(46,80,64,0.75)':'rgba(0,0,0,0.55)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:isDeleted?'11px':'15px',lineHeight:1 }}>{isDeleted?'↩':'×'}</button>
              {isThumb&&!isDeleted&&<div style={{ position:'absolute',bottom:0,left:0,right:0,background:'rgba(196,154,46,0.85)',color:'#fff',fontSize:'10px',fontWeight:600,textAlign:'center',padding:'3px 0',letterSpacing:'0.06em' }}>COVER</div>}
              {isDeleted&&<div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(224,49,49,0.18)' }}><span style={{ background:'#e03131',color:'#fff',fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'4px',letterSpacing:'0.06em' }}>REMOVE</span></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NewImageUploader({ images, onAdd, onRemove }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileErrors, setFileErrors] = useState([])
  const processFiles = (files) => {
    const errs = [], valid = []
    Array.from(files).forEach(f => {
      if (!ALLOWED_TYPES.includes(f.type)) { errs.push(`${f.name}: unsupported format`); return }
      if (f.size > MAX_FILE_SIZE) { errs.push(`${f.name}: exceeds 5 MB`); return }
      valid.push(f)
    })
    setFileErrors(errs)
    if (valid.length) onAdd(valid)
  }
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
      <div onClick={()=>inputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);processFiles(e.dataTransfer.files)}} style={{ border:`2px dashed ${dragOver?'var(--gem-400)':'var(--border-strong)'}`,borderRadius:'var(--radius-lg)',padding:'24px',textAlign:'center',cursor:'pointer',background:dragOver?'var(--gem-50)':'var(--surface-1)',transition:'all 0.15s' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom:'8px' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
        <p style={{ fontSize:'14px',color:'var(--text-secondary)',fontWeight:500 }}>Drop images here or <span style={{ color:'var(--gem-500)',textDecoration:'underline' }}>browse</span></p>
        <p style={{ fontSize:'12px',color:'var(--text-muted)',marginTop:'3px' }}>JPG, PNG, WebP, GIF — max 5 MB each</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style={{ display:'none' }} onChange={e=>{processFiles(e.target.files);e.target.value=''}} />
      </div>
      {fileErrors.length>0&&<div style={{ padding:'10px 14px',borderRadius:'var(--radius-md)',background:'#fff1f2',border:'1px solid #fca5a5',fontSize:'12.5px',color:'#c92a2a' }}>{fileErrors.map((err,i)=><div key={i}>{err}</div>)}</div>}
      {images.length>0&&(
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))',gap:'10px' }}>
          {images.map((file,idx)=>{
            const url = URL.createObjectURL(file)
            return (
              <div key={idx} style={{ position:'relative',borderRadius:'var(--radius-md)',overflow:'hidden',aspectRatio:'1',border:'2px solid var(--border)',background:'var(--surface-2)' }}>
                <img src={url} alt={file.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} onLoad={()=>URL.revokeObjectURL(url)} />
                <button type="button" onClick={()=>onRemove(idx)} style={{ position:'absolute',top:'5px',right:'5px',width:'24px',height:'24px',borderRadius:'50%',background:'rgba(0,0,0,0.55)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'15px',lineHeight:1 }}>×</button>
                <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'rgba(46,80,64,0.8)',color:'#c4ddd3',fontSize:'9px',fontWeight:600,textAlign:'center',padding:'2px 0',letterSpacing:'0.06em' }}>NEW</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EditSkeleton() {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'20px' }}>
      {[1,2,3].map(i=>(
        <div key={i} style={{ borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',overflow:'hidden' }}>
          <div className="skeleton" style={{ height:'52px' }} />
          <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px' }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px' }}>
              <div className="skeleton" style={{ height:'38px',borderRadius:'var(--radius-md)' }} />
              <div className="skeleton" style={{ height:'38px',borderRadius:'var(--radius-md)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function validate(form) {
  const errs = {}
  if (!form.name.trim())       errs.name           = 'Name is required'
  if (!form.sku.trim())        errs.sku             = 'SKU is required'
  if (!form.gemType)           errs.gemType         = 'Gem type is required'
  if (!form.color.trim())      errs.color           = 'Color is required'
  if (!form.clarity)           errs.clarity         = 'Clarity is required'
  if (!form.shape)             errs.shape           = 'Shape is required'
  if (!form.weightInCarats || Number(form.weightInCarats) <= 0) errs.weightInCarats = 'Weight must be greater than 0'
  if (!form.price || Number(form.price) <= 0)                   errs.price = 'Price must be greater than 0'
  if (form.stockQuantity === '' || Number(form.stockQuantity) < 0) errs.stockQuantity = 'Stock quantity must be 0 or more'
  return errs
}

export default function GemStoneEdit() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const toast          = useToast()
  const updateMutation = useUpdateGemStone()

  const { data: gem, isLoading, isError, error } = useGemStone(Number(id))

  const [form, setForm]           = useState(null)
  const [errors, setErrors]       = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [deleteIds, setDeleteIds]           = useState([])
  const [newThumbnailId, setNewThumbnailId] = useState(null)
  const [newImages, setNewImages]           = useState([])

  useEffect(() => {
    if (!gem) return
    setForm({
      name: gem.name??'', sku: gem.sku??'', gemType: gem.gemType??'',
      weightInCarats: gem.weightInCarats??'', color: gem.color??'',
      clarity: gem.clarity??'', cut: gem.cut??'', shape: gem.shape??'',
      lengthMM: gem.lengthMM??'', widthMM: gem.widthMM??'', depthMM: gem.depthMM??'',
      origin: gem.origin??'', treatment: gem.treatment??'',
      isNatural: gem.isNatural??true, isAvailable: gem.isAvailable??true,
      certificationLab: gem.certificationLab??'', certificateNumber: gem.certificateNumber??'',
      price: gem.price??'', stockQuantity: gem.stockQuantity??1, description: gem.description??'',
    })
  }, [gem])

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (submitted) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleToggleDelete = (imageId) => setDeleteIds(prev => prev.includes(imageId) ? prev.filter(i=>i!==imageId) : [...prev, imageId])
  const handleSetThumbnail  = (imageId) => setNewThumbnailId(prev => prev === imageId ? null : imageId)
  const handleRemoveNew     = (idx)     => setNewImages(prev => prev.filter((_,i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior:'smooth', block:'center' })
      return
    }
    const fd = new FormData()
    fd.append('Id', id)
    fd.append('Name', form.name.trim())
    fd.append('SKU', form.sku.trim())
    fd.append('GemType', form.gemType)
    fd.append('WeightInCarats', form.weightInCarats)
    fd.append('Color', form.color.trim())
    fd.append('Clarity', form.clarity)
    fd.append('Cut', form.cut)
    fd.append('Shape', form.shape)
    fd.append('LengthMM', form.lengthMM||'0')
    fd.append('WidthMM', form.widthMM||'0')
    fd.append('DepthMM', form.depthMM||'0')
    fd.append('Origin', form.origin.trim())
    fd.append('Treatment', form.treatment.trim())
    fd.append('IsNatural', form.isNatural)
    fd.append('IsAvailable', form.isAvailable)
    fd.append('CertificationLab', form.certificationLab.trim())
    fd.append('CertificateNumber', form.certificateNumber.trim())
    fd.append('Price', form.price)
    fd.append('StockQuantity', form.stockQuantity)
    fd.append('Description', form.description.trim())
    deleteIds.forEach(imgId => fd.append('DeleteImageIds', imgId))
    if (newThumbnailId) fd.append('NewThumbnailImageId', newThumbnailId)
    newImages.forEach(file => fd.append('newImages', file))
    try {
      await updateMutation.mutateAsync(fd)
      toast.success('Gemstone updated successfully')
      setTimeout(() => navigate(`/`), 800)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const isSubmitting = updateMutation.isPending

  if (isLoading) return <div><BackButton /><EditSkeleton /></div>
  if (isError || !gem) return <div><BackButton /><div style={{ padding:'20px',borderRadius:'var(--radius-md)',background:'#fff1f2',border:'1px solid #fca5a5',color:'#c92a2a',fontSize:'14px' }}>{error?.message||'Gemstone not found.'}</div></div>
  if (!form) return null

  const existingImages = gem.images || []

  return (
    <div style={{ animation:'fadeIn 0.3s ease', maxWidth:'860px' }}>
      <BackButton />

      <div style={{ marginBottom:'32px' }}>
        <p style={{ fontSize:'12px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gold-500)',fontWeight:500,marginBottom:'6px' }}>Editing</p>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'34px',fontWeight:500,color:'var(--text-primary)',letterSpacing:'-0.01em',lineHeight:1.1 }}>{gem.name}</h1>
        <p style={{ fontSize:'13px',color:'var(--text-muted)',marginTop:'4px',fontFamily:'monospace' }}>SKU: {gem.sku} · ID: {gem.id}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display:'flex',flexDirection:'column',gap:'20px' }}>

        <Section title="Identity">
          <div style={{ display:'flex',flexDirection:'column',gap:'18px' }}>
            <Grid2>
              <Field id="field-name" label="Name" required error={errors.name}><Input value={form.name} onChange={set('name')} error={errors.name} maxLength={200} /></Field>
              <Field id="field-sku" label="SKU" required error={errors.sku}><Input value={form.sku} onChange={set('sku')} error={errors.sku} maxLength={50} /></Field>
            </Grid2>
            <Field id="field-gemType" label="Gem type" required error={errors.gemType}>
              <Select value={form.gemType} onChange={set('gemType')} error={errors.gemType}>
                <option value="">Select gem type</option>
                {GEM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Description"><Textarea value={form.description} onChange={set('description')} rows={3} maxLength={2000} /></Field>
          </div>
        </Section>

        <Section title="The 4 Cs">
          <div style={{ display:'flex',flexDirection:'column',gap:'18px' }}>
            <Grid2>
              <Field id="field-weightInCarats" label="Weight (carats)" required error={errors.weightInCarats}><Input type="number" step="0.01" min="0.01" value={form.weightInCarats} onChange={set('weightInCarats')} error={errors.weightInCarats} /></Field>
              <Field id="field-color" label="Color" required error={errors.color}><Input value={form.color} onChange={set('color')} error={errors.color} maxLength={50} /></Field>
            </Grid2>
            <Grid2>
              <Field id="field-clarity" label="Clarity" required error={errors.clarity}>
                <Select value={form.clarity} onChange={set('clarity')} error={errors.clarity}>
                  <option value="">Select clarity</option>
                  {CLARITY_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Cut">
                <Select value={form.cut} onChange={set('cut')}>
                  <option value="">Select cut (optional)</option>
                  {CUT_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </Grid2>
          </div>
        </Section>

        <Section title="Physical details">
          <div style={{ display:'flex',flexDirection:'column',gap:'18px' }}>
            <Field id="field-shape" label="Shape" required error={errors.shape}>
              <Select value={form.shape} onChange={set('shape')} error={errors.shape}>
                <option value="">Select shape</option>
                {SHAPE_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Grid3>
              <Field label="Length (mm)"><Input type="number" step="0.01" min="0" value={form.lengthMM} onChange={set('lengthMM')} placeholder="0.00" /></Field>
              <Field label="Width (mm)"><Input type="number" step="0.01" min="0" value={form.widthMM} onChange={set('widthMM')} placeholder="0.00" /></Field>
              <Field label="Depth (mm)"><Input type="number" step="0.01" min="0" value={form.depthMM} onChange={set('depthMM')} placeholder="0.00" /></Field>
            </Grid3>
          </div>
        </Section>

        <Section title="Origin & sourcing">
          <div style={{ display:'flex',flexDirection:'column',gap:'18px' }}>
            <Grid2>
              <Field label="Origin"><Input value={form.origin} onChange={set('origin')} placeholder="e.g. Burma, Colombia" maxLength={100} /></Field>
              <Field label="Treatment"><Input value={form.treatment} onChange={set('treatment')} placeholder="e.g. None, Heat treated" maxLength={100} /></Field>
            </Grid2>
            <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
              {[
                { field:'isNatural', label:'Natural gemstone', hint:'Uncheck for lab-grown or synthetic' },
                { field:'isAvailable', label:'Available for sale', hint:'Uncheck to hide from the catalog' },
              ].map(({ field, label, hint }) => (
                <label key={field} style={{ display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer',fontSize:'14px',color:'var(--text-secondary)',width:'fit-content' }}>
                  <input type="checkbox" checked={form[field]} onChange={set(field)} style={{ accentColor:'var(--gem-400)',width:'16px',height:'16px',marginTop:'2px' }} />
                  <span>
                    <span style={{ color:'var(--text-primary)',fontWeight:500 }}>{label}</span>
                    <span style={{ display:'block',fontSize:'12px',color:'var(--text-muted)',marginTop:'1px' }}>{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Certification" subtitle="Optional grading laboratory details">
          <Grid2>
            <Field label="Certification lab"><Input value={form.certificationLab} onChange={set('certificationLab')} placeholder="e.g. GIA, AGL" maxLength={50} /></Field>
            <Field label="Certificate number"><Input value={form.certificateNumber} onChange={set('certificateNumber')} placeholder="e.g. 2143576890" maxLength={100} /></Field>
          </Grid2>
        </Section>

        <Section title="Pricing & inventory">
          <Grid2>
            <Field id="field-price" label="Price (USD)" required error={errors.price}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'14px',pointerEvents:'none' }}>$</span>
                <Input type="number" step="0.01" min="0.01" value={form.price} onChange={set('price')} error={errors.price} style={{ paddingLeft:'26px' }} />
              </div>
            </Field>
            <Field id="field-stockQuantity" label="Stock quantity" required error={errors.stockQuantity}>
              <Input type="number" step="1" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} error={errors.stockQuantity} />
            </Field>
          </Grid2>
        </Section>

        <Section title="Images" subtitle="Remove existing images or upload new ones. Star to change the cover.">
          <div style={{ display:'flex',flexDirection:'column',gap:'24px' }}>
            {existingImages.length > 0 && (
              <div>
                <p style={{ fontSize:'12px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)',fontWeight:600,marginBottom:'10px' }}>
                  Saved images ({existingImages.length})
                </p>
                <ExistingImages images={existingImages} deleteIds={deleteIds} onToggleDelete={handleToggleDelete} newThumbnailId={newThumbnailId} onSetThumbnail={handleSetThumbnail} />
                {deleteIds.length > 0 && (
                  <p style={{ fontSize:'12px',color:'#e03131',marginTop:'10px' }}>
                    {deleteIds.length} image{deleteIds.length>1?'s':''} will be removed on save
                  </p>
                )}
              </div>
            )}
            <div>
              <p style={{ fontSize:'12px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)',fontWeight:600,marginBottom:'10px' }}>Add new images</p>
              <NewImageUploader images={newImages} onAdd={files=>setNewImages(prev=>[...prev,...files])} onRemove={handleRemoveNew} />
            </div>
          </div>
        </Section>

        <div style={{ display:'flex',justifyContent:'flex-end',alignItems:'center',gap:'12px',paddingTop:'8px' }}>
          <Link to={`/gemstones/${id}`} style={{ padding:'11px 22px',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',background:'var(--surface-0)',color:'var(--text-secondary)',fontSize:'14px',fontWeight:500,textDecoration:'none',transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='var(--surface-2)';e.currentTarget.style.color='var(--text-primary)'}} onMouseLeave={e=>{e.currentTarget.style.background='var(--surface-0)';e.currentTarget.style.color='var(--text-secondary)'}}>Cancel</Link>
          <button type="submit" disabled={isSubmitting} style={{ padding:'11px 28px',borderRadius:'var(--radius-md)',background:isSubmitting?'var(--gem-300)':'var(--gem-500)',color:'#fff',border:'none',fontSize:'14px',fontWeight:500,cursor:isSubmitting?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'8px',transition:'background 0.15s' }} onMouseEnter={e=>{if(!isSubmitting)e.currentTarget.style.background='var(--gem-400)'}} onMouseLeave={e=>{if(!isSubmitting)e.currentTarget.style.background='var(--gem-500)'}}>
            {isSubmitting&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
            {isSubmitting?'Saving…':'Save changes'}
          </button>
        </div>

      </form>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @media(max-width:640px){.form-grid-2{grid-template-columns:1fr!important;}.form-grid-3{grid-template-columns:1fr 1fr!important;}}
      `}</style>
    </div>
  )
}