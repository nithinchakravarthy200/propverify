import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import PropertyCard from '../../components/PropertyCard'
import './UserCommon.css'

export default function UserFavorites() {
  const { user } = useAuth()
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase
      .from('favorites')
      .select('property_id, properties(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setFavs((data||[]).map(f=>f.properties).filter(Boolean))
    setLoading(false)
  }

  if (loading) return <div className="section-loading">Loading saved properties…</div>
  if (!favs.length) return (
    <div className="section-empty">
      <div className="ei">❤️</div>
      <h3>No saved properties yet</h3>
      <p>Tap the heart icon on any property to save it here.</p>
      <Link to="/listings" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>Browse Properties</Link>
    </div>
  )
  return (
    <div>
      <div className="section-hd"><h2>{favs.length} Saved {favs.length===1?'Property':'Properties'}</h2></div>
      <div className="user-props-grid">{favs.map(p=><PropertyCard key={p.id} property={p}/>)}</div>
    </div>
  )
}
