import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';
import logo from '../logo.png'; 

const Navbar = ({ user, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to close menu when a link is clicked
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* LOGO */}
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="JOCO EXEC" className="nav-logo-img" />
        </Link>

        {/* HAMBURGER BUTTON (Visible only on mobile via App.css) */}
        <button 
          className="hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        
        {/* NAVIGATION MENU */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className="nav-links" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to="/booking" className="nav-links" onClick={closeMenu}>Book Now</Link>
          </li>

          {/* DYNAMIC LINKS BASED ON USER ROLE */}
          {user ? (
            <>
              {user.role === 'driver' && (
                <li><Link to="/driver-dashboard" className="nav-links" style={{color: '#C5A059'}} onClick={closeMenu}>Driver Portal</Link></li>
              )}
              {user.role === 'admin' && (
                <li><Link to="/admin" className="nav-links" style={{color: '#C5A059'}} onClick={closeMenu}>Admin Panel</Link></li>
              )}
              <li>
                <button 
                  onClick={() => { handleLogout(); closeMenu(); }} 
                  style={logoutBtnStyle}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="nav-links" onClick={closeMenu}>Login</Link>
            </li>
          )}

          {/* CALL BUTTON - Optimized for touch */}
          <li>
            <a href="tel:9133690854" className="btn-primary" style={navCallButtonStyle} onClick={closeMenu}>
              <Phone size={16} style={{marginRight:'8px'}}/> CALL US
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// --- MOBILE-FIRST INLINE OVERRIDES ---
const navCallButtonStyle = {
  padding: '12px 25px', 
  fontSize: '0.9rem', 
  display: 'flex', 
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none'
};

const logoutBtnStyle = {
  background: 'transparent',
  border: '1px solid #444',
  color: '#888',
  padding: '8px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  marginLeft: window.innerWidth > 768 ? '15px' : '0'
};

export default Navbar;