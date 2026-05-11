import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import './UserCommon.css'

export default function UserProfile() {
  const { user, profile, fetchProfile } = useAuth()
  const [form, setForm] = useState({ full_name:'', phone:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name||'', phone: profile.phone||'' })
  }, [profile])

  const save = async (e) => {
    e.preventDefault(); setMsg({}); setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name:form.full_name, phone:form.phone }).eq('id', user.id)
    if (error) setMsg({ type:'error', text: error.message })
    else { setMsg({ type:'success', text:'Profile saved!' }); fetchProfile() }
    setSaving(false)
  }

  const initials = (profile?.full_name||profile?.email||'U').slice(0,2).toUpperCase()

  return (
    <div className="user-section" style={{maxWidth:520}}>
      <div className="profile-hero">
        <div className="profile-av-lg">{initials}</div>
        <div>
          <div className="profile-h-name">{profile?.full_name || 'Set your name'}</div>
          <div className="profile-h-email">{profile?.email}</div>
          <span className={`role-badge ${profile?.role==='admin'?'admin':'buyer'}`}>{profile?.role||'buyer'}</span>
        </div>
      </div>
      {msg.text && <div className={`msg-box ${msg.type}`}>{msg.type==='success'?'✅':'⚠️'} {msg.text}</div>}
      <form onSubmit={save} className="profile-form">
        <h3 className="form-section-title">Personal Details</h3>
        <div className="form-field"><label>Full Name</label><input className="input" placeholder="Your full name" value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}/></div>
        <div className="form-field"><label>Email</label><input className="input" value={profile?.email||''} disabled style={{opacity:0.6}}/><span className="field-hint">Email cannot be changed</span></div>
        <div className="form-field"><label>Phone</label><input className="input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
      </form>
      <div className="profile-form">
        <h3 className="form-section-title">Account Info</h3>
        {[['Member since', new Date(user?.created_at||Date.now()).toLocaleDateString('en-IN',{year:'numeric',month:'long'})],['Account type',profile?.role||'buyer'],['Auth method','Email']].map(([k,v])=>(
          <div key={k} className="info-row"><span>{k}</span><span className="info-val">{v}</span></div>
        ))}
      </div>
    </div>
  )
}
