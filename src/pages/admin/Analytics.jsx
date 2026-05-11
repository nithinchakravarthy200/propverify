import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Analytics.css'

export default function Analytics() {
  const [data, setData] = useState({ properties: [], inquiries: [], totals: {} })
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(30)

  useEffect(() => { load() }, [range])

  async function load() {
    setLoading(true)
    const since = new Date(Date.now() - range * 86400000).toISOString()
    const [propRes, inqRes, allInqRes] = await Promise.all([
      supabase.from('properties').select('id, title, city, type, views, price, created_at, is_featured').order('views', { ascending: false }),
      supabase.from('inquiries').select('id, status, created_at, property_title').gte('created_at', since).order('created_at', { ascending: false }),
      supabase.from('inquiries').select('id, status'),
    ])
    const props = propRes.data || []
    const inqs = inqRes.data || []
    const allInqs = allInqRes.data || []
    const totalViews = props.reduce((s, p) => s + (p.views || 0), 0)

    // inquiries per day (last N days)
    const dayMap = {}
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      dayMap[d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0
    }
    inqs.forEach(inq => {
      const label = new Date(inq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      if (dayMap[label] !== undefined) dayMap[label]++
    })

    // city breakdown
    const cityMap = {}
    props.forEach(p => { cityMap[p.city] = (cityMap[p.city] || 0) + (p.views || 0) })

    setData({
      properties: props,
      inquiryDays: Object.entries(dayMap),
      cityViews: Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6),
      totals: {
        properties: props.length,
        totalViews,
        inquiries: allInqs.length,
        newInquiries: allInqs.filter(i => i.status === 'new').length,
        featured: props.filter(p => p.is_featured).length,
      }
    })
    setLoading(false)
  }

  if (loading) return <div className="an-loading"><div className="an-spinner"></div></div>

  const { totals, properties, inquiryDays = [], cityViews = [] } = data
  const maxInq = Math.max(...inquiryDays.map(([, v]) => v), 1)
  const maxCityViews = Math.max(...cityViews.map(([, v]) => v), 1)
  const formatPrice = (p) => p >= 10000000 ? `₹${(p / 10000000).toFixed(1)}Cr` : `₹${(p / 100000).toFixed(0)}L`

  return (
    <div className="analytics">
      <div className="an-header">
        <div>
          <h1>Analytics</h1>
          <p>Performance overview for your listings</p>
        </div>
        <div className="an-range-tabs">
          {[7, 30, 90].map(r => (
            <button key={r} className={`an-range-btn ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="an-kpis">
        {[
          { label: 'Total Properties', value: totals.properties, icon: '🏠', color: '#1a5eb8' },
          { label: 'Total Views', value: totals.totalViews?.toLocaleString(), icon: '👁', color: '#7c3aed' },
          { label: 'Total Inquiries', value: totals.inquiries, icon: '📬', color: '#16a34a' },
          { label: 'Pending (New)', value: totals.newInquiries, icon: '🔔', color: '#d97706' },
          { label: 'Featured', value: totals.featured, icon: '⭐', color: '#e8a020' },
        ].map(k => (
          <div className="an-kpi" key={k.label} style={{ '--kc': k.color }}>
            <div className="an-kpi-icon">{k.icon}</div>
            <div className="an-kpi-val">{k.value ?? 0}</div>
            <div className="an-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="an-grid">
        {/* INQUIRIES CHART */}
        <div className="an-card an-card-wide">
          <div className="an-card-title">Inquiries — Last {range} days</div>
          <div className="an-bar-chart">
            {inquiryDays.map(([label, val]) => (
              <div key={label} className="an-bar-col">
                <div className="an-bar-wrap">
                  <div className="an-bar" style={{ height: `${(val / maxInq) * 100}%` }}>
                    {val > 0 && <span className="an-bar-tip">{val}</span>}
                  </div>
                </div>
                <div className="an-bar-label">{range <= 7 ? label : label.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* VIEWS BY CITY */}
        <div className="an-card">
          <div className="an-card-title">Views by City</div>
          <div className="an-city-list">
            {cityViews.length === 0 ? <div className="an-empty">No data yet</div> : cityViews.map(([city, views]) => (
              <div key={city} className="an-city-row">
                <div className="an-city-name">{city}</div>
                <div className="an-city-bar-wrap">
                  <div className="an-city-bar" style={{ width: `${(views / maxCityViews) * 100}%` }}></div>
                </div>
                <div className="an-city-views">{views}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP PROPERTIES TABLE */}
        <div className="an-card an-card-wide">
          <div className="an-card-title">Top Properties by Views</div>
          {properties.length === 0 ? <div className="an-empty">No properties yet</div> : (
            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr><th>#</th><th>Property</th><th>City</th><th>Type</th><th>Price</th><th>Views</th><th>Featured</th></tr>
                </thead>
                <tbody>
                  {properties.slice(0, 10).map((p, i) => (
                    <tr key={p.id}>
                      <td className="an-rank">{i + 1}</td>
                      <td className="an-prop-name">{p.title}</td>
                      <td>{p.city}</td>
                      <td><span className="badge badge-blue">{p.type}</span></td>
                      <td className="an-price">{formatPrice(p.price)}</td>
                      <td><span className="an-views-badge">👁 {p.views || 0}</span></td>
                      <td>{p.is_featured ? '⭐' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
