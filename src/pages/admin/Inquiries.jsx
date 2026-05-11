import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Inquiries.css'

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchInquiries() }, [])

  async function fetchInquiries() {
    const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
    setInquiries(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('inquiries').update({ status }).eq('id', id)
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter)

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="inquiries-page">
      <div className="inq-page-header">
        <div>
          <h1>Inquiries</h1>
          <p>{inquiries.filter(i => i.status === 'new').length} new · {inquiries.length} total</p>
        </div>
      </div>

      <div className="inq-filters">
        {['all','new','contacted','closed'].map(f => (
          <button key={f} className={`inq-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="inq-filter-count">{f === 'all' ? inquiries.length : inquiries.filter(i => i.status === f).length}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="inq-empty">Loading...</div> :
       filtered.length === 0 ? <div className="inq-empty">No {filter === 'all' ? '' : filter} inquiries yet.</div> : (
        <div className="inq-cards">
          {filtered.map(inq => (
            <div key={inq.id} className={`inq-card ${inq.status}`}>
              <div className="inq-card-top">
                <div className="inq-card-avatar">{inq.name?.[0]?.toUpperCase()}</div>
                <div className="inq-card-person">
                  <div className="inq-card-name">{inq.name}</div>
                  <a href={`tel:${inq.phone}`} className="inq-card-phone">📞 {inq.phone}</a>
                </div>
                <span className={`badge badge-${inq.status === 'new' ? 'blue' : inq.status === 'contacted' ? 'green' : 'amber'}`}>
                  {inq.status}
                </span>
              </div>
              <div className="inq-card-prop">🏠 {inq.property_title || 'General Inquiry'}</div>
              {inq.message && <div className="inq-card-msg">"{inq.message}"</div>}
              <div className="inq-card-footer">
                <span className="inq-card-date">{formatDate(inq.created_at)}</span>
                <div className="inq-card-actions">
                  {inq.status !== 'contacted' && <button className="inq-action-btn green" onClick={() => updateStatus(inq.id, 'contacted')}>Mark Contacted</button>}
                  {inq.status !== 'closed' && <button className="inq-action-btn gray" onClick={() => updateStatus(inq.id, 'closed')}>Close</button>}
                  {inq.status === 'closed' && <button className="inq-action-btn blue" onClick={() => updateStatus(inq.id, 'new')}>Reopen</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
