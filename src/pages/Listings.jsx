import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SearchBar from '../components/SearchBar'
import { properties, cities, propertyTypes, bhkOptions, budgetRanges } from '../data/properties'
import './Listings.css'

const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Newest First', 'Trust Score']

export default function Listings() {
  const [searchParams] = useSearchParams()
  const [sort, setSort] = useState('Relevance')
  const [filterCity, setFilterCity] = useState(searchParams.get('city') || '')
  const [filterType, setFilterType] = useState(searchParams.get('type') || '')
  const [filterBhk, setFilterBhk] = useState(searchParams.get('bhk') || '')
  const [filterBudget, setFilterBudget] = useState(0)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRera, setFilterRera] = useState(false)
  const [filterReady, setFilterReady] = useState(false)

  const filtered = useMemo(() => {
    let res = [...properties]
    const q = searchParams.get('q') || ''
    if (q) res = res.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.location.toLowerCase().includes(q.toLowerCase()))
    if (filterCity) res = res.filter(p => p.city === filterCity)
    if (filterType) res = res.filter(p => p.type === filterType)
    if (filterBhk) res = res.filter(p => p.bhk === parseInt(filterBhk))
    if (filterBudget > 0) {
      const range = budgetRanges[filterBudget]
      res = res.filter(p => p.price >= range.min && p.price <= range.max)
    }
    if (filterStatus) res = res.filter(p => p.status === filterStatus)
    if (filterRera) res = res.filter(p => p.reraId)
    if (filterReady) res = res.filter(p => p.status === 'Ready to Move')

    if (sort === 'Price: Low to High') res.sort((a, b) => a.price - b.price)
    else if (sort === 'Price: High to Low') res.sort((a, b) => b.price - a.price)
    else if (sort === 'Trust Score') res.sort((a, b) => b.builderTrust - a.builderTrust)

    return res
  }, [filterCity, filterType, filterBhk, filterBudget, filterStatus, filterRera, filterReady, sort, searchParams])

  return (
    <div className="listings-page">
      {/* TOP BAR */}
      <div className="listings-topbar">
        <div className="container">
          <div className="topbar-search">
            <SearchBar variant="inline" />
          </div>
        </div>
      </div>

      <div className="container listings-layout">
        {/* SIDEBAR */}
        <aside className="listings-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Filters</h3>

            <div className="filter-group">
              <label className="filter-label">City</label>
              <select className="select" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                <option value="">All Cities</option>
                {cities.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Property Type</label>
              <div className="filter-pills">
                {['Apartment', 'Villa', 'Plot'].map(t => (
                  <button
                    key={t}
                    className={`filter-pill ${filterType === t ? 'active' : ''}`}
                    onClick={() => setFilterType(filterType === t ? '' : t)}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">BHK</label>
              <div className="filter-pills">
                {['1', '2', '3', '4'].map(b => (
                  <button
                    key={b}
                    className={`filter-pill ${filterBhk === b ? 'active' : ''}`}
                    onClick={() => setFilterBhk(filterBhk === b ? '' : b)}
                  >{b} BHK</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Budget</label>
              <select className="select" value={filterBudget} onChange={e => setFilterBudget(Number(e.target.value))}>
                {budgetRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-pills">
                {['Ready to Move', 'Under Construction'].map(s => (
                  <button
                    key={s}
                    className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Trust Filters</label>
              <div className="filter-checks">
                <label className="check-item">
                  <input type="checkbox" checked={filterRera} onChange={e => setFilterRera(e.target.checked)} />
                  <span>RERA Verified Only</span>
                </label>
                <label className="check-item">
                  <input type="checkbox" checked={filterReady} onChange={e => setFilterReady(e.target.checked)} />
                  <span>Ready to Move Only</span>
                </label>
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{width:'100%'}} onClick={() => {
              setFilterCity(''); setFilterType(''); setFilterBhk('');
              setFilterBudget(0); setFilterStatus(''); setFilterRera(false); setFilterReady(false);
            }}>Clear All Filters</button>
          </div>

          {/* TRUST INFO PANEL */}
          <div className="sidebar-card trust-info-card">
            <div className="trust-info-icon">🛡</div>
            <h4>TrustOS Promise</h4>
            <ul>
              <li>✓ Zero duplicate listings</li>
              <li>✓ Verified builder scores</li>
              <li>✓ RERA-linked data</li>
              <li>✓ No agent markup</li>
              <li>✓ Consent-first leads</li>
            </ul>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="listings-main">
          <div className="listings-header">
            <div className="listings-count">
              <strong>{filtered.length}</strong> properties found
              {filterCity && <span> in <em>{filterCity}</em></span>}
            </div>
            <div className="listings-sort">
              <span>Sort by:</span>
              <select className="select" style={{width:'auto',padding:'6px 28px 6px 10px'}} value={sort} onChange={e => setSort(e.target.value)}>
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No properties found</h3>
              <p>Try adjusting your filters or search in a different city.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
