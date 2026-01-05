import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import logo from '../logo.png'; // Ensure your file is named logo.png

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* LOGO IMAGE LINK */}
        <Link to="/">
          <img src={logo} alt="Johnson County Executive" className="nav-logo-img" />
        </Link>
        
        <ul className="nav-menu">
          <li><Link to="/" className="nav-links">Home</Link></li>
          <li><Link to="/booking" className="nav-links">Book Now</Link></li>
          <li>
            <a href="tel:5555555555" className="btn-primary" style={{padding:'8px 20px', fontSize:'0.9rem'}}>
              <Phone size={16} style={{marginRight:'8px'}}/> CALL US
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;