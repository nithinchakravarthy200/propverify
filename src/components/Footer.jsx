import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-dot"></span>
              Trust<span>OS</span>
            </div>
            <p className="footer-tagline">
              India's first real estate truth platform. Verified data, zero ambiguity.
            </p>
            <div className="footer-trust-badges">
              <span className="badge badge-green">✓ RERA Linked</span>
              <span className="badge badge-blue">✓ Verified Data</span>
              <span className="badge badge-navy">✓ No Spam</span>
            </div>
          </div>

          <div className="footer-links-group">
            <h4>Buy Property</h4>
            <ul>
              <li><Link to="/listings">Apartments</Link></li>
              <li><Link to="/listings">Villas</Link></li>
              <li><Link to="/listings">Plots</Link></li>
              <li><Link to="/listings">New Projects</Link></li>
              <li><Link to="/listings">Commercial</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Top Cities</h4>
            <ul>
              <li><Link to="/listings?city=Hyderabad">Hyderabad</Link></li>
              <li><Link to="/listings?city=Bangalore">Bangalore</Link></li>
              <li><Link to="/listings?city=Mumbai">Mumbai</Link></li>
              <li><Link to="/listings?city=Gurgaon">Gurgaon</Link></li>
              <li><Link to="/listings?city=Chennai">Chennai</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <hr className="divider" />

        <div className="footer-bottom">
          <p>© 2025 TrustOS. Not a broker. Not an ad platform. Built on verified data.</p>
          <p>All property data is sourced from RERA portals, EC websites, and verified sources.</p>
        </div>
      </div>
    </footer>
  )
}
