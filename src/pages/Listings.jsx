import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SearchBar from '../components/SearchBar'
import { useProperties } from '../lib/useProperties'
import { cities, budgetRanges } from '../data/properties'
import './Listings.css'

const SORT_OPTS = ['Relevance','Price: Low to High','Price: High to Low','Newest First','Trust Score']
const CATS = {
  buy:      { label:'Buy',          desc:'Properties available for purchase' },
  rent:     { label:'Rent',         desc:'Ready-to-move properties for rent' },
  projects: { label:'New Projects', desc:'Under-construction projects' },
}

export default function Listings() {
  const { properties: all, loading } = useProperties()
  const [sp, setSp] = useSearchParams()
  const category = sp.get('category') || 'buy'

  const [sort,      setSort]      = useState('Relevance')
  const [city,      setCity]      = useState(sp.get('city') || '')
  const [type,      setType]      = useState(sp.get('type') || '')
  const [bhk,       setBhk]       = useState(sp.get('bhk') || '')
  const [budgetIdx, setBudgetIdx] = useState(0)
  const [reraOnly,  setReraOnly]  = useState(false)

  useEffect(() => { setCity(sp.get('city') || '') }, [sp])

  const clearAll = () => { setCity(''); setType(''); setBhk(''); setBudgetIdx(0); setReraOnly(false) }
  const switchCat = (c) => { setSp({ category: c }); clearAll() }

  const filtered = useMemo(() => {
    let r = [...all]
    if (category === 'projects') r = r.filter(p => p.status === 'Under Construction')
    else if (category === 'rent') r = r.filter(p => p.status === 'Ready to Move')
    const q = (sp.get('q') || '').toLowerCase()
    if (q) r = r.filter(p => [p.title,p.location,p.city,p.area].some(f => f?.toLowerCase().includes(q)))
    if (city)      r = r.filter(p => p.city === city)
    if (type)      r = r.filter(p => p.type === type)
    if (bhk)       r = r.filter(p => String(p.bhk) === bhk)
    if (budgetIdx > 0) { const { min, max } = budgetRanges[budgetIdx]; r = r.filter(p => p.price >= min && p.price <= max) }
    if (reraOnly)  r = r.filter(p => p.rera_id || p.reraId)
    if (sort === 'Price: Low to High')  r.sort((a,b) => a.price - b.price)
    if (sort === 'Price: High to Low')  r.sort((a,b) => b.price - a.price)
    if (sort === 'Trust Score') r.sort((a,b) => (b.builder_trust||b.builderTrust||0)-(a.builder_trust||a.builderTrust||0))
    return r
  }, [all, category, city, type, bhk, budgetIdx, reraOnly, sort, sp])

  return (
    <div className="listings-page">
      <div className="listings-cat-bar">
        <div className="container">
          <div className="cat-tabs">
            {Object.entries(CATS).map(([k,v]) => (
              <button key={k} className={`cat-tab ${category===k?'active':''}`} onClick={() => switchCat(k)}>
                {v.label}{category===k && <span className="cat-badge">{filtered.length}</span>}
              </button>
            ))}
          </div>
          <div className="cat-desc">{CATS[category]?.desc}</div>
        </div>
      </div>

      <div className="listings-searchbar">
        <div className="container"><SearchBar variant="inline"/></div>
      </div>

      <div className="container listings-layout">
        <aside className="listings-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-hd">
              <h3>Filters</h3>
              <button className="clear-btn" onClick={clearAll}>Clear all</button>
            </div>
            <div className="fg"><label className="fl">City</label>
              <select className="select" value={city} onChange={e => setCity(e.target.value)}>
                <option value="">All Cities</option>
                {cities.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Property Type</label>
              <div className="pills">
                {['Apartment','Villa','Plot','Commercial'].map(t => (
                  <button key={t} className={`pill ${type===t?'active':''}`} onClick={() => setType(type===t?'':t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="fg"><label className="fl">BHK</label>
              <div className="pills">
                {['1','2','3','4'].map(b => (
                  <button key={b} className={`pill ${bhk===b?'active':''}`} onClick={() => setBhk(bhk===b?'':b)}>{b} BHK</button>
                ))}
              </div>
            </div>
            <div className="fg"><label className="fl">Budget</label>
              <select className="select" value={budgetIdx} onChange={e => setBudgetIdx(Number(e.target.value))}>
                {budgetRanges.map((r,i) => <option key={r.label} value={i}>{r.label}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="check-item"><input type="checkbox" checked={reraOnly} onChange={e => setReraOnly(e.target.checked)}/><span>RERA Verified Only</span></label>
            </div>
          </div>
          <div className="sidebar-card trust-info-card">
            <div style={{fontSize:22,marginBottom:6}}>🛡</div>
            <h4>TrustOS Promise</h4>
            <ul>{['Zero duplicate listings','Verified builder scores','RERA-linked data','No agent markup'].map(i=><li key={i}>✓ {i}</li>)}</ul>
          </div>
        </aside>

        <div className="listings-main">
          <div className="listings-hdr">
            <div className="lcount">
              {loading ? <span style={{color:'var(--gray-400)'}}>Loading…</span>
                : <><strong>{filtered.length}</strong> {CATS[category]?.label.toLowerCase()} properties{city && <> in <em>{city}</em></>}</>}
            </div>
            <div className="lsort">
              <span>Sort:</span>
              <select className="select" style={{width:'auto',padding:'6px 28px 6px 10px'}} value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="listings-grid">{[...Array(6)].map((_,i) => <div key={i} className="skel-card"><div className="skeleton" style={{height:200}}/><div style={{padding:'1rem'}}><div className="skeleton" style={{height:18,marginBottom:8}}/><div className="skeleton" style={{height:14,width:'60%'}}/></div></div>)}</div>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              <div style={{fontSize:48,marginBottom:12}}>🏠</div>
              <h3>No properties found</h3>
              <p>Try adjusting your filters.</p>
              <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={clearAll}>Clear Filters</button>
            </div>
          ) : (
            <div className="listings-grid">{filtered.map(p => <PropertyCard key={p.id} property={p}/>)}</div>
          )}
        </div>
      </div>
    </div>
  )
}
