import React, { useEffect } from 'react';

const CancellationPolicy = () => {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div className="section-container" style={containerStyle}>
      <h1 style={titleStyle}>Cancellation & Refunds</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>Our policies ensure fleet availability and chauffeur reliability.</p>

      <div style={policyCardStyle}>
        
        {/* 1. THE 12-HOUR RULE */}
        <section style={sectionStyle}>
          <h3 style={headerStyle}>1. The 24-Hour Window</h3>
          <p style={proseStyle}>We require a minimum of 24 hours notice for all cancellations to manage our fleet effectively.</p>
          
          <div style={timelineWrapper}>
            <div style={timelineBox}>
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>24+ Hours</span>
              <p style={{ margin: '5px 0 0', fontSize: '0.85rem' }}>Full Refund Issued</p>
            </div>
            <div style={{ ...timelineBox, borderLeft: '2px solid #333' }}>
              <span style={{ color: '#ff4444', fontWeight: 'bold' }}>&lt;Within 24 Hours</span>
              <p style={{ margin: '5px 0 0', fontSize: '0.85rem' }}>Non-Refundable</p>
            </div>
          </div>
        </section>

        {/* 2. NO-SHOWS */}
        <section style={sectionStyle}>
          <h3 style={headerStyle}>2. No-Show Policy</h3>
          <p style={proseStyle}>
            If the passenger is not present at the pickup location within 30 minutes of the scheduled time 
            without communication, it is considered a "No-Show" and is charged 100% of the fare.
          </p>
        </section>

        {/* 3. CLEANING & DAMAGE */}
        <section style={{ ...sectionStyle, borderBottom: 'none', paddingBottom: 0 }}>
          <h3 style={headerStyle}>3. Vehicle Integrity</h3>
          <p style={proseStyle}>
            To maintain our executive standards, the following fees apply:
          </p>
          <ul style={listStyle}>
            <li><strong style={{color: '#fff'}}>$250.00 Minimum</strong> cleaning fee for excessive mess.</li>
            <li>Smoking or Vaping is strictly prohibited in all vehicles.</li>
            <li>Damages to the interior will be billed at actual repair cost.</li>
          </ul>
        </section>
      </div>

      <button 
        onClick={() => window.history.back()} 
        className="btn-outline" 
        style={{ marginTop: '40px', width: window.innerWidth < 600 ? '100%' : 'auto' }}
      >
        GO BACK
      </button>
    </div>
  );
};

// --- MOBILE-FIRST STYLES ---

const containerStyle = {
  textAlign: 'left', 
  maxWidth: '800px', 
  padding: '40px 20px',
  margin: '0 auto',
  minHeight: '85vh',
  background: '#000'
};

const titleStyle = {
  fontSize: window.innerWidth < 600 ? '1.8rem' : '2.5rem',
  marginBottom: '10px'
};

const policyCardStyle = {
  background: '#0f0f0f', 
  padding: window.innerWidth < 600 ? '20px' : '40px', 
  borderRadius: '12px', 
  border: '1px solid #1a1a1a', 
  marginTop: '20px'
};

const sectionStyle = {
  marginBottom: '30px',
  paddingBottom: '25px',
  borderBottom: '1px solid #222'
};

const headerStyle = {
  fontSize: '1.2rem',
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center'
};

const proseStyle = {
  color: '#ccc',
  fontSize: '0.95rem',
  lineHeight: '1.7'
};

const listStyle = {
  paddingLeft: '20px',
  color: '#aaa',
  fontSize: '0.95rem',
  lineHeight: '2'
};

const timelineWrapper = {
  display: 'flex',
  marginTop: '20px',
  background: '#000',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #222'
};

const timelineBox = {
  flex: 1,
  padding: '15px',
  textAlign: 'center'
};

export default CancellationPolicy;