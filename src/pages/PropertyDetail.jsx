import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { properties as mockData } from '../data/properties'
import { incrementView, trackLocalView } from '../lib/trackView'
import PropertyCard from '../components/PropertyCard'
import './PropertyDetail.css'

function norm(p) {
  if (!p) return null
  return { ...p,
    priceDisplay: p.priceDisplay||(p.price>=10000000?`₹${(p.price/10000000).toFixed(2)} Cr`:`₹${(p.price/100000).toFixed(0)} L`),
    pricePerSqft: p.pricePerSqft??p.price_per_sqft??0,
    builderTrust: p.builderTrust??p.builder_trust??0,
    legalScore:   p.legalScore??p.legal_score??0,
    sunlightHrs:  p.sunlightHrs??p.sunlight_hrs??0,
    reraId:  p.reraId??p.rera_id??'',
    tagType: p.tagType??p.tag_type??'blue',
    images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
  }
}


export default function PropertyDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [similar,  setSimilar]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [activeImg, setActiveImg]   = useState(0)
  const [lightbox,  setLightbox]    = useState(false)
  const [isFav,     setIsFav]       = useState(false)
  const [favLoad,   setFavLoad]     = useState(false)
  const [sent,      setSent]        = useState(false)
  const [name,  setName]    = useState('')
  const [phone, setPhone]   = useState('')
  const [msg,   setMsg]     = useState('')
  const [ok,    setOk]      = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load(); window.scrollTo(0,0) }, [id])
  useEffect(() => { if (user && property?.id) checkFav() }, [user, property?.id])

  async function load() {
    setLoading(true); setActiveImg(0); setIsFav(false); setSent(false)
    try {
      const numId = parseInt(id)
      if (!isNaN(numId)) {
        const { data } = await supabase.from('properties').select('*').eq('id',numId).single()
        if (data) {
          setProperty(norm(data)); trackLocalView(numId)
          incrementView(numId)
          const { data: sim } = await supabase.from('properties').select('*').eq('city',data.city).neq('id',numId).limit(3)
          setSimilar((sim||[]).map(norm)); setLoading(false); return
        }
      }
      const mock = mockData.find(p=>p.id===parseInt(id))
      setProperty(norm(mock))
      setSimilar(mockData.filter(p=>p.id!==parseInt(id)&&p.city===mock?.city).slice(0,3).map(norm))
    } catch {
      setProperty(norm(mockData.find(p=>p.id===parseInt(id))))
    }
    setLoading(false)
  }

  async function checkFav() {
    const { data } = await supabase.from('favorites').select('id').eq('user_id',user.id).eq('property_id',property.id).maybeSingle()
    setIsFav(!!data)
  }

  async function toggleFav(e) {
    e?.stopPropagation()
    if (!user) { navigate('/login'); return }
    setFavLoad(true)
    if (isFav) { await supabase.from('favorites').delete().eq('user_id',user.id).eq('property_id',property.id); setIsFav(false) }
    else        { await supabase.from('favorites').insert([{user_id:user.id,property_id:property.id}]); setIsFav(true) }
    setFavLoad(false)
  }

  async function handleContact(e) {
    e.preventDefault(); if (!ok) return
    setSubmitting(true)
    await supabase.from('inquiries').insert([{ property_id:isNaN(parseInt(id))?null:parseInt(id), property_title:property?.title, name, phone, message:msg, consent:true, status:'new', user_id:user?.id||null }])
    setSubmitting(false); setSent(true)
  }

  async function share() {
    try { await navigator.share({ title: property?.title, url: window.location.href }) }
    catch { await navigator.clipboard.writeText(window.location.href); alert('Link copied!') }
  }

  const prev = (e) => { e?.stopPropagation(); setActiveImg(i=>(i-1+property.images.length)%property.images.length) }
  const next = (e) => { e?.stopPropagation(); setActiveImg(i=>(i+1)%property.images.length) }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><div className="route-spinner"/></div>
  if (!property) return <div style={{padding:'8rem 2rem',textAlign:'center'}}><h2>Property not found</h2><Link to="/listings" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>← Back</Link></div>

  const { title,type,status,location,city,priceDisplay,pricePerSqft,bhk,sqft,floor,facing,builder,builderId,builderTrust,legalScore,sunlightHrs,reraId,possession,amenities,highlights,images,description,tag,tagType } = property
  const tC = builderTrust>=9?'score-high':builderTrust>=7.5?'score-mid':'score-low'
  const lC = legalScore>=8.5?'score-high':legalScore>=7?'score-mid':'score-low'

  return (
    <div className="detail-page">
      {/* LIGHTBOX */}
      {lightbox && (
        <div className="lightbox" onClick={()=>setLightbox(false)}>
          <button className="lb-close" onClick={()=>setLightbox(false)}>✕</button>
          <button className="lb-prev" onClick={prev}>‹</button>
          <img src={images[activeImg]} alt="" className="lb-img" onClick={e=>e.stopPropagation()}/>
          <button className="lb-next" onClick={next}>›</button>
          <div className="lb-counter">{activeImg+1} / {images.length}</div>
        </div>
      )}

      <div className="breadcrumb-bar"><div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><span>›</span>
          <Link to="/listings">Properties</Link><span>›</span>
          <Link to={`/listings?city=${city}`}>{city}</Link><span>›</span>
          <span>{title}</span>
        </div>
      </div></div>

      <div className="container detail-layout">
        <div className="detail-main">
          {/* GALLERY */}
          <div className="gallery">
            <div className="gallery-main" onClick={()=>setLightbox(true)}>
              <img src={images[activeImg]} alt={title} className="gallery-main-img"/>
              <div className="gallery-hint">🔍 Click to expand</div>
              <div className="gallery-badges">
                {tag && <span className={`badge badge-${tagType}`}>{tag}</span>}
                {reraId && <span className="badge badge-green">✓ RERA</span>}
              </div>
              <div className="gallery-btns">
                <button className={`gal-btn fav-btn ${isFav?'active':''}`} onClick={toggleFav} disabled={favLoad} title={isFav?'Remove':'Save'}>
                  {isFav?'❤️':'🤍'}
                </button>
                <button className="gal-btn share-btn" onClick={e=>{e.stopPropagation();share()}} title="Share">📤</button>
              </div>
              {images.length>1 && <>
                <button className="gal-arrow left" onClick={prev}>‹</button>
                <button className="gal-arrow right" onClick={next}>›</button>
                <div className="gal-dots">{images.map((_,i)=><span key={i} className={`gal-dot ${i===activeImg?'active':''}`} onClick={e=>{e.stopPropagation();setActiveImg(i)}}/>)}</div>
              </>}
            </div>
            {images.length>1 && (
              <div className="gallery-thumbs">
                {images.map((img,i)=>(
                  <button key={i} className={`gallery-thumb ${activeImg===i?'active':''}`} onClick={()=>setActiveImg(i)}>
                    <img src={img} alt={`${i+1}`}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* HEADER */}
          <div className="detail-header">
            <div className="detail-title-row">
              <div>
                <h1 className="detail-title">{title}</h1>
                <div className="detail-loc"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{location}</div>
              </div>
              <div className="detail-price-block">
                <div className="detail-price">{priceDisplay}</div>
                {pricePerSqft>0 && <div className="detail-psf">₹{Number(pricePerSqft).toLocaleString()} / sqft</div>}
              </div>
            </div>
            <div className="detail-specs">
              {bhk       && <div className="spec-item"><div className="spec-icon">🛏</div><div className="spec-val">{bhk} BHK</div><div className="spec-lbl">Bedrooms</div></div>}
              {sqft      && <div className="spec-item"><div className="spec-icon">📐</div><div className="spec-val">{sqft} sqft</div><div className="spec-lbl">Area</div></div>}
              {floor     && <div className="spec-item"><div className="spec-icon">🏢</div><div className="spec-val">{floor}</div><div className="spec-lbl">Floor</div></div>}
              {facing    && <div className="spec-item"><div className="spec-icon">🧭</div><div className="spec-val">{facing}</div><div className="spec-lbl">Facing</div></div>}
              {possession && <div className="spec-item"><div className="spec-icon">📅</div><div className="spec-val">{possession}</div><div className="spec-lbl">Possession</div></div>}
              {type      && <div className="spec-item"><div className="spec-icon">🏷</div><div className="spec-val">{type}</div><div className="spec-lbl">Type</div></div>}
            </div>
          </div>

          {(builderTrust>0||legalScore>0||sunlightHrs>0) && (
            <div className="detail-section">
              <h2 className="detail-section-title">Trust Scores</h2>
              <div className="trust-scores-grid">
                {builderTrust>0 && <div className="ts-card"><div className={`score-ring ${tC}`}>{builderTrust}</div><div className="ts-info"><div className="ts-label">Builder Trust Index</div><div className="ts-desc">Execution, legal, customer, bank, market.</div></div></div>}
                {legalScore>0   && <div className="ts-card"><div className={`score-ring ${lC}`}>{legalScore}</div><div className="ts-info"><div className="ts-label">Legal Score</div><div className="ts-desc">RERA, EC, ownership chain verified.{reraId&&<div className="ts-rera">RERA: <strong>{reraId}</strong></div>}</div></div></div>}
                {sunlightHrs>0  && <div className="ts-card"><div className="score-ring score-high">{sunlightHrs}h</div><div className="ts-info"><div className="ts-label">Daily Sunlight</div><div className="ts-desc">Geometry-based simulation.</div></div></div>}
              </div>
            </div>
          )}

          {description && (
            <div className="detail-section">
              <h2 className="detail-section-title">About this Property</h2>
              <p className="detail-desc">{description}</p>
              {highlights?.length>0 && <div className="highlights">{highlights.map((h,i)=><div key={i} className="highlight-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{h}</div>)}</div>}
            </div>
          )}

          {amenities?.length>0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">Amenities</h2>
              <div className="amenities-grid">{amenities.map(a=><div key={a} className="amenity-item"><div className="amenity-dot"></div>{a}</div>)}</div>
            </div>
          )}

          {reraId && <div className="detail-section"><div className="rera-box"><div className="rera-icon">✓</div><div><div className="rera-title">RERA Registered</div><div className="rera-id">{reraId}</div><div className="rera-note">Sourced from official RERA portal.</div></div></div></div>}
        </div>

        {/* SIDEBAR */}
        <div className="detail-sidebar">
          <div className="contact-card">
            <div className="contact-header">
              <div className="contact-price">{priceDisplay}</div>
              {pricePerSqft>0&&bhk && <div className="contact-psf">₹{Number(pricePerSqft).toLocaleString()}/sqft · {bhk} BHK</div>}
            </div>
            {sent ? (
              <div className="contact-success">
                <div className="success-icon">✅</div>
                <h4>Request Received!</h4>
                <p>A verified advisor will contact you within 24 hours.</p>
                <div className="badge badge-green" style={{marginTop:8,display:'inline-flex'}}>Consent Recorded</div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContact}>
                <h3 className="contact-form-title">Schedule a Site Visit</h3>
                <input className="input" placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} required style={{marginBottom:10}}/>
                <input className="input" placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} required type="tel" style={{marginBottom:10}}/>
                <textarea className="input" placeholder="Message (optional)" value={msg} onChange={e=>setMsg(e.target.value)} rows={2} style={{marginBottom:10,resize:'none'}}/>
                <label className="consent-check">
                  <input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)} required/>
                  <span>I consent to being contacted for this property only.</span>
                </label>
                <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:14,justifyContent:'center'}} disabled={submitting}>
                  {submitting?'Submitting…':'📅 Request Site Visit'}
                </button>
                <button type="button" className="btn btn-secondary" style={{width:'100%',marginTop:8,justifyContent:'center'}} onClick={toggleFav}>
                  {isFav?'❤️ Saved to Wishlist':'🤍 Save to Wishlist'}
                </button>
                <div className="contact-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  One advisor per property. Zero spam calls.
                </div>
              </form>
            )}
          </div>

          {builder && (
            <div className="builder-mini-card">
              <div className="builder-mini-header">
                <div className="builder-mini-avatar">{builder.charAt(0)}</div>
                <div>
                  <div className="builder-mini-name">{builder}</div>
                  {builderTrust>0 && <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}><div className={`score-ring ${tC}`} style={{width:32,height:32,fontSize:12}}>{builderTrust}</div><span style={{fontSize:11,color:'var(--gray-500)'}}>Trust Score</span></div>}
                </div>
              </div>
              {builderId && <Link to={`/builder/${builderId}`} className="btn btn-secondary btn-sm" style={{width:'100%',justifyContent:'center',marginTop:10}}>View All Projects →</Link>}
            </div>
          )}
        </div>
      </div>

      {similar.length>0 && (
        <div className="container" style={{paddingBottom:'4rem'}}>
          <h2 className="detail-section-title" style={{margin:'2rem 0 1.5rem'}}>Similar in {city}</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.25rem'}}>
            {similar.map((p,i)=><PropertyCard key={p.id||i} property={p}/>)}
          </div>
        </div>
      )}
    </div>
  )
}
