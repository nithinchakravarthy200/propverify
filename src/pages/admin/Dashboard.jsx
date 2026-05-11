import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ properties: 0, inquiries: 0, views: 0, newInquiries: 0 })
  const [recentInquiries, setRecentInquiries] = useState([])
  const [topProperties, setTopProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const [propRes, inqRes, newInqRes] = await Promise.all([
        supabase.from('properties').select('id, title, city, price, views, is_featured'),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('inquiries').select('id', { count: 'exact' }).eq('status', 'new'),
      ])

      const props  = propRes.data  || []
      const inqs   = inqRes.data   || []
      const totalViews = props.reduce((sum, p) => sum + (p.views || 0), 0)
      const sorted = [...props].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

      setStats({
        properties:   props.length,
        inquiries:    inqs.length,
        views:        totalViews,
        newInquiries: newInqRes.count || 0,
      })
      setRecentInquiries(inqs.slice(0, 5))
      setTopProperties(sorted)
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (p) => p >= 10000000 ? `₹${(p/10000000).toFixed(2)} Cr` : p >= 100000 ? `₹${(p/100000).toFixed(0)} L` : `₹${p}`

  const statCards = [
    { label:'Total Properties', value: stats.properties,   icon:'🏠', color:'#1a5eb8', bg:'#dbeafe' },
    { label:'Total Inquiries',  value: stats.inquiries,    icon:'📬', color:'#16a34a', bg:'#dcfce7' },
    { label:'New Inquiries',    value: stats.newInquiries, icon:'🔔', color:'#d97706', bg:'#fef3c7' },
    { label:'Total Views',      value: stats.views.toLocaleString(), icon:'👁', color:'#7c3aed', bg:'#ede9fe' },
  ]

  if (loading) return <div className="dash-loading"><div className="spinner-lg"></div></div>

  return (
    <div className="dashboard">
      <div className="dash-welcome">
        <h1>Welcome back 👋</h1>
        <p>Here's what's happening on PropVerify today.</p>
      </div>

      <div className="stat-cards">
        {statCards.map(s => (
          <div className="stat-card" key={s.label} style={{'--card-color': s.color, '--card-bg': s.bg}}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-val">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* RECENT INQUIRIES */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Recent Inquiries</h3>
            <Link to="/admin/inquiries" className="dash-link">View all →</Link>
          </div>
          {recentInquiries.length === 0 ? (
            <div className="dash-empty">No inquiries yet</div>
          ) : (
            <div className="inquiry-list">
              {recentInquiries.map(inq => (
                <div key={inq.id} className="inquiry-row">
                  <div className="inq-avatar">{inq.name?.[0]?.toUpperCase() || '?'}</div>
                  <div className="inq-info">
                    <div className="inq-name">{inq.name}</div>
                    <div className="inq-prop">{inq.property_title || 'General Inquiry'}</div>
                    {inq.phone && <div className="inq-phone-small">{inq.phone}</div>}
                  </div>
                  <div className="inq-meta">
                    <span className={`inq-status status-${inq.status}`}>{inq.status}</span>
                    <div className="inq-time">{new Date(inq.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP PROPERTIES */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Top by Views</h3>
            <Link to="/admin/properties" className="dash-link">Manage →</Link>
          </div>
          {topProperties.length === 0 ? (
            <div className="dash-empty">
              No properties yet. <Link to="/admin/add-property">Add one →</Link>
            </div>
          ) : (
            <div className="top-props-list">
              {topProperties.map((p, i) => (
                <div key={p.id} className="top-prop-row">
                  <div className="top-prop-rank">#{i + 1}</div>
                  <div className="top-prop-info">
                    <div className="top-prop-title">{p.title}</div>
                    <div className="top-prop-city">{p.city} · {fmt(p.price)}</div>
                  </div>
                  <div className="top-prop-views">
                    <span className="views-pill">👁 {p.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-actions">
        <Link to="/admin/add-property"  className="btn btn-primary btn-lg">➕ Add New Property</Link>
        <Link to="/admin/inquiries"     className="btn btn-secondary btn-lg">📬 View Inquiries</Link>
        <Link to="/admin/analytics"     className="btn btn-secondary btn-lg">📊 Analytics</Link>
      </div>
    </div>
  )
}
