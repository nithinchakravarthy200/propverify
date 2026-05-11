import { Link } from 'react-router-dom'
import './PropertyCard.css'

// Normalise both Supabase (snake_case) and mock (camelCase) shapes
function norm(p) {
  return {
    ...p,
    priceDisplay: p.priceDisplay || (p.price >= 10000000 ? `₹${(p.price/10000000).toFixed(2)} Cr` : `₹${(p.price/100000).toFixed(0)} L`),
    pricePerSqft: p.pricePerSqft ?? p.price_per_sqft ?? 0,
    builderTrust: p.builderTrust ?? p.builder_trust ?? 0,
    legalScore: p.legalScore ?? p.legal_score ?? 0,
    sunlightHrs: p.sunlightHrs ?? p.sunlight_hrs ?? 0,
    reraId: p.reraId ?? p.rera_id ?? '',
    tagType: p.tagType ?? p.tag_type ?? 'blue',
    images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
  }
}

export default function PropertyCard({ property }) {
  const p = norm(property)
  const { id, title, type, location, priceDisplay, pricePerSqft, bhk, sqft, builder, builderTrust, legalScore, sunlightHrs, images, tag, tagType, status, reraId, possession } = p
  const trustColor = builderTrust >= 9 ? 'score-high' : builderTrust >= 7.5 ? 'score-mid' : 'score-low'
  const legalColor = legalScore >= 8.5 ? 'score-high' : legalScore >= 7 ? 'score-mid' : 'score-low'

  return (
    <Link to={`/property/${id}`} className="prop-card card">
      <div className="prop-img-wrap">
        <img src={images[0]} alt={title} className="prop-img" loading="lazy" />
        <div className="prop-img-badges">
          {tag && <span className={`badge badge-${tagType}`}>{tag}</span>}
          {reraId && <span className="badge badge-green">✓ RERA</span>}
        </div>
        <div className="prop-img-status">{status}</div>
      </div>
      <div className="prop-body">
        <div className="prop-price-row">
          <div className="prop-price">{priceDisplay}</div>
          {pricePerSqft > 0 && <div className="prop-psf">₹{Number(pricePerSqft).toLocaleString()}/sqft</div>}
        </div>
        <div className="prop-title">{title}</div>
        {bhk && sqft && <div className="prop-sub">{bhk} BHK · {sqft} sqft · {type}</div>}
        <div className="prop-loc">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {location}
        </div>
        <hr className="divider" style={{margin:'10px 0'}} />
        <div className="prop-scores">
          {builderTrust > 0 && <div className="prop-score-item"><div className={`score-ring ${trustColor}`} style={{width:40,height:40,fontSize:13}}>{builderTrust}</div><div className="prop-score-lbl">Builder<br/>Trust</div></div>}
          {legalScore > 0 && <div className="prop-score-item"><div className={`score-ring ${legalColor}`} style={{width:40,height:40,fontSize:13}}>{legalScore}</div><div className="prop-score-lbl">Legal<br/>Score</div></div>}
          {sunlightHrs > 0 && <div className="prop-score-item"><div className="score-ring score-high" style={{width:40,height:40,fontSize:12}}>{sunlightHrs}h</div><div className="prop-score-lbl">Daily<br/>Sun</div></div>}
          <div className="prop-possession">
            {possession && <><div className="prop-poss-label">Possession</div><div className="prop-poss-val">{possession}</div></>}
          </div>
        </div>
        {builder && (
          <div className="prop-builder">
            <div className="builder-avatar">{builder.charAt(0)}</div>
            <span>{builder}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
