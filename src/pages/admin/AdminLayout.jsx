import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/properties', label: 'Properties', icon: '🏠' },
  { path: '/admin/add-property', label: 'Add Property', icon: '➕' },
  { path: '/admin/inquiries', label: 'Inquiries', icon: '📬' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
]

export default function AdminLayout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path)

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="admin-logo-dot"></span>PropVerify
          </Link>
          <div className="admin-badge">Admin</div>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">{profile?.email?.slice(0,2)?.toUpperCase() || 'A'}</div>
            <div className="admin-user-info">
              <div className="admin-user-name">{profile?.full_name || profile?.email?.split('@')[0] || 'Admin'}</div>
              <div className="admin-user-phone">{profile?.email}</div>
            </div>
          </div>
          <button className="admin-signout" onClick={handleSignOut}>Sign Out</button>
        </div>
      </aside>

      {/* OVERLAY for mobile */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="admin-topbar-title">
            {navItems.find(i => isActive(i))?.label || 'Admin'}
          </div>
          <Link to="/" className="admin-view-site btn btn-secondary btn-sm">← View Site</Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
