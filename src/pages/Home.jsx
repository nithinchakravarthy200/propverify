import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'
import { properties } from '../data/properties'
import './Home.css'

const stats = [
  { num: '54+', label: 'Feature Modules' },
  { num: '12K+', label: 'Verified Listings' },
  { num: '100%', label: 'RERA Linked' },
  { num: '₹0', label: 'Agent Markup' },
]

const trusts = [
  { icon: '⚖️', title: 'Legal Intelligence', desc: 'RERA, court records, ownership chain — explained, never just listed.' },
  { icon: '🌤', title: 'Sunlight Simulation', desc: 'Hour-by-hour sunlight data based on actual unit geometry.' },
  { icon: '📊', title: 'Builder Trust Index', desc: '5-dimension builder score replacing misleading star ratings.' },
  { icon: '🔒', title: 'Consent-First', desc: 'No lead generated without buyer consent. Zero spam calls.' },
  { icon: '🏗', title: 'Digital Twin', desc: 'Unit-level structural truth from CAD/OCR — not renders.' },
  { icon: '💰', title: 'Canonical Pricing', desc: 'One price. No agent markup. Immutable, auditable pricing engine.' },
]

const cities = [
  { name: 'Hyderabad', count: 1840, img: 'https://images.unsplash.com/photo-1652191478481-7e5c0de7f5a6?w=400&q=80' },
  { name: 'Bangalore', count: 2640, img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80' },
  { name: 'Mumbai', count: 3210, img: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80' },
  { name: 'Gurgaon', count: 1290, img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80' },
]

export default function Home() {
  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
            alt="Real estate"
            className="hero-bg-img"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">India's First Real Estate Truth Platform</div>
            <h1 className="hero-headline">
              Find Your <em>Perfect Home</em><br />With Verified Data
            </h1>
            <p className="hero-sub">
              No brochures. No agent markup. No spam calls.<br />
              RERA-linked listings with Builder Trust Index and Legal Scores.
            </p>
          </div>
          <SearchBar variant="hero" />
          <div className="hero-tags">
            <span>Popular:</span>
            <Link to="/listings?area=Gachibowli">Gachibowli</Link>
            <Link to="/listings?area=Kondapur">Kondapur</Link>
            <Link to="/listings?area=Whitefield">Whitefield</Link>
            <Link to="/listings?area=Hitech City">Hitech City</Link>
            <Link to="/listings?city=Mumbai">Navi Mumbai</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-bar">
        <div className="container stats-inner">
          {stats.map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="section">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <div className="section-eyebrow">Featured Properties</div>
              <h2 className="section-title">Verified <em>New Projects</em></h2>
            </div>
            <Link to="/listings" className="btn btn-secondary">View All →</Link>
          </div>
          <div className="props-grid">
            {properties.slice(0, 4).map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="trust-section">
        <div className="container">
          <div className="section-header" style={{textAlign:'center', maxWidth:520, margin:'0 auto 3rem'}}>
            <div className="section-eyebrow">Why TrustOS</div>
            <h2 className="section-title">We didn't digitize real estate.<br/>We <em>removed ambiguity</em> from it.</h2>
          </div>
          <div className="trust-grid">
            {trusts.map(t => (
              <div key={t.title} className="trust-card">
                <div className="trust-icon">{t.icon}</div>
                <div className="trust-title">{t.title}</div>
                <div className="trust-desc">{t.desc}</div>
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
            {cities.map(c => (
              <Link to={`/listings?city=${c.name}`} key={c.name} className="city-card">
                <img src={c.img} alt={c.name} />
                <div className="city-overlay">
                  <div className="city-name">{c.name}</div>
                  <div className="city-count">{c.count.toLocaleString()} properties</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MORE LISTINGS */}
      <section className="section">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <div className="section-eyebrow">Just Listed</div>
              <h2 className="section-title">Ready to <em>Move In</em></h2>
            </div>
            <Link to="/listings?status=Ready+to+Move" className="btn btn-secondary">View All →</Link>
          </div>
          <div className="props-grid">
            {properties.filter(p => p.status === 'Ready to Move').map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2>Post Your Property <em>for Free</em></h2>
            <p>Reach verified buyers directly. No commission. No middlemen. Full control.</p>
            <div className="cta-actions">
              <button className="btn btn-amber btn-lg">Post Property Free</button>
              <button className="btn btn-outline-white btn-lg">Know More</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
