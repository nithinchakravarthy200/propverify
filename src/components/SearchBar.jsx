import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cities, propertyTypes, bhkOptions } from '../data/properties'
import './SearchBar.css'

export default function SearchBar({ variant = 'hero' }) {
  const navigate = useNavigate()
  const [tab, setTab]       = useState('buy')
  const [city, setCity]     = useState('')
  const [type, setType]     = useState('')
  const [bhk, setBhk]       = useState('')
  const [keyword, setKeyword] = useState('')

  const search = () => {
    const p = new URLSearchParams()
    p.set('category', tab)
    if (city)    p.set('city', city)
    if (type)    p.set('type', type)
    if (bhk)     p.set('bhk', bhk.replace(' BHK',''))
    if (keyword) p.set('q', keyword)
    navigate(`/listings?${p.toString()}`)
  }

  return (
    <div className={`searchbar searchbar-${variant}`}>
      {variant === 'hero' && (
        <div className="search-tabs">
          {['buy','rent','projects'].map(t => (
            <button key={t} className={`search-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t === 'buy' ? 'Buy' : t === 'rent' ? 'Rent' : 'New Projects'}
            </button>
          ))}
        </div>
      )}
      <div className="search-fields">
        <div className="search-field-main">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            className="search-input"
            placeholder="Search city, locality, project..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        </div>
        <div className="search-divider"/>
        <select className="search-select" value={city} onChange={e => setCity(e.target.value)}>
          <option value="">City</option>
          {cities.slice(1).map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="search-divider"/>
        <select className="search-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Type</option>
          {propertyTypes.slice(1).map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="search-divider"/>
        <select className="search-select" value={bhk} onChange={e => setBhk(e.target.value)}>
          <option value="">BHK</option>
          {bhkOptions.slice(1).map(b => <option key={b}>{b}</option>)}
        </select>
        <button className="search-btn btn btn-amber btn-lg" onClick={search}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search
        </button>
      </div>
    </div>
  )
}
