import React, { useEffect } from 'react';

const Privacy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="section-container" style={{padding: '60px 20px', color: '#ccc', maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{color: '#C5A059'}}>Privacy Policy</h1>
      <p>Last Updated: January 2026</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as your name, phone number, email address, and payment information when you book a ride.</p>

      <h3>2. How We Use Your Information</h3>
      <p>We use your information to facilitate your booking, process payments via Square, and communicate with you regarding your trip details.</p>

      <h3>3. Data Security</h3>
      <p>We do not store your full credit card numbers on our servers. All payments are securely processed by Square.</p>

      <h3>4. Contact Us</h3>
      <p>If you have questions about this policy, please contact us at info@jocoexec.com.</p>
    </div>
  );
};

export default Privacy;