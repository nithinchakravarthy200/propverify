import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './AdminProperties.css'

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchProperties() }, [])

  async function fetchProperties() {
    setLoading(true)
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this property? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('properties').delete().eq('id', id)
    setProperties(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  async function toggleFeatured(id, current) {
    await supabase.from('properties').update({ is_featured: !current }).eq('id', id)
    setProperties(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p))
  }

  const formatPrice = (p) => p >= 10000000 ? `₹${(p/10000000).toFixed(2)} Cr` : `₹${(p/100000).toFixed(0)} L`

  const filtered = properties.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-properties">
      <div className="ap-header">
        <div>
          <h1>Properties <span className="ap-count">({properties.length})</span></h1>
          <p>Manage all your real estate listings</p>
        </div>
        <Link to="/admin/add-property" className="btn btn-primary">➕ Add Property</Link>
      </div>

      <div className="ap-search">
        <input className="input" placeholder="Search by title or city..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="ap-loading">Loading properties...</div>
      ) : filtered.length === 0 ? (
        <div className="ap-empty">
          <div style={{fontSize:48}}>🏠</div>
          <h3>{search ? 'No properties match your search' : 'No properties yet'}</h3>
          <Link to="/admin/add-property" className="btn btn-primary" style={{marginTop:'1rem'}}>Add First Property</Link>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>City</th>
                <th>Price</th>
                <th>BHK</th>
                <th>Status</th>
                <th>Views</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="ap-prop-cell">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="ap-prop-img" />}
                      <div>
                        <div className="ap-prop-title">{p.title}</div>
                        <div className="ap-prop-type">{p.type}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.city}</td>
                  <td className="ap-price">{formatPrice(p.price)}</td>
                  <td>{p.bhk} BHK</td>
                  <td>
                    <span className={`badge ${p.status === 'Ready to Move' ? 'badge-green' : 'badge-amber'}`}>
                      {p.status === 'Ready to Move' ? 'Ready' : 'U/C'}
                    </span>
                  </td>
                  <td>{p.views || 0}</td>
                  <td>
                    <button
                      className={`featured-toggle ${p.is_featured ? 'on' : ''}`}
                      onClick={() => toggleFeatured(p.id, p.is_featured)}
                      title={p.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      {p.is_featured ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td>
                    <div className="ap-actions">
                      <Link to={`/property/${p.id}`} className="ap-btn ap-btn-view" title="View">👁</Link>
                      <Link to={`/admin/edit-property/${p.id}`} className="ap-btn ap-btn-edit" title="Edit">✏️</Link>
                      <button
                        className="ap-btn ap-btn-delete"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        title="Delete"
                      >
                        {deleting === p.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
