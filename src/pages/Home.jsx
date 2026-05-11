import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'
import { useProperties } from '../lib/useProperties'
import './Home.css'

const STATS = [
  { num:'12K+', label:'Verified Listings' },
  { num:'100%', label:'RERA Linked' },
  { num:'9.2',  label:'Avg Trust Score' },
  { num:'₹0',   label:'Agent Markup' },
]

const TRUST_FEATURES = [
  { icon:'⚖️', title:'Legal Intelligence',  desc:'RERA, court records, ownership chain — explained, not just listed.' },
  { icon:'🌤', title:'Sunlight Simulation',  desc:'Hour-by-hour sunlight data based on actual unit geometry.' },
  { icon:'📊', title:'Builder Trust Index',  desc:'5-dimension score replacing misleading star ratings.' },
  { icon:'🔒', title:'Consent-First Leads',  desc:'No lead generated without buyer consent. Zero spam calls.' },
  { icon:'🏗', title:'Digital Twin',          desc:'Unit-level structural truth from CAD/OCR — not renders.' },
  { icon:'💰', title:'Canonical Pricing',     desc:'One price. No agent markup. Immutable pricing engine.' },
]

const CITIES = [
  { name:'Hyderabad', img:'https://images.unsplash.com/photo-1652191478481-7e5c0de7f5a6?w=400&q=80' },
  { name:'Bangalore',  img:'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80' },
  { name:'Mumbai',     img:'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80' },
  { name:'Gurgaon',    img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80' },
]

export default function Home() {
  const { properties, loading } = useProperties()
  const featured = properties.filter(p => p.is_featured).slice(0, 4)
  const ready    = properties.filter(p => p.status === 'Ready to Move').slice(0, 4)

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80" alt="" className="hero-bg-img"/>
          <div className="hero-overlay"/>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">India's First Real Estate Truth Platform</div>
            <h1 className="hero-headline">Find Your <em>Perfect Home</em><br/>With Verified Data</h1>
            <p className="hero-sub">No brochures. No agent markup. No spam calls.<br/>RERA-linked listings with Builder Trust Index and Legal Scores.</p>
          </div>
          <SearchBar variant="hero"/>
          <div className="hero-tags">
            <span>Popular:</span>
            {['Gachibowli','Kondapur','Whitefield','Hitech City','Navi Mumbai'].map(a => (
              <Link key={a} to={`/listings?category=buy&q=${a}`}>{a}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="container stats-inner">
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="section">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <div className="section-eyebrow">Featured Properties</div>
              <h2 className="section-title">Verified <em>New Projects</em></h2>
            </div>
            <Link to="/listings?category=buy" className="btn btn-secondary">View All →</Link>
          </div>
          {loading ? (
            <div className="props-grid">{[...Array(4)].map((_,i)=><div key={i} className="prop-skel"><div className="skeleton" style={{height:200}}/><div style={{padding:'1rem'}}><div className="skeleton" style={{height:18,marginBottom:8}}/><div className="skeleton" style={{height:14,width:'60%'}}/></div></div>)}</div>
          ) : (
            <div className="props-grid">{(featured.length ? featured : properties.slice(0,4)).map(p=><PropertyCard key={p.id} property={p}/>)}</div>
          )}
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="trust-section">
        <div className="container">
          <div className="section-header" style={{textAlign:'center',maxWidth:520,margin:'0 auto 3rem'}}>
            <div className="section-eyebrow">Why TrustOS</div>
            <h2 className="section-title">We didn't digitize real estate.<br/>We <em>removed ambiguity</em> from it.</h2>
          </div>
          <div className="trust-grid">
            {TRUST_FEATURES.map(f => (
              <div key={f.title} className="trust-card">
                <div className="trust-icon">{f.icon}</div>
                <div className="trust-title">{f.title}</div>
                <div className="trust-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="section">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <div className="section-eyebrow">Explore by City</div>
              <h2 className="section-title">Top <em>Property Markets</em></h2>
            </div>
          </div>
          <div className="cities-grid">
            {CITIES.map(c => (
              <Link to={`/listings?category=buy&city=${c.name}`} key={c.name} className="city-card">
                <img src={c.img} alt={c.name}/>
                <div className="city-overlay">
                  <div className="city-name">{c.name}</div>
                  <div className="city-sub">Browse properties →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* READY TO MOVE */}
      {!loading && ready.length > 0 && (
        <section className="section" style={{paddingTop:0}}>
          <div className="container">
            <div className="section-header flex-between">
              <div>
                <div className="section-eyebrow">Just Listed</div>
                <h2 className="section-title">Ready to <em>Move In</em></h2>
              </div>
              <Link to="/listings?category=rent" className="btn btn-secondary">View All →</Link>
            </div>
            <div className="props-grid">{ready.map(p=><PropertyCard key={p.id} property={p}/>)}</div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2>Post Your Property <em>for Free</em></h2>
            <p>Reach verified buyers directly. No commission. No middlemen.</p>
            <div className="cta-actions">
              <Link to="/login" className="btn btn-amber btn-lg">Post Property Free</Link>
              <Link to="/listings" className="btn btn-outline-white btn-lg">Browse Listings</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
