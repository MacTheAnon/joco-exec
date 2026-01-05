import React, { useEffect } from 'react';

const Refunds = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="section-container" style={{padding: '60px 20px', color: '#ccc', maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{color: '#C5A059'}}>Cancellation & Refund Policy</h1>
      
      <h3>1. Cancellation Window</h3>
      <p>Cancellations made <strong>at least 24 hours</strong> before the scheduled pickup time are eligible for a full refund of the deposit.</p>

      <h3>2. Late Cancellations</h3>
      <p>Cancellations made within 24 hours of the trip are non-refundable. The deposit will be forfeited to compensate the driver for the reserved time.</p>

      <h3>3. No-Shows</h3>
      <p>If the passenger does not appear at the pickup location within 30 minutes of the scheduled time without contact, the full fare will be charged.</p>
    </div>
  );
};

export default Refunds;