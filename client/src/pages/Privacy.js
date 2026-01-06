import React, { useEffect } from 'react';

const Privacy = () => {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div className="section-container" style={containerStyle}>
      <h1 style={titleStyle}>Privacy Policy</h1>
      <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem' }}>Last Updated: January 2026</p>
      
      <div style={contentCardStyle}>
        <section style={sectionStyle}>
          <h3 style={headerStyle}>1. Information We Collect</h3>
          <p style={proseStyle}>
            We collect information you provide directly to us when booking a ride or registering as a chauffeur. 
            This includes your <strong>name, phone number, email address,</strong> and pickup/dropoff locations.
          </p>
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>2. Payment Processing</h3>
          <p style={proseStyle}>
            Your security is our priority. We use <strong>Square</strong> to process all financial transactions. 
            JOCO EXEC does not store, see, or have access to your full credit card numbers or CVV codes.
          </p>
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>3. How We Use Data</h3>
          <p style={proseStyle}>
            Data is used strictly for operational purposes: facilitating bookings, sending dispatch alerts via SMS/Email to chauffeurs, 
            and providing digital receipts. We never sell your personal information to third parties.
          </p>
        </section>

        <section style={{ ...sectionStyle, borderBottom: 'none' }}>
          <h3 style={headerStyle}>4. Contact Us</h3>
          <p style={proseStyle}>
            If you have questions regarding your data or wish to request data deletion, please contact our 
            administration team at:
          </p>
          <a href="mailto:info@jocoexec.com" style={{ color: '#C5A059', fontWeight: 'bold', textDecoration: 'underline' }}>
            info@jocoexec.com
          </a>
        </section>
      </div>

      <button 
        onClick={() => window.history.back()} 
        className="btn-outline" 
        style={backButtonStyle}
      >
        GO BACK
      </button>
    </div>
  );
};

// --- MOBILE-FIRST STYLES ---



const containerStyle = {
  padding: '40px 20px', 
  color: '#ccc', 
  maxWidth: '800px', 
  margin: '0 auto',
  textAlign: 'left',
  minHeight: '85vh',
  background: '#000'
};

const titleStyle = {
  color: '#C5A059',
  fontSize: window.innerWidth < 600 ? '1.8rem' : '2.5rem',
  marginBottom: '10px'
};

const contentCardStyle = {
  background: '#0f0f0f',
  padding: window.innerWidth < 600 ? '20px' : '40px',
  borderRadius: '12px',
  border: '1px solid #1a1a1a'
};

const sectionStyle = {
  marginBottom: '25px',
  paddingBottom: '20px',
  borderBottom: '1px solid #222'
};

const headerStyle = {
  color: '#C5A059',
  fontSize: '1.2rem',
  marginBottom: '10px'
};

const proseStyle = {
  fontSize: '1rem', // 16px equivalent for mobile readability
  lineHeight: '1.7',
  color: '#bbb'
};

const backButtonStyle = {
  marginTop: '40px',
  width: window.innerWidth < 600 ? '100%' : 'auto',
  display: 'block'
};

export default Privacy;