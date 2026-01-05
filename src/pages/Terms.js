import React, { useEffect } from 'react';

const Terms = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="section-container" style={{padding: '60px 20px', color: '#ccc', maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{color: '#C5A059'}}>Terms of Service</h1>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By booking a service with Johnson County Executive Transportation, you agree to these terms.</p>

      <h3>2. Conduct</h3>
      <p>Smoking and illegal drug use are strictly prohibited in all vehicles. We reserve the right to terminate the trip immediately if these rules are violated.</p>

      <h3>3. Cleaning Fees</h3>
      <p>A minimum cleaning fee of $250 will be charged for any excessive mess or damage caused to the vehicle.</p>

      <h3>4. Liability</h3>
      <p>We are not responsible for delays caused by severe weather, traffic conditions, or mechanical failure, though we will make every effort to accommodate you.</p>
    </div>
  );
};

export default Terms;