import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin, Award, Music, CreditCard } from 'lucide-react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToRates = (e) => {
    e.preventDefault();
    const element = document.getElementById('rates');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      
      <div className="hero">
        <div className="hero-overlay" style={{ padding: '0 20px' }}>
          <h1 style={heroTitleStyle}>Johnson County Executive Transportation</h1>
          <p style={heroSubtitleStyle}>Premier Limo Service in the Kansas City Metropolitan Area</p>
          <div style={heroBtnContainer}>
            <Link to="/booking" className="btn-primary" style={mobileFullWidthBtn}>Book a Ride</Link>
            <button 
              onClick={scrollToRates} 
              className="btn-outline" 
              style={mobileOutlineBtn}
            >
              View Rates
            </button>
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section className="section-container" style={{ padding: '60px 20px' }}>
        <h2 style={{ fontSize: '1.8rem' }}>About Us</h2>
        <p style={aboutTextStyle}>
          Welcome to Johnson County Executive Transportation. For over seven years, we’ve been dedicated to providing reliable, dependable, and luxurious transportation for our clients. Whether you need an airport transfer or a night out, we ensure a premium experience.
        </p>
      </section>

      {/* FEATURES */}
      <section style={{ background: '#1a1a1a', padding: '60px 20px' }}>
        <div style={featuresGridStyle}>
          <div style={featureItemStyle}>
            <Shield size={40} color="#C5A059" />
            <h3 style={{ fontSize: '1.2rem', marginTop: '15px' }}>Safe & Secure</h3>
            <p style={featureSubtextStyle}>Professional, vetted chauffeurs with clean driving records.</p>
          </div>
          <div style={featureItemStyle}>
            <Clock size={40} color="#C5A059" />
            <h3 style={{ fontSize: '1.2rem', marginTop: '15px' }}>Always On Time</h3>
            <p style={featureSubtextStyle}>We track flights and traffic to ensure punctual arrivals.</p>
          </div>
          <div style={featureItemStyle}>
            <Award size={40} color="#C5A059" />
            <h3 style={{ fontSize: '1.2rem', marginTop: '15px' }}>Luxury Fleet</h3>
            <p style={featureSubtextStyle}>Immaculate Sedans and SUVs for ultimate comfort.</p>
          </div>
        </div>
      </section>

      {/* PRICING GRID */}
      
      <section id="rates" className="section-container" style={{ scrollMarginTop: '80px', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '1.8rem' }}>Our Fleet & Rates</h2>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '0.95rem' }}>Transparent pricing. Easy online booking & prepayment.</p>
        
        <div className="pricing-grid">
          
          {/* CARD 1: LUXURY SEDAN */}
          <div className="price-card">
            <h3>Luxury Sedan</h3>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Lincoln Continental or Similar</p>
            <div className="price-tag">$75</div>
            <p style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '0.85rem' }}>Minimum for All Trips</p>
            <ul className="price-features">
              <li><MapPin size={14} style={{ marginRight: '8px' }}/> Airport Transfers</li>
              <li>Up to 3 Passengers</li>
              <li>2 Large Suitcases</li>
              <li><CreditCard size={14} style={{ marginRight: '8px' }}/> Online Prepayment</li>
            </ul>
            <Link to="/booking" className="btn-card">Book Sedan</Link>
          </div>

          {/* CARD 2: EXECUTIVE SUV */}
          <div className="price-card featured">
            <div style={popularBadgeStyle}>MOST POPULAR</div>
            <h3>Executive SUV</h3>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Cadillac Escalade / Suburban</p>
            <div className="price-tag">$95</div>
            <p style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '0.85rem' }}>Minimum for All Trips</p>
            <ul className="price-features">
              <li><MapPin size={14} style={{ marginRight: '8px' }}/> Airport Transfers</li>
              <li>Up to 6 Passengers</li>
              <li>6 Large Suitcases</li>
              <li><CreditCard size={14} style={{ marginRight: '8px' }}/> Online Prepayment</li>
            </ul>
            <Link to="/booking" className="btn-card primary">Book SUV</Link>
          </div>

          {/* CARD 3: NIGHT OUT */}
          <div className="price-card">
            <h3>Night Out</h3>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Concerts, Dates, & Sports</p>
            <div className="price-tag">$150<span style={{ fontSize: '1rem', color: '#666' }}> min</span></div>
            <p style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '0.85rem' }}>Starting Rate</p>
            <ul className="price-features">
              <li><Music size={14} style={{ marginRight: '8px' }}/> Arrowhead & Center</li>
              <li><Award size={14} style={{ marginRight: '8px' }}/> Dates & Special Events</li>
              <li>Unlimited Stops</li>
              <li><CreditCard size={14} style={{ marginRight: '8px' }}/> Online Prepayment</li>
            </ul>
            <Link to="/booking" className="btn-card">Book Night Out</Link>
          </div>

        </div>
      </section>
    </div>
  );
};

// --- MOBILE RESPONSIVE STYLES ---

const heroTitleStyle = {
  fontSize: window.innerWidth < 768 ? '1.8rem' : '3rem',
  lineHeight: '1.2'
};

const heroSubtitleStyle = {
  fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
  margin: '20px 0'
};

const heroBtnContainer = {
  marginTop: '30px',
  display: 'flex',
  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
  gap: '15px',
  alignItems: 'center',
  justifyContent: 'center'
};

const mobileFullWidthBtn = {
  width: window.innerWidth < 768 ? '100%' : 'auto',
  textAlign: 'center'
};

const mobileOutlineBtn = {
  ...mobileFullWidthBtn,
  background: 'transparent', 
  fontSize: '1rem', 
  cursor: 'pointer', 
  fontFamily: 'inherit',
  border: '2px solid #fff',
  color: '#fff',
  padding: '12px 30px',
  borderRadius: '4px'
};

const aboutTextStyle = {
  maxWidth: '800px', 
  margin: '0 auto', 
  fontSize: window.innerWidth < 768 ? '1rem' : '1.1rem', 
  color: '#ccc',
  lineHeight: '1.6'
};

const featuresGridStyle = {
  display: 'flex', 
  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
  justifyContent: 'center', 
  alignItems: 'center',
  gap: '40px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const featureItemStyle = {
  maxWidth: '280px', 
  textAlign: 'center'
};

const featureSubtextStyle = {
  fontSize: '0.9rem', 
  color: '#999',
  marginTop: '10px'
};

const popularBadgeStyle = {
  background: '#C5A059', 
  color: '#000', 
  fontSize: '0.75rem', 
  fontWeight: 'bold', 
  padding: '5px 10px', 
  borderRadius: '4px', 
  marginBottom: '10px', 
  display: 'inline-block'
};

export default Home;