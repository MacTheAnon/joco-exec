import React, { useEffect } from 'react';

const Refunds = () => {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div className="section-container" style={containerStyle}>
      <h1 style={titleStyle}>Refund Policy</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>Standard operating procedures for JOCO EXEC bookings.</p>
      
      <div style={contentCardStyle}>
        
        {/* REFUND ELIGIBILITY VISUAL */}
        
        <section style={sectionStyle}>
          <h3 style={headerStyle}>1. Refund Eligibility</h3>
          <p style={proseStyle}>
            Refunds are processed based on the notice provided prior to the scheduled pickup time:
          </p>
          <div style={refundGrid}>
            <div style={refundBox}>
              <strong style={{color: '#4caf50'}}>FULL REFUND</strong>
              <p style={{fontSize: '0.85rem', margin: '5px 0 0'}}>12+ Hours Notice</p>
            </div>
            <div style={{...refundBox, borderLeft: '1px solid #333'}}>
              <strong style={{color: '#ff4444'}}>NO REFUND</strong>
              <p style={{fontSize: '0.85rem', margin: '5px 0 0'}}>Under 12 Hours</p>
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>2. Processing Time</h3>
          <p style={proseStyle}>
            Once a refund is approved, the request is sent to <strong>Square</strong> immediately. 
            Depending on your financial institution, funds typically reappear in your account within <strong>3-5 business days</strong>.
          </p>
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>3. No-Shows & Delays</h3>
          <p style={proseStyle}>
            If a passenger fails to arrive within 30 minutes of the scheduled time, the trip is classified as a "No-Show." 
            In these cases, the full amount is non-refundable as the chauffeur's time was dedicated to your reservation.
          </p>
        </section>

        <section style={{ ...sectionStyle, borderBottom: 'none' }}>
          <h3 style={headerStyle}>4. Exceptional Circumstances</h3>
          <p style={proseStyle}>
            Flight cancellations or extreme weather events are handled on a case-by-case basis. 
            Please contact us as soon as you become aware of a travel disruption.
          </p>
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

const refundGrid = {
  display: 'flex',
  marginTop: '20px',
  background: '#000',
  borderRadius: '8px',
  border: '1px solid #222'
};

const refundBox = {
  flex: 1,
  padding: '15px',
  textAlign: 'center'
};

const backButtonStyle = {
  marginTop: '40px',
  width: window.innerWidth < 600 ? '100%' : 'auto',
  display: 'block'
};

export default Refunds;