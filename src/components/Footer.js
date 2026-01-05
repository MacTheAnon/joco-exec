import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#000', 
      color: '#fff', 
      padding: '40px 20px', 
      borderTop: '2px solid #C5A059',
      marginTop: 'auto' 
    }}>
      <div style={{
        maxWidth: '1000px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        
        {/* LEFT: BRAND & CONTACT */}
        <div>
          <h3 style={{color: '#C5A059', margin: '0 0 10px 0'}}>JOCO EXEC</h3>
          <p style={{margin: '5px 0', fontSize: '0.9rem', color: '#ccc'}}>Johnson County Executive Transportation</p>
          <p style={{margin: '5px 0', fontSize: '0.9rem'}}>📞 (913)369-0854</p>
          {/* EMAIL ADDED HERE */}
          <p style={{margin: '5px 0', fontSize: '0.9rem'}}>✉️ info@jocoexec.com</p>
        </div>

        {/* CENTER: QUICK LINKS */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <h4 style={{color: '#C5A059', margin: '0 0 5px 0'}}>Navigate</h4>
          <Link to="/" style={{color: '#fff', textDecoration: 'none', fontSize: '0.9rem'}}>Home</Link>
          <Link to="/booking" style={{color: '#fff', textDecoration: 'none', fontSize: '0.9rem'}}>Book Now</Link>
        </div>

        {/* RIGHT: LEGAL */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <h4 style={{color: '#C5A059', margin: '0 0 5px 0'}}>Legal</h4>
          <Link to="/privacy" style={{color: '#888', fontSize: '0.9rem', textDecoration: 'none'}}>Privacy Policy</Link>
          <Link to="/terms" style={{color: '#888', fontSize: '0.9rem', textDecoration: 'none'}}>Terms of Service</Link>
          <Link to="/refunds" style={{color: '#888', fontSize: '0.9rem', textDecoration: 'none'}}>Cancellation Policy</Link>
        </div>

      </div>

      {/* COPYRIGHT BOTTOM */}
      <div style={{textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #333', fontSize: '0.8rem', color: '#666'}}>
        © 2025 Johnson County Executive Transportation. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;