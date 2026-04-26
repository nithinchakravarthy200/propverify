import { useParams, Link } from 'react-router-dom'
import { builders, properties } from '../data/properties'
import PropertyCard from '../components/PropertyCard'
import './BuilderDetail.css'

export default function BuilderDetail() {
  const { id } = useParams()
  const builder = builders.find(b => b.id === parseInt(id))
  const builderProps = properties.filter(p => p.builderId === parseInt(id))

  if (!builder) return (
    <div style={{padding:'8rem 2rem', textAlign:'center'}}>
      <h2>Builder not found</h2>
      <Link to="/listings" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>← Back to Listings</Link>
    </div>
  )

  const dims = [
    { label: 'Execution Reliability', value: builder.executionScore, icon: '🏗' },
    { label: 'Legal & Compliance', value: builder.legalScore, icon: '⚖️' },
    { label: 'Customer Experience', value: builder.customerScore, icon: '🤝' },
    { label: 'Bank Confidence', value: builder.bankScore, icon: '🏦' },
    { label: 'Market Integrity', value: builder.marketScore, icon: '📈' },
  ]

  return (
    <div className="builder-page">
      <div className="builder-hero" style={{background: `linear-gradient(135deg, ${builder.color}, #0f2744)`}}>
        <div className="container builder-hero-content">
          <div className="builder-avatar-lg">{builder.logo}</div>
          <div className="builder-hero-info">
            <h1 className="builder-hero-name">{builder.name}</h1>
            <div className="builder-hero-meta">
              <span>Est. {builder.established}</span>
              <span>·</span>
              <span>{builder.projects}+ Projects</span>
              <span>·</span>
              <span>{builder.delivered} Delivered</span>
              <span>·</span>
              <span>{builder.cities.join(', ')}</span>
            </div>
          </div>
          <div className="builder-hero-score">
            <div className="big-score">{builder.trustScore}</div>
            <div className="big-score-label">Trust Score</div>
          </div>
        </div>
      </div>

      <div className="container builder-layout">
        {/* LEFT */}
        <div className="builder-main">
          {/* TRUST INDEX */}
          <div className="builder-section">
            <h2 className="builder-section-title">Builder Trust Index</h2>
            <p className="builder-section-sub">5-dimension verified score. Not a star rating. Data from RERA, court records, customer reports, and bank approvals.</p>
            <div className="trust-dims">
              {dims.map(d => (
                <div key={d.label} className="trust-dim">
                  <div className="td-icon">{d.icon}</div>
                  <div className="td-info">
                    <div className="td-label">{d.label}</div>
                    <div className="td-bar-wrap">
                      <div className="td-bar">
                        <div className="td-bar-fill" style={{width:`${d.value}%`}}></div>
                      </div>
                      <span className="td-score">{d.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPLIANCE */}
          <div className="builder-section">
            <h2 className="builder-section-title">Legal & Compliance Record</h2>
            <div className="compliance-grid">
              <div className={`compliance-item ${builder.reraComplaints === 0 ? 'good' : builder.reraComplaints <= 3 ? 'mid' : 'bad'}`}>
                <div className="comp-num">{builder.reraComplaints}</div>
                <div className="comp-label">RERA Complaints</div>
              </div>
              <div className={`compliance-item ${builder.courtCases === 0 ? 'good' : 'mid'}`}>
                <div className="comp-num">{builder.courtCases}</div>
                <div className="comp-label">Active Court Cases</div>
              </div>
              <div className="compliance-item good">
                <div className="comp-num">{builder.delivered}</div>
                <div className="comp-label">Projects Delivered</div>
              </div>
              <div className="compliance-item good">
                <div className="comp-num">{builder.cities.length}</div>
                <div className="comp-label">Cities Active</div>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div className="builder-section">
            <h2 className="builder-section-title">About {builder.name}</h2>
            <p className="builder-about">{builder.about}</p>
            <div className="builder-cities">
              {builder.cities.map(c => (
                <Link key={c} to={`/listings?city=${c}`} className="city-pill">{c}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="builder-sidebar">
          <div className="builder-stat-card">
            <div className="bs-item">
              <div className="bs-num">{builder.projects}+</div>
              <div className="bs-label">Total Projects</div>
            </div>
            <hr className="divider" />
            <div className="bs-item">
              <div className="bs-num">{builder.delivered}</div>
              <div className="bs-label">Delivered</div>
            </div>
            <hr className="divider" />
            <div className="bs-item">
              <div className="bs-num">{builder.established}</div>
              <div className="bs-label">Established</div>
            </div>
            <hr className="divider" />
            <div className="bs-item">
              <div className="bs-num" style={{color:'var(--green)'}}>{builder.trustScore}</div>
              <div className="bs-label">Trust Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* PROPERTIES */}
      {builderProps.length > 0 && (
        <div className="container" style={{paddingBottom:'4rem'}}>
          <h2 className="builder-section-title" style={{marginBottom:'1.5rem'}}>
            Properties by {builder.name}
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.25rem'}}>
            {builderProps.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
