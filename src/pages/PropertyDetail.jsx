import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { properties } from '../data/properties'
import PropertyCard from '../components/PropertyCard'
import './PropertyDetail.css'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const property = properties.find(p => p.id === parseInt(id))
  const [activeImg, setActiveImg] = useState(0)
  const [contactSent, setContactSent] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)

  if (!property) return (
    <div style={{padding:'8rem 2rem',textAlign:'center'}}>
      <h2>Property not found</h2>
      <Link to="/listings" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>← Back to Listings</Link>
    </div>
  )

  const {
    title, type, status, location, city, area,
    priceDisplay, pricePerSqft, bhk, sqft, floor, facing,
    builder, builderId, builderTrust, legalScore, sunlightHrs,
    reraId, possession, amenities, highlights, images, description,
    tag, tagType
  } = property

  const similar = properties.filter(p => p.id !== property.id && p.city === city).slice(0, 3)

  const trustColor = builderTrust >= 9 ? 'score-high' : builderTrust >= 7.5 ? 'score-mid' : 'score-low'
  const legalColor = legalScore >= 8.5 ? 'score-high' : legalScore >= 7 ? 'score-mid' : 'score-low'

  const handleContact = (e) => {
    e.preventDefault()
    if (name && phone && consent) setContactSent(true)
  }

  return (
    <div className="detail-page">
      {/* BREADCRUMB */}
      <div className="breadcrumb-bar">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/listings">Properties</Link>
            <span>›</span>
            <Link to={`/listings?city=${city}`}>{city}</Link>
            <span>›</span>
            <span>{title}</span>
          </div>
        </div>
      </div>

      <div className="container detail-layout">
        {/* LEFT COLUMN */}
        <div className="detail-main">
          {/* GALLERY */}
          <div className="gallery">
            <div className="gallery-main">
              <img src={images[activeImg]} alt={title} className="gallery-main-img" />
              <div className="gallery-tag">
                <span className={`badge badge-${tagType}`}>{tag}</span>
                {reraId && <span className="badge badge-green">✓ RERA Verified</span>}
              </div>
            </div>
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`gallery-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`View ${i+1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* HEADER */}
          <div className="detail-header">
            <div className="detail-title-row">
              <div>
                <h1 className="detail-title">{title}</h1>
                <div className="detail-loc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {location}
                </div>
              </div>
              <div className="detail-price-block">
                <div className="detail-price">{priceDisplay}</div>
                <div className="detail-psf">₹{pricePerSqft.toLocaleString()} / sqft</div>
              </div>
            </div>

            <div className="detail-specs">
              <div className="spec-item"><div className="spec-icon">🛏</div><div className="spec-val">{bhk} BHK</div><div className="spec-lbl">Bedrooms</div></div>
              <div className="spec-item"><div className="spec-icon">📐</div><div className="spec-val">{sqft} sqft</div><div className="spec-lbl">Carpet Area</div></div>
              <div className="spec-item"><div className="spec-icon">🏢</div><div className="spec-val">{floor}</div><div className="spec-lbl">Floor</div></div>
              <div className="spec-item"><div className="spec-icon">🧭</div><div className="spec-val">{facing}</div><div className="spec-lbl">Facing</div></div>
              <div className="spec-item"><div className="spec-icon">📅</div><div className="spec-val">{possession}</div><div className="spec-lbl">Possession</div></div>
              <div className="spec-item"><div className="spec-icon">🏷</div><div className="spec-val">{type}</div><div className="spec-lbl">Type</div></div>
            </div>
          </div>

          {/* TRUST SCORES */}
          <div className="detail-section">
            <h2 className="detail-section-title">TrustOS Scores</h2>
            <div className="trust-scores-grid">
              <div className="ts-card">
                <div className={`score-ring ${trustColor}`}>{builderTrust}</div>
                <div className="ts-info">
                  <div className="ts-label">Builder Trust Index</div>
                  <div className="ts-desc">5-dimension verified score — execution, legal, customer, bank confidence, market integrity.</div>
                  <Link to={`/builder/${builderId}`} className="ts-link">View builder profile →</Link>
                </div>
              </div>
              <div className="ts-card">
                <div className={`score-ring ${legalColor}`}>{legalScore}</div>
                <div className="ts-info">
                  <div className="ts-label">Legal Score</div>
                  <div className="ts-desc">RERA status, EC verification, ownership chain, court case check.</div>
                  {reraId && <div className="ts-rera">RERA: <strong>{reraId}</strong></div>}
                </div>
              </div>
              <div className="ts-card">
                <div className="score-ring score-high">{sunlightHrs}h</div>
                <div className="ts-info">
                  <div className="ts-label">Daily Sunlight</div>
                  <div className="ts-desc">Average daily sunlight based on unit orientation, floor height, and adjacent building geometry.</div>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="detail-section">
            <h2 className="detail-section-title">About this Property</h2>
            <p className="detail-desc">{description}</p>
            {highlights.length > 0 && (
              <div className="highlights">
                {highlights.map(h => (
                  <div key={h} className="highlight-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {h}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AMENITIES */}
          <div className="detail-section">
            <h2 className="detail-section-title">Amenities</h2>
            <div className="amenities-grid">
              {amenities.map(a => (
                <div key={a} className="amenity-item">
                  <div className="amenity-dot"></div>
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* RERA BOX */}
          {reraId && (
            <div className="detail-section">
              <div className="rera-box">
                <div className="rera-icon">✓</div>
                <div>
                  <div className="rera-title">RERA Registered Project</div>
                  <div className="rera-id">{reraId}</div>
                  <div className="rera-note">All data sourced from official RERA portal. Legal scores verified independently.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - CONTACT */}
        <div className="detail-sidebar">
          <div className="contact-card">
            <div className="contact-header">
              <div className="contact-price">{priceDisplay}</div>
              <div className="contact-psf">₹{pricePerSqft.toLocaleString()}/sqft · {bhk} BHK · {sqft} sqft</div>
            </div>

            {contactSent ? (
              <div className="contact-success">
                <div className="success-icon">✅</div>
                <h4>Request Received!</h4>
                <p>A verified advisor will contact you within 24 hours. No spam, no repeated calls — we promise.</p>
                <div className="badge badge-green" style={{marginTop:8}}>Consent Recorded</div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContact}>
                <h3 className="contact-form-title">Schedule a Site Visit</h3>
                <input
                  className="input" placeholder="Your Name" value={name}
                  onChange={e => setName(e.target.value)} required
                  style={{marginBottom:10}}
                />
                <input
                  className="input" placeholder="Phone Number" value={phone}
                  onChange={e => setPhone(e.target.value)} required type="tel"
                  style={{marginBottom:10}}
                />
                <label className="consent-check">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />
                  <span>I consent to being contacted by a verified advisor for this property only.</span>
                </label>
                <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:14,justifyContent:'center'}}>
                  Request Site Visit
                </button>
                <button type="button" className="btn btn-secondary" style={{width:'100%',marginTop:8,justifyContent:'center'}}>
                  📞 Call Builder
                </button>
                <div className="contact-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  TrustOS never sells your data. One advisor per property.
                </div>
              </form>
            )}
          </div>

          {/* BUILDER CARD */}
          <div className="builder-mini-card">
            <div className="builder-mini-header">
              <div className="builder-mini-avatar">{builder.charAt(0)}</div>
              <div>
                <div className="builder-mini-name">{builder}</div>
                <div className={`score-ring ${trustColor}`} style={{width:32,height:32,fontSize:12,display:'inline-flex',marginTop:4}}>
                  {builderTrust}
                </div>
                <span style={{fontSize:11,color:'var(--gray-500)',marginLeft:6}}>Trust Score</span>
              </div>
            </div>
            <Link to={`/builder/${builderId}`} className="btn btn-secondary btn-sm" style={{width:'100%',justifyContent:'center',marginTop:10}}>
              View All Projects →
            </Link>
          </div>
        </div>
      </div>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <div className="container" style={{paddingBottom:'4rem'}}>
          <div className="detail-section" style={{marginTop:'3rem'}}>
            <h2 className="detail-section-title">Similar Properties in {city}</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.25rem',marginTop:'1.5rem'}}>
              {similar.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
