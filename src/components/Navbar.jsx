import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className={`navbar ${isHome ? 'navbar-transparent' : 'navbar-solid'}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-dot"></span>
          Trust<span>OS</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/listings" className="nav-link" onClick={() => setMenuOpen(false)}>Buy</Link>
          <Link to="/listings" className="nav-link" onClick={() => setMenuOpen(false)}>Rent</Link>
          <Link to="/listings" className="nav-link" onClick={() => setMenuOpen(false)}>New Projects</Link>
          <Link to="/listings" className="nav-link" onClick={() => setMenuOpen(false)}>Commercial</Link>
        </div>

        <div className="navbar-actions">
          <button className="btn btn-secondary btn-sm">Post Property <span className="free-tag">FREE</span></button>
          <button className="btn btn-primary btn-sm">Sign In</button>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}
