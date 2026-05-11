import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import PropertyCard from '../../components/PropertyCard'
import './UserCommon.css'

export default function RecentlyViewed() {
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('pv_viewed')||'[]')
    if (!ids.length) { setLoading(false); return }
    supabase.from('properties').select('*').in('id', ids.slice(0,12)).then(({ data }) => {
      const ordered = ids.map(id=>(data||[]).find(p=>p.id===id)).filter(Boolean)
      setProps(ordered)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="section-loading">Loading…</div>
  if (!props.length) return (
    <div className="section-empty">
      <div className="ei">👁</div>
      <h3>No recently viewed properties</h3>
      <p>Properties you open will appear here.</p>
      <Link to="/listings" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>Browse Properties</Link>
    </div>
  )
  return (
    <div>
      <div className="section-hd">
        <h2>Recently Viewed</h2>
        <button className="clear-sm" onClick={() => { localStorage.removeItem('pv_viewed'); setProps([]) }}>Clear</button>
      </div>
      <div className="user-props-grid">{props.map(p=><PropertyCard key={p.id} property={p}/>)}</div>
    </div>
  )
}
