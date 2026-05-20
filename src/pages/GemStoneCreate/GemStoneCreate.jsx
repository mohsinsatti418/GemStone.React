import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateGemStone } from '../../hooks/useGemStones'
import { useToast } from '../../context/ToastContext'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const GEM_TYPES = [
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst',
  'Topaz', 'Opal', 'Pearl', 'Garnet', 'Aquamarine',
  'Peridot', 'Tanzanite', 'Tourmaline', 'Spinel', 'Other',
]

const CLARITY_OPTIONS = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3',
]

const CUT_OPTIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']

const SHAPE_OPTIONS = [
  'Round', 'Princess', 'Cushion', 'Oval', 'Emerald Cut',
  'Pear', 'Marquise', 'Radiant', 'Asscher', 'Heart', 'Other',
]

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

// ─────────────────────────────────────────────
// Small shared components
// ─────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
        padding: '6px 0', marginBottom: '28px', transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12,19 5,12 12,5" />
      </svg>
      Back to catalog
    </button>
  )
}

function Field({ label, required, error, hint, id, children }) {
  return (
    <div id={id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{
        fontSize: '13px', fontWeight: 500,
        color: error ? '#c92a2a' : 'var(--text-secondary)',
      }}>
        {label}
        {required && <span style={{ color: 'var(--gold-500)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: '11.5px', color: '#c92a2a' }}>{error}</span>
      )}
    </div>
  )
}

function Input({ error, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${focused ? 'var(--gem-300)' : error ? '#fca5a5' : 'var(--border)'}`,
        background: 'var(--surface-0)',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.15s',
        ...(props.style || {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function Select({ error, children, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      {...props}
      style={{
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${focused ? 'var(--gem-300)' : error ? '#fca5a5' : 'var(--border)'}`,
        background: 'var(--surface-0)',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  )
}

function Textarea({ error, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      style={{
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${focused ? 'var(--gem-300)' : error ? '#fca5a5' : 'var(--border)'}`,
        background: 'var(--surface-0)',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        resize: 'vertical',
        minHeight: '90px',
        lineHeight: 1.6,
        transition: 'border-color 0.15s',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--surface-0)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1)',
      }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: subtitle ? '2px' : 0 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  )
}

function Grid2({ children }) {
  return (
    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
      {children}
    </div>
  )
}

function Grid3({ children }) {
  return (
    <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// Image uploader
// ─────────────────────────────────────────────

function ImageUploader({ images, onAdd, onRemove, thumbnailIndex, onThumbnailChange }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileErrors, setFileErrors] = useState([])

  const processFiles = (files) => {
    const errs = []
    const valid = []
    Array.from(files).forEach(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errs.push(`${f.name}: unsupported format — use JPG, PNG, WebP or GIF`)
        return
      }
      if (f.size > MAX_FILE_SIZE) {
        errs.push(`${f.name}: exceeds 5 MB limit`)
        return
      }
      valid.push(f)
    })
    setFileErrors(errs)
    if (valid.length) onAdd(valid)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--gem-400)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--gem-50)' : 'var(--surface-1)',
          transition: 'all 0.15s',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: '10px' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Drop images here or{' '}
          <span style={{ color: 'var(--gem-500)', textDecoration: 'underline' }}>browse files</span>
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          JPG, PNG, WebP, GIF — max 5 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          style={{ display: 'none' }}
          onChange={e => { processFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* File errors */}
      {fileErrors.length > 0 && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: '#fff1f2', border: '1px solid #fca5a5',
          fontSize: '12.5px', color: '#c92a2a',
        }}>
          {fileErrors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Click ★ to set the cover image shown in the catalog
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '10px',
          }}>
            {images.map((file, idx) => {
              const url = URL.createObjectURL(file)
              const isThumb = idx === thumbnailIndex
              return (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: isThumb ? '2px solid var(--gold-400)' : '2px solid var(--border)',
                    aspectRatio: '1',
                    background: 'var(--surface-2)',
                  }}
                >
                  <img
                    src={url}
                    alt={file.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={() => URL.revokeObjectURL(url)}
                  />

                  {/* Set as thumbnail */}
                  <button
                    type="button"
                    onClick={() => onThumbnailChange(idx)}
                    title="Set as cover image"
                    style={{
                      position: 'absolute', top: '5px', left: '5px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isThumb ? 'var(--gold-400)' : 'rgba(0,0,0,0.45)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '12px',
                    }}
                  >
                    ★
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    title="Remove"
                    style={{
                      position: 'absolute', top: '5px', right: '5px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '15px', lineHeight: 1,
                    }}
                  >
                    ×
                  </button>

                  {/* Cover label */}
                  {isThumb && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'rgba(196,154,46,0.85)',
                      color: '#fff', fontSize: '10px', fontWeight: 600,
                      textAlign: 'center', padding: '3px 0',
                      letterSpacing: '0.06em',
                    }}>
                      COVER
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

function validate(form) {
  const errs = {}
  if (!form.name.trim())        errs.name           = 'Name is required'
  if (!form.sku.trim())         errs.sku             = 'SKU is required'
  if (!form.gemType)            errs.gemType         = 'Gem type is required'
  if (!form.color.trim())       errs.color           = 'Color is required'
  if (!form.clarity)            errs.clarity         = 'Clarity is required'
  if (!form.shape)              errs.shape           = 'Shape is required'
  if (!form.weightInCarats || Number(form.weightInCarats) <= 0)
    errs.weightInCarats = 'Weight must be greater than 0'
  if (!form.price || Number(form.price) <= 0)
    errs.price = 'Price must be greater than 0'
  if (form.stockQuantity === '' || Number(form.stockQuantity) < 0)
    errs.stockQuantity = 'Stock quantity must be 0 or more'
  return errs
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const INITIAL_FORM = {
  name: '', sku: '', gemType: '', weightInCarats: '',
  color: '', clarity: '', cut: '', shape: '',
  lengthMM: '', widthMM: '', depthMM: '',
  origin: '', treatment: '', isNatural: true,
  certificationLab: '', certificateNumber: '',
  price: '', stockQuantity: '1', description: '',
}

export default function GemStoneCreate() {
  const navigate       = useNavigate()
  const toast          = useToast()
  const createMutation = useCreateGemStone()

  const [form, setForm]           = useState(INITIAL_FORM)
  const [errors, setErrors]       = useState({})
  const [images, setImages]       = useState([])
  const [thumbnailIndex, setThumb] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (submitted) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleRemoveImage = (idx) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (thumbnailIndex >= next.length) setThumb(0)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const firstKey = Object.keys(errs)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Build FormData — field names match your GemStoneCreateVM exactly
    const fd = new FormData()
    fd.append('Name',              form.name.trim())
    fd.append('SKU',               form.sku.trim())
    fd.append('GemType',           form.gemType)
    fd.append('WeightInCarats',    form.weightInCarats)
    fd.append('Color',             form.color.trim())
    fd.append('Clarity',           form.clarity)
    fd.append('Cut',               form.cut)
    fd.append('Shape',             form.shape)
    fd.append('LengthMM',          form.lengthMM  || '0')
    fd.append('WidthMM',           form.widthMM   || '0')
    fd.append('DepthMM',           form.depthMM   || '0')
    fd.append('Origin',            form.origin.trim())
    fd.append('Treatment',         form.treatment.trim())
    fd.append('IsNatural',         form.isNatural)
    fd.append('CertificationLab',  form.certificationLab.trim())
    fd.append('CertificateNumber', form.certificateNumber.trim())
    fd.append('Price',             form.price)
    fd.append('StockQuantity',     form.stockQuantity)
    fd.append('Description',       form.description.trim())

    // images — List<IFormFile> images in your controller
    images.forEach(file => fd.append('images', file))

    // thumbnailIndex — int thumbnailIndex in your controller
    fd.append('thumbnailIndex', thumbnailIndex)

    try {
      const res = await createMutation.mutateAsync(fd)
      toast.success('Gemstone created successfully')
      navigate(`/gemstones/${res.data.id}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const isLoading = createMutation.isPending

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '860px' }}>
      <BackButton />

      {/* Heading */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize: '12px', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gold-500)',
          fontWeight: 500, marginBottom: '6px',
        }}>
          New entry
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '34px', fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em', lineHeight: 1.1,
        }}>
          Add gemstone
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Fields marked <span style={{ color: 'var(--gold-500)' }}>*</span> are required
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Identity */}
        <Section title="Identity" subtitle="Basic identification details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Grid2>
              <Field id="field-name" label="Name" required error={errors.name}>
                <Input value={form.name} onChange={set('name')} placeholder="e.g. Burmese Ruby" error={errors.name} maxLength={200} />
              </Field>
              <Field id="field-sku" label="SKU" required error={errors.sku} hint="Unique stock keeping unit">
                <Input value={form.sku} onChange={set('sku')} placeholder="e.g. RB-001" error={errors.sku} maxLength={50} />
              </Field>
            </Grid2>
            <Field id="field-gemType" label="Gem type" required error={errors.gemType}>
              <Select value={form.gemType} onChange={set('gemType')} error={errors.gemType}>
                <option value="">Select gem type</option>
                {GEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description} onChange={set('description')}
                placeholder="Optional — origin story, notable characteristics, provenance…"
                maxLength={2000} rows={3}
              />
            </Field>
          </div>
        </Section>

        {/* The 4 Cs */}
        <Section title="The 4 Cs" subtitle="Industry-standard grading criteria">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Grid2>
              <Field id="field-weightInCarats" label="Weight (carats)" required error={errors.weightInCarats}>
                <Input type="number" step="0.01" min="0.01" max="1000"
                  value={form.weightInCarats} onChange={set('weightInCarats')}
                  placeholder="e.g. 2.45" error={errors.weightInCarats} />
              </Field>
              <Field id="field-color" label="Color" required error={errors.color}>
                <Input value={form.color} onChange={set('color')}
                  placeholder="e.g. Vivid Red" error={errors.color} maxLength={50} />
              </Field>
            </Grid2>
            <Grid2>
              <Field id="field-clarity" label="Clarity" required error={errors.clarity}>
                <Select value={form.clarity} onChange={set('clarity')} error={errors.clarity}>
                  <option value="">Select clarity</option>
                  {CLARITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Cut">
                <Select value={form.cut} onChange={set('cut')}>
                  <option value="">Select cut (optional)</option>
                  {CUT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </Grid2>
          </div>
        </Section>

        {/* Physical details */}
        <Section title="Physical details" subtitle="Shape and measurements">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Field id="field-shape" label="Shape" required error={errors.shape}>
              <Select value={form.shape} onChange={set('shape')} error={errors.shape}>
                <option value="">Select shape</option>
                {SHAPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Grid3>
              <Field label="Length (mm)">
                <Input type="number" step="0.01" min="0" value={form.lengthMM} onChange={set('lengthMM')} placeholder="0.00" />
              </Field>
              <Field label="Width (mm)">
                <Input type="number" step="0.01" min="0" value={form.widthMM} onChange={set('widthMM')} placeholder="0.00" />
              </Field>
              <Field label="Depth (mm)">
                <Input type="number" step="0.01" min="0" value={form.depthMM} onChange={set('depthMM')} placeholder="0.00" />
              </Field>
            </Grid3>
          </div>
        </Section>

        {/* Origin & sourcing */}
        <Section title="Origin & sourcing">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Grid2>
              <Field label="Origin" hint="Country or region of mining">
                <Input value={form.origin} onChange={set('origin')} placeholder="e.g. Burma, Colombia" maxLength={100} />
              </Field>
              <Field label="Treatment" hint="Any heat, filling, or enhancement">
                <Input value={form.treatment} onChange={set('treatment')} placeholder="e.g. None, Heat treated" maxLength={100} />
              </Field>
            </Grid2>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)',
              width: 'fit-content',
            }}>
              <input
                type="checkbox" checked={form.isNatural} onChange={set('isNatural')}
                style={{ accentColor: 'var(--gem-400)', width: '16px', height: '16px', marginTop: '2px' }}
              />
              <span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Natural gemstone</span>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  Uncheck for lab-grown or synthetic stones
                </span>
              </span>
            </label>
          </div>
        </Section>

        {/* Certification */}
        <Section title="Certification" subtitle="Optional grading laboratory details">
          <Grid2>
            <Field label="Certification lab">
              <Input value={form.certificationLab} onChange={set('certificationLab')} placeholder="e.g. GIA, AGL, Gübelin" maxLength={50} />
            </Field>
            <Field label="Certificate number">
              <Input value={form.certificateNumber} onChange={set('certificateNumber')} placeholder="e.g. 2143576890" maxLength={100} />
            </Field>
          </Grid2>
        </Section>

        {/* Pricing & inventory */}
        <Section title="Pricing & inventory">
          <Grid2>
            <Field id="field-price" label="Price (USD)" required error={errors.price}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  fontSize: '14px', pointerEvents: 'none',
                }}>$</span>
                <Input type="number" step="0.01" min="0.01"
                  value={form.price} onChange={set('price')}
                  placeholder="0.00" error={errors.price}
                  style={{ paddingLeft: '26px' }} />
              </div>
            </Field>
            <Field id="field-stockQuantity" label="Stock quantity" required error={errors.stockQuantity}>
              <Input type="number" step="1" min="0"
                value={form.stockQuantity} onChange={set('stockQuantity')}
                placeholder="1" error={errors.stockQuantity} />
            </Field>
          </Grid2>
        </Section>

        {/* Images */}
        <Section title="Images" subtitle="Upload photos. Star one as the cover shown in the catalog.">
          <ImageUploader
            images={images}
            onAdd={files => setImages(prev => [...prev, ...files])}
            onRemove={handleRemoveImage}
            thumbnailIndex={thumbnailIndex}
            onThumbnailChange={setThumb}
          />
        </Section>

        {/* Submit row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
          <Link
            to="/"
            style={{
              padding: '11px 22px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'var(--surface-0)',
              color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-0)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-md)',
              background: isLoading ? 'var(--gem-300)' : 'var(--gem-500)',
              color: '#f2f2f2', border: 'none',
              fontSize: '14px', fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'var(--gem-400)' }}
            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = 'var(--gem-500)' }}
          >
            {isLoading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {isLoading ? 'Saving…' : 'Add gemstone'}
          </button>
        </div>

      </form>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .form-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}