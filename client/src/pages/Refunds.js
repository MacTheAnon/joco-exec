import React, { useEffect, useState } from 'react';

const Refunds = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    // Add resize listener for true responsiveness
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DYNAMIC STYLES ---
  const styles = {
    container: {
      padding: '40px 20px', 
      color: '#ccc', 
      maxWidth: '800px', 
      margin: '0 auto',
      textAlign: 'left',
      minHeight: '85vh',
      background: '#000'
    },
    title: {
      color: '#C5A059',
      fontSize: isMobile ? '1.8rem' : '2.5rem',
      marginBottom: '10px'
    },
    contentCard: {
      background: '#0f0f0f',
      padding: isMobile ? '20px' : '40px',
      borderRadius: '12px',
      border: '1px solid #1a1a1a'
    },
    section: {
      marginBottom: '25px',
      paddingBottom: '20px',
      borderBottom: '1px solid #222'
    },
    header: {
      color: '#C5A059',
      fontSize: '1.2rem',
      marginBottom: '10px'
    },
    prose: {
      fontSize: '1rem', 
      lineHeight: '1.7',
      color: '#bbb'
    },
    refundGrid: {
      display: 'flex',
      marginTop: '20px',
      background: '#000',
      borderRadius: '8px',
      border: '1px solid #222'
    },
    refundBox: {
      flex: 1,
      padding: '15px',
      textAlign: 'center'
    },
    backButton: {
      marginTop: '40px',
      width: isMobile ? '100%' : 'auto',
      display: 'block',
      padding: '12px 25px',
      background: 'transparent',
      border: '1px solid #C5A059',
      color: '#C5A059',
      fontSize: '1rem',
      cursor: 'pointer',
      borderRadius: '4px'
    }
  };

  return (
    <div className="section-container" style={styles.container}>
      <h1 style={styles.title}>Refund Policy</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>Standard operating procedures for JOCO EXEC bookings.</p>
      
      <div style={styles.contentCard}>
        
        {/* REFUND ELIGIBILITY VISUAL */}
        
        <section style={styles.section}>
          <h3 style={styles.header}>1. Refund Eligibility</h3>
          <p style={styles.prose}>
            Refunds are processed based on the notice provided prior to the scheduled pickup time:
          </p>
          <div style={styles.refundGrid}>
            <div style={styles.refundBox}>
              <strong style={{color: '#4caf50'}}>FULL REFUND</strong>
              <p style={{fontSize: '0.85rem', margin: '5px 0 0'}}>24+ Hours Notice</p>
            </div>
            <div style={{...styles.refundBox, borderLeft: '1px solid #333'}}>
              <strong style={{color: '#ff4444'}}>NO REFUND</strong>
              <p style={{fontSize: '0.85rem', margin: '5px 0 0'}}>Under 24 Hours</p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.header}>2. Processing Time</h3>
          <p style={styles.prose}>
            Once a refund is approved, the request is sent to <strong>Square</strong> immediately. 
            Depending on your financial institution, funds typically reappear in your account within <strong>3-5 business days</strong>.
          </p>
        </section>

        <section style={styles.section}>
          <h3 style={styles.header}>3. No-Shows & Delays</h3>
          <p style={styles.prose}>
            If a passenger fails to arrive within 30 minutes of the scheduled time, the trip is classified as a "No-Show." 
            In these cases, the full amount is non-refundable as the chauffeur's time was dedicated to your reservation.
          </p>
        </section>

        <section style={{ ...styles.section, borderBottom: 'none' }}>
          <h3 style={styles.header}>4. Exceptional Circumstances</h3>
          <p style={styles.prose}>
            Flight cancellations or extreme weather events are handled on a case-by-case basis. 
            Please contact us as soon as you become aware of a travel disruption.
          </p>
        </section>
      </div>

      <button 
        onClick={() => window.history.back()} 
        style={styles.backButton}
      >
        GO BACK
      </button>
    </div>
  );
};

export default Refunds;