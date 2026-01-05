import React, { useEffect } from 'react';

const CancellationPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="section-container" style={{textAlign: 'left', maxWidth: '800px'}}>
      <h1>Cancellation & Refund Policy</h1>
      <div style={{background: '#1E1E1E', padding: '30px', borderRadius: '8px', border: '1px solid #333', marginTop: '30px'}}>
        <h3>1. The 12-Hour Cancellation Rule</h3>
        <p>We strictly adhere to the following windows:</p>
        <ul>
          <li><strong>More than 12 Hours Notice:</strong> You are eligible for a <span style={{color:'#4caf50', fontWeight:'bold'}}>Full Refund</span>.</li>
          <li><strong>Less than 12 Hours Notice:</strong> <span style={{color:'#ff4444', fontWeight:'bold'}}>No Refund Available</span>.</li>
        </ul>
        <h3>2. No-Show Policy</h3>
        <p>A "No-Show" results in a charge of 100% of the trip cost.</p>
        <h3>3. Cleaning Fees</h3>
        <p>Excessive mess or smoking/vaping results in a minimum <strong>$250.00</strong> cleaning fee.</p>
      </div>
    </div>
  );
};
export default CancellationPolicy;