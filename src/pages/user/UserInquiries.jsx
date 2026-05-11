import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import './UserCommon.css'

const STATUS_COLOR = { new:'badge-blue', contacted:'badge-green', closed:'badge-amber' }
const fmt = d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})

export default function UserInquiries() {
  const { user } = useAuth()
  const [inqs, setInqs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('inquiries').select('*').eq('user_id', user.id).order('created_at',{ascending:false})
    setInqs(data||[])
    setLoading(false)
  }

  if (loading) return <div className="section-loading">Loading inquiries…</div>
  if (!inqs.length) return (
    <div className="section-empty">
      <div className="ei">📬</div>
      <h3>No inquiries yet</h3>
      <p>When you contact a property, your inquiry will appear here.</p>
      <Link to="/listings" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>Browse Properties</Link>
    </div>
  )
  return (
    <div>
      <div className="section-hd"><h2>{inqs.length} {inqs.length===1?'Inquiry':'Inquiries'}</h2></div>
      <div className="inq-list">
        {inqs.map(inq=>(
          <div key={inq.id} className="inq-row">
            <div className="inq-row-top">
              <div className="inq-prop-name">🏠 {inq.property_title||'Property Inquiry'}</div>
              <span className={`badge ${STATUS_COLOR[inq.status]||'badge-blue'}`}>{inq.status}</span>
            </div>
            {inq.message && <div className="inq-msg">"{inq.message}"</div>}
            <div className="inq-footer">
              <span className="inq-date">📅 {fmt(inq.created_at)}</span>
              {inq.property_id && <Link to={`/property/${inq.property_id}`} className="inq-link">View Property →</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
