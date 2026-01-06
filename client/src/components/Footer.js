import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const isMobile = window.innerWidth < 768;

  return (
    <footer style={{
      background: '#000', 
      color: '#fff', 
      padding: '50px 20px 20px', 
      borderTop: '2px solid #C5A059',
      marginTop: 'auto' 
    }}>
      <div style={{
        maxWidth: '1100px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', // Stack on mobile
        justifyContent: 'space-between', 
        gap: isMobile ? '40px' : '20px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        
        {/* LEFT: BRAND & CONTACT */}
        <div style={{ flex: 1 }}>
          <h3 style={{color: '#C5A059', margin: '0 0 10px 0', fontSize: '1.4rem'}}>JOCO EXEC</h3>
          <p style={{margin: '5px 0', fontSize: '0.9rem', color: '#888'}}>Johnson County Executive Transportation</p>
          
          <div style={{ marginTop: '15px' }}>
            <a href="tel:9133690854" style={contactLinkStyle}>📞 (913) 369-0854</a>
            <br />
            <a href="mailto:info@jocoexec.com" style={contactLinkStyle}>✉️ info@jocoexec.com</a>
          </div>
        </div>

        {/* CENTER: QUICK LINKS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <h4 style={{color: '#C5A059', margin: '0 0 5px 0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px'}}>Navigate</h4>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/booking" style={navLinkStyle}>Book a Ride</Link>
          <Link to="/login" style={navLinkStyle}>Driver Login</Link>
        </div>

        {/* RIGHT: LEGAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <h4 style={{color: '#C5A059', margin: '0 0 5px 0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px'}}>Legal</h4>
          <Link to="/privacy" style={legalLinkStyle}>Privacy Policy</Link>
          <Link to="/terms" style={legalLinkStyle}>Terms of Service</Link>
          <Link to="/refunds" style={legalLinkStyle}>Refunds & Cancellations</Link>
        </div>

      </div>

      {/* COPYRIGHT BOTTOM */}
      <div style={{
        textAlign: 'center', 
        marginTop: '50px', 
        paddingTop: '20px', 
        borderTop: '1px solid #1a1a1a', 
        fontSize: '0.75rem', 
        color: '#444'
      }}>
        © 2026 Johnson County Executive Transportation. Professional Chauffeurs. Immaculate Fleet.
      </div>
    </footer>
  );
};

// --- STYLES ---
const navLinkStyle = { 
  color: '#fff', 
  textDecoration: 'none', 
  fontSize: '0.95rem',
  transition: '0.3s'
};

const legalLinkStyle = { 
  ...navLinkStyle,
  color: '#666'
};

const contactLinkStyle = {
  color: '#C5A059',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '5px 0'
};

export default Footer;