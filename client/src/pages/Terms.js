import React, { useEffect } from 'react';

const Terms = () => {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div className="section-container" style={containerStyle}>
      <h1 style={titleStyle}>Terms of Service</h1>
      <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem' }}>
        Effective as of January 2026
      </p>
      
      <div style={contentCardStyle}>
        
        <section style={sectionStyle}>
          <h3 style={headerStyle}>1. Agreement for Service</h3>
          <p style={proseStyle}>
            By utilizing the booking portal or services provided by Johnson County Executive Transportation (JOCO EXEC), 
            the client agrees to abide by all terms and conditions set forth herein.
          </p>
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>2. Passenger Conduct</h3>
          <p style={proseStyle}>
            For the safety of our chauffeurs and the integrity of our fleet:
          </p>
          <ul style={listStyle}>
            <li>Smoking, vaping, and illegal drug use are strictly prohibited.</li>
            <li>We reserve the right to terminate any trip without refund if passengers become abusive or pose a safety risk.</li>
            <li>Alcohol consumption is only permitted in designated luxury vehicles in compliance with state laws.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>3. Fees & Damages</h3>
          <p style={proseStyle}>
            Clients are financially responsible for any physical damage caused to the vehicle by themselves or their guests. 
            A <strong>$250.00 minimum cleaning fee</strong> applies to any excessive mess (e.g., spills, sickness).
          </p>
        </section>

        <section style={{ ...sectionStyle, borderBottom: 'none' }}>
          <h3 style={headerStyle}>4. Service Limitations</h3>
          <p style={proseStyle}>
            While we pride ourselves on punctuality, JOCO EXEC is not liable for delays caused by:
          </p>
          <ul style={listStyle}>
            <li>Severe weather or "Acts of God."</li>
            <li>Unforeseen mechanical failure or road closures.</li>
            <li>Incorrect booking information provided by the client.</li>
          </ul>
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
  fontSize: '1rem', 
  lineHeight: '1.7',
  color: '#bbb'
};

const listStyle = {
  paddingLeft: '20px',
  color: '#aaa',
  fontSize: '0.95rem',
  lineHeight: '1.8',
  marginTop: '10px'
};

const backButtonStyle = {
  marginTop: '40px',
  width: window.innerWidth < 600 ? '100%' : 'auto',
  display: 'block'
};

export default Terms;