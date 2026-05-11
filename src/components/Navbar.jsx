import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, isAdmin, signOut } = useAuth()
  const isHome = location.pathname === '/'

  useEffect(() => {
    function onClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [location.pathname])

  const handleSignOut = async () => { setDropOpen(false); await signOut(); navigate('/') }
  const initials = (profile?.full_name || profile?.email || 'U').slice(0,2).toUpperCase()
  const displayName = profile?.full_name || profile?.email?.split('@')[0]?.slice(0,14) || 'User'

  return (
    <>
      <nav className={`navbar ${isHome && !menuOpen ? 'navbar-transparent' : 'navbar-solid'}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-dot"></span>Prop<span>Verify</span>
          </Link>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <Link to="/listings?category=buy"      className="nav-link">Buy</Link>
            <Link to="/listings?category=rent"     className="nav-link">Rent</Link>
            <Link to="/listings?category=projects" className="nav-link">New Projects</Link>
            {isAdmin && <Link to="/admin"           className="nav-link admin-link">⚙ Admin</Link>}
            {user    && <Link to="/dashboard"       className="nav-link">My Dashboard</Link>}
          </div>

          <div className="navbar-actions">
            <button className="btn btn-secondary btn-sm post-btn"
              onClick={() => navigate(user ? '/dashboard' : '/login')}>
              Post Property <span className="free-tag">FREE</span>
            </button>

            {user ? (
              <div className="user-menu" ref={dropRef}>
                <button className="user-btn" onClick={() => setDropOpen(p => !p)} aria-expanded={dropOpen}>
                  <div className="user-avatar">{initials}</div>
                  <span className="user-display-name">{displayName}</span>
                  <span className={`user-caret ${dropOpen ? 'open' : ''}`}>▾</span>
                </button>
                {dropOpen && (
                  <div className="user-dropdown">
                    <div className="user-drop-info">
                      <div className="user-drop-name">{profile?.full_name || 'User'}</div>
                      <div className="user-drop-email">{profile?.email}</div>
                      <span className={`udrop-badge ${isAdmin ? 'admin' : 'buyer'}`}>{isAdmin ? '⚙ Admin' : '👤 Buyer'}</span>
                    </div>
                    <Link to="/dashboard"            className="user-drop-item" onClick={() => setDropOpen(false)}>🏠 My Dashboard</Link>
                    <Link to="/dashboard/favorites"  className="user-drop-item" onClick={() => setDropOpen(false)}>❤️ Saved Properties</Link>
                    <Link to="/dashboard/inquiries"  className="user-drop-item" onClick={() => setDropOpen(false)}>📬 My Inquiries</Link>
                    <Link to="/dashboard/profile"    className="user-drop-item" onClick={() => setDropOpen(false)}>👤 Edit Profile</Link>
                    {isAdmin && <Link to="/admin"    className="user-drop-item admin-item" onClick={() => setDropOpen(false)}>⚙ Admin Panel</Link>}
                    <div className="user-drop-divider"/>
                    <button className="user-drop-item user-drop-signout" onClick={handleSignOut}>🚪 Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}

            <button className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(p => !p)} aria-label="Menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)}/>}
    </>
  )
}
