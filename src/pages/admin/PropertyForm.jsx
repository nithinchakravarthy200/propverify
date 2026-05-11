import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import './PropertyForm.css'

const AMENITIES_OPTIONS = ['Gym','Swimming Pool','Clubhouse','Power Backup','24/7 Security','Parking','Kids Play Area','Jogging Track','Tennis Court','EV Charging','Co-working Space','Spa','Sky Deck','Garden']

const emptyForm = {
  title:'', type:'Apartment', status:'Ready to Move', city:'', area:'', location:'',
  price:'', price_per_sqft:'', bhk:2, sqft:'', floor:'', facing:'',
  builder:'', builder_trust:'', legal_score:'', sunlight_hrs:'',
  rera_id:'', possession:'', description:'', tag:'', tag_type:'green',
  amenities:[], highlights:'', is_featured: false,
}

export default function PropertyForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState(emptyForm)
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadingData, setLoadingData] = useState(isEdit)

  useEffect(() => {
    if (isEdit) loadProperty()
  }, [id])

  async function loadProperty() {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single()
    if (data) {
      setForm({
        title: data.title || '',
        type: data.type || 'Apartment',
        status: data.status || 'Ready to Move',
        city: data.city || '',
        area: data.area || '',
        location: data.location || '',
        price: data.price || '',
        price_per_sqft: data.price_per_sqft || '',
        bhk: data.bhk || 2,
        sqft: data.sqft || '',
        floor: data.floor || '',
        facing: data.facing || '',
        builder: data.builder || '',
        builder_trust: data.builder_trust || '',
        legal_score: data.legal_score || '',
        sunlight_hrs: data.sunlight_hrs || '',
        rera_id: data.rera_id || '',
        possession: data.possession || '',
        description: data.description || '',
        tag: data.tag || '',
        tag_type: data.tag_type || 'green',
        amenities: data.amenities || [],
        highlights: (data.highlights || []).join(', '),
        is_featured: data.is_featured || false,
      })
      setExistingImages(data.images || [])
    }
    setLoadingData(false)
  }

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + existingImages.length + newFiles.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }
    setNewFiles(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(i => i !== url))
  }

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }))
  }

  async function uploadImages() {
    const urls = [...existingImages]
    for (const file of newFiles) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('property-images').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(data.path)
      urls.push(publicUrl)
    }
    return urls
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title || !form.city || !form.price) {
      setError('Title, City and Price are required')
      return
    }
    setSaving(true)
    setUploading(newFiles.length > 0)
    try {
      const imageUrls = await uploadImages()
      setUploading(false)
      const payload = {
        ...form,
        price: parseInt(form.price),
        price_per_sqft: parseInt(form.price_per_sqft) || 0,
        bhk: parseInt(form.bhk),
        sqft: parseInt(form.sqft) || 0,
        builder_trust: parseFloat(form.builder_trust) || 0,
        legal_score: parseFloat(form.legal_score) || 0,
        sunlight_hrs: parseFloat(form.sunlight_hrs) || 0,
        highlights: form.highlights ? form.highlights.split(',').map(h => h.trim()).filter(Boolean) : [],
        images: imageUrls,
        updated_at: new Date().toISOString(),
        ...(!isEdit && { created_by: user?.id }),
      }
      if (isEdit) {
        await supabase.from('properties').update(payload).eq('id', id)
      } else {
        await supabase.from('properties').insert([payload])
      }
      navigate('/admin/properties')
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loadingData) return <div style={{padding:'3rem',textAlign:'center'}}>Loading property data...</div>

  return (
    <div className="property-form-page">
      <div className="pf-header">
        <h1>{isEdit ? 'Edit Property' : 'Add New Property'}</h1>
        <p>{isEdit ? 'Update property details and images' : 'Fill in the details to list a new property'}</p>
      </div>

      {error && <div className="pf-error">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="pf-form">

        {/* BASIC INFO */}
        <div className="pf-section">
          <h2 className="pf-section-title">Basic Information</h2>
          <div className="pf-grid-2">
            <div className="pf-field">
              <label>Property Title *</label>
              <input className="input" placeholder="e.g. Prestige Meridian Tower 3" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="pf-field">
              <label>Builder / Developer</label>
              <input className="input" placeholder="e.g. Prestige Group" value={form.builder} onChange={e => set('builder', e.target.value)} />
            </div>
          </div>
          <div className="pf-grid-3">
            <div className="pf-field">
              <label>Property Type</label>
              <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                {['Apartment','Villa','Plot','Commercial'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pf-field">
              <label>Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Ready to Move</option>
                <option>Under Construction</option>
              </select>
            </div>
            <div className="pf-field">
              <label>Possession</label>
              <input className="input" placeholder="e.g. Ready / Dec 2026" value={form.possession} onChange={e => set('possession', e.target.value)} />
            </div>
          </div>
          <div className="pf-field">
            <label>Description</label>
            <textarea className="input pf-textarea" placeholder="Describe the property..." value={form.description} onChange={e => set('description', e.target.value)} rows={4} />
          </div>
        </div>

        {/* LOCATION */}
        <div className="pf-section">
          <h2 className="pf-section-title">Location</h2>
          <div className="pf-grid-3">
            <div className="pf-field">
              <label>City *</label>
              <input className="input" placeholder="e.g. Hyderabad" value={form.city} onChange={e => set('city', e.target.value)} required />
            </div>
            <div className="pf-field">
              <label>Area / Locality</label>
              <input className="input" placeholder="e.g. Gachibowli" value={form.area} onChange={e => set('area', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Full Location</label>
              <input className="input" placeholder="e.g. Gachibowli, Hyderabad" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className="pf-section">
          <h2 className="pf-section-title">Pricing & Size</h2>
          <div className="pf-grid-3">
            <div className="pf-field">
              <label>Price (₹) *</label>
              <input className="input" type="number" placeholder="e.g. 8700000" value={form.price} onChange={e => set('price', e.target.value)} required />
            </div>
            <div className="pf-field">
              <label>Price per Sqft (₹)</label>
              <input className="input" type="number" placeholder="e.g. 6800" value={form.price_per_sqft} onChange={e => set('price_per_sqft', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>BHK</label>
              <select className="select" value={form.bhk} onChange={e => set('bhk', e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
              </select>
            </div>
            <div className="pf-field">
              <label>Area (sqft)</label>
              <input className="input" type="number" placeholder="e.g. 1580" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Floor</label>
              <input className="input" placeholder="e.g. 12th of 28" value={form.floor} onChange={e => set('floor', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Facing</label>
              <select className="select" value={form.facing} onChange={e => set('facing', e.target.value)}>
                <option value="">Select</option>
                {['East','West','North','South','North-East','North-West','South-East','South-West'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* TRUST SCORES */}
        <div className="pf-section">
          <h2 className="pf-section-title">Trust Scores & RERA</h2>
          <div className="pf-grid-3">
            <div className="pf-field">
              <label>Builder Trust Score (0–10)</label>
              <input className="input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 9.1" value={form.builder_trust} onChange={e => set('builder_trust', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Legal Score (0–10)</label>
              <input className="input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 8.7" value={form.legal_score} onChange={e => set('legal_score', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Daily Sunlight (hrs)</label>
              <input className="input" type="number" step="0.1" min="0" max="12" placeholder="e.g. 7.4" value={form.sunlight_hrs} onChange={e => set('sunlight_hrs', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>RERA ID</label>
              <input className="input" placeholder="e.g. P02400003456" value={form.rera_id} onChange={e => set('rera_id', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Tag Label</label>
              <input className="input" placeholder="e.g. RERA Verified" value={form.tag} onChange={e => set('tag', e.target.value)} />
            </div>
            <div className="pf-field">
              <label>Tag Color</label>
              <select className="select" value={form.tag_type} onChange={e => set('tag_type', e.target.value)}>
                <option value="green">Green (Verified)</option>
                <option value="amber">Amber (Under Construction)</option>
                <option value="blue">Blue (New Launch)</option>
                <option value="navy">Navy (Premium)</option>
              </select>
            </div>
          </div>
          <div className="pf-field" style={{marginTop:'0.5rem'}}>
            <label>Highlights (comma separated)</label>
            <input className="input" placeholder="e.g. Corner unit, Park-facing balcony, Premium fittings" value={form.highlights} onChange={e => set('highlights', e.target.value)} />
          </div>
        </div>

        {/* AMENITIES */}
        <div className="pf-section">
          <h2 className="pf-section-title">Amenities</h2>
          <div className="amenity-grid">
            {AMENITIES_OPTIONS.map(a => (
              <label key={a} className={`amenity-checkbox ${form.amenities.includes(a) ? 'checked' : ''}`}>
                <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{display:'none'}} />
                <span className="amenity-check-icon">{form.amenities.includes(a) ? '✓' : '+'}</span>
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="pf-section">
          <h2 className="pf-section-title">Property Images</h2>
          <p className="pf-section-sub">Upload up to 10 images. First image will be the cover photo.</p>

          {/* existing images */}
          {existingImages.length > 0 && (
            <div className="img-grid">
              {existingImages.map((url, i) => (
                <div key={url} className="img-thumb">
                  <img src={url} alt={`Image ${i+1}`} />
                  {i === 0 && <div className="img-cover-label">Cover</div>}
                  <button type="button" className="img-remove" onClick={() => removeExistingImage(url)}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* new file previews */}
          {previews.length > 0 && (
            <div className="img-grid" style={{marginTop: existingImages.length > 0 ? '10px' : '0'}}>
              {previews.map((url, i) => (
                <div key={i} className="img-thumb img-thumb-new">
                  <img src={url} alt={`New ${i+1}`} />
                  <div className="img-new-label">New</div>
                  <button type="button" className="img-remove" onClick={() => removeNewFile(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* upload zone */}
          <label className="upload-zone">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
            <div className="upload-zone-icon">📷</div>
            <div className="upload-zone-text">Click to upload images</div>
            <div className="upload-zone-sub">PNG, JPG, WEBP · Max 10 images · 5MB each</div>
          </label>
        </div>

        {/* SETTINGS */}
        <div className="pf-section">
          <h2 className="pf-section-title">Display Settings</h2>
          <label className="pf-toggle">
            <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb"></span></span>
            <span className="pf-toggle-label">Feature this property on the homepage</span>
          </label>
        </div>

        {/* SUBMIT */}
        <div className="pf-submit">
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/admin/properties')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {uploading ? '📤 Uploading images...' : saving ? '💾 Saving...' : isEdit ? '✓ Update Property' : '✓ Publish Property'}
          </button>
        </div>
      </form>
    </div>
  )
}
