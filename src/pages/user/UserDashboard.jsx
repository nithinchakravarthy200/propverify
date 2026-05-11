import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserFavorites from './UserFavorites'
import UserInquiries from './UserInquiries'
import UserProfile from './UserProfile'
import RecentlyViewed from './RecentlyViewed'
import './UserDashboard.css'

const TABS = [
  { id:'overview',  label:'Overview',         icon:'🏠' },
  { id:'favorites', label:'Saved Properties', icon:'❤️' },
  { id:'inquiries', label:'My Inquiries',      icon:'📬' },
  { id:'viewed',    label:'Recently Viewed',   icon:'👁' },
  { id:'profile',   label:'Edit Profile',      icon:'👤' },
]

export default function UserDashboard({ defaultTab='overview' }) {
  const { profile, isAdmin, signOut } = useAuth()
  const [tab, setTab] = useState(defaultTab)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const initials = (profile?.full_name||profile?.email||'U').slice(0,2).toUpperCase()

  return (
    <div className="udash">
      <aside className={`udash-side ${open?'open':''}`}>
        <div className="udash-user-card">
          <div className="udash-av">{initials}</div>
          <div>
            <div className="udash-uname">{profile?.full_name||'User'}</div>
            <div className="udash-uemail">{profile?.email}</div>
            <span className={`role-badge ${isAdmin?'admin':'buyer'}`}>{isAdmin?'⚙ Admin':'👤 Buyer'}</span>
          </div>
        </div>
        <nav className="udash-nav">
          {TABS.map(t=>(
            <button key={t.id} className={`udash-ni ${tab===t.id?'active':''}`} onClick={()=>{setTab(t.id);setOpen(false)}}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
          {isAdmin && <Link to="/admin" className="udash-ni admin-ni"><span>⚙</span>Admin Panel</Link>}
        </nav>
        <div className="udash-side-foot">
          <Link to="/" className="udash-ni">← Back to Site</Link>
          <button className="udash-signout-btn" onClick={handleSignOut}>🚪 Sign Out</button>
        </div>
      </aside>

      {open && <div className="udash-overlay" onClick={()=>setOpen(false)}/>}

      <div className="udash-main">
        <div className="udash-topbar">
          <button className="udash-ham" onClick={()=>setOpen(true)}>☰</button>
          <h1 className="udash-title">{TABS.find(t=>t.id===tab)?.label}</h1>
        </div>
        <div className="udash-body">
          {tab==='overview'  && <Overview profile={profile} isAdmin={isAdmin} setTab={setTab}/>}
          {tab==='favorites' && <UserFavorites/>}
          {tab==='inquiries' && <UserInquiries/>}
          {tab==='viewed'    && <RecentlyViewed/>}
          {tab==='profile'   && <UserProfile/>}
        </div>
      </div>
    </div>
  )
}

function Overview({ profile, isAdmin, setTab }) {
  return (
    <div className="udash-overview">
      <div className="udash-welcome">
        <h2>Welcome back, {profile?.full_name||profile?.email?.split('@')[0]||'there'} 👋</h2>
        <p>Manage your property search from your personal dashboard.</p>
      </div>
      <div className="overview-cards">
        {[{icon:'❤️',label:'Saved Properties',sub:'View your wishlist',tab:'favorites'},
          {icon:'📬',label:'My Inquiries',sub:'Track your requests',tab:'inquiries'},
          {icon:'👁',label:'Recently Viewed',sub:'Properties you browsed',tab:'viewed'},
          {icon:'👤',label:'Edit Profile',sub:'Update your details',tab:'profile'}].map(c=>(
          <button key={c.tab} className="ov-card" onClick={()=>setTab(c.tab)}>
            <div className="ov-icon">{c.icon}</div>
            <div className="ov-label">{c.label}</div>
            <div className="ov-sub">{c.sub}</div>
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <Link to="/listings" className="btn btn-primary btn-lg">🔍 Browse Properties</Link>
        <Link to="/listings?category=projects" className="btn btn-secondary btn-lg">🏗 New Projects</Link>
      </div>
    </div>
  )
}
