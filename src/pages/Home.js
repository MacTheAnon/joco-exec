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
        <div className="hero-overlay">
          <h1>Johnson County Executive Transportation</h1>
          <p style={{fontSize: '1.2rem', margin: '20px 0'}}>Premier Limo Service in the Kansas City Metropolitan Area</p>
          <div style={{marginTop: '30px'}}>
            <Link to="/booking" className="btn-primary">Book a Ride</Link>
            <button 
              onClick={scrollToRates} 
              className="btn-outline" 
              style={{
                background: 'transparent', 
                fontSize: '1rem', 
                cursor: 'pointer', 
                fontFamily: 'inherit'
              }}
            >
              View Rates
            </button>
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section className="section-container">
        <h2>About Us</h2>
        <p style={{maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', color: '#ccc'}}>
          Welcome to Johnson County Executive Transportation. For over seven years, we’ve been dedicated to providing reliable, dependable, and luxurious transportation for our clients. Whether you need an airport transfer or a night out, we ensure a premium experience.
        </p>
      </section>

      {/* FEATURES */}
      <section style={{background: '#1a1a1a', padding: '60px 5%'}}>
        <div className="section-container" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px'}}>
          <div style={{maxWidth: '250px', textAlign: 'center'}}>
            <Shield size={50} color="#C5A059" />
            <h3 style={{marginTop: '15px'}}>Safe & Secure</h3>
            <p style={{fontSize: '0.9rem', color: '#999'}}>Professional, vetted chauffeurs with clean driving records.</p>
          </div>
          <div style={{maxWidth: '250px', textAlign: 'center'}}>
            <Clock size={50} color="#C5A059" />
            <h3 style={{marginTop: '15px'}}>Always On Time</h3>
            <p style={{fontSize: '0.9rem', color: '#999'}}>We track flights and traffic to ensure punctual arrivals.</p>
          </div>
          <div style={{maxWidth: '250px', textAlign: 'center'}}>
            <Award size={50} color="#C5A059" />
            <h3 style={{marginTop: '15px'}}>Luxury Fleet</h3>
            <p style={{fontSize: '0.9rem', color: '#999'}}>Immaculate Sedans and SUVs for ultimate comfort.</p>
          </div>
        </div>
      </section>

      {/* PRICING GRID */}
      <section id="rates" className="section-container" style={{scrollMarginTop: '100px'}}>
        <h2>Our Fleet & Rates</h2>
        <p style={{color: '#888', marginBottom: '40px'}}>Transparent pricing. Easy online booking & prepayment.</p>
        
        <div className="pricing-grid">
          
          {/* CARD 1: LUXURY SEDAN */}
          <div className="price-card">
            <h3>Luxury Sedan</h3>
            <p style={{color: '#888', fontSize: '0.9rem'}}>Lincoln Continental or Similar</p>
            <div className="price-tag">$75</div>
            <p style={{color: '#C5A059', fontWeight: 'bold', fontSize: '0.9rem'}}>Minimum for All Trips</p>
            <ul className="price-features">
              <li><MapPin size={14} style={{marginRight: '8px'}}/> Great for Airport Transfers</li>
              <li>Up to 3 Passengers</li>
              <li>2 Large Suitcases</li>
              <li><CreditCard size={14} style={{marginRight: '8px'}}/> Online Prepayment</li>
            </ul>
            <Link to="/booking" className="btn-card">Book Sedan</Link>
          </div>

          {/* CARD 2: EXECUTIVE SUV */}
          <div className="price-card featured">
            <div style={{background: '#C5A059', color: '#000', fontSize: '0.8rem', fontWeight: 'bold', padding: '5px', borderRadius: '4px', marginBottom: '10px', display: 'inline-block'}}>MOST POPULAR</div>
            <h3>Executive SUV</h3>
            <p style={{color: '#888', fontSize: '0.9rem'}}>Cadillac Escalade / Suburban</p>
            <div className="price-tag">$95</div>
            <p style={{color: '#C5A059', fontWeight: 'bold', fontSize: '0.9rem'}}>Minimum for All Trips</p>
            <ul className="price-features">
              <li><MapPin size={14} style={{marginRight: '8px'}}/> Great for Airport Transfers</li>
              <li>Up to 6 Passengers</li>
              <li>6 Large Suitcases</li>
              <li><CreditCard size={14} style={{marginRight: '8px'}}/> Online Prepayment</li>
            </ul>
            <Link to="/booking" className="btn-card primary">Book SUV</Link>
          </div>

          {/* CARD 3: NIGHT OUT */}
          <div className="price-card">
            <h3>Night Out</h3>
            <p style={{color: '#888', fontSize: '0.9rem'}}>Concerts, Dates, & Sports</p>
            <div className="price-tag">$150<span style={{fontSize: '1rem', color: '#666'}}> min</span></div>
            <p style={{color: '#C5A059', fontWeight: 'bold', fontSize: '0.9rem'}}>Starting Rate</p>
            <ul className="price-features">
              <li><Music size={14} style={{marginRight: '8px'}}/> Arrowhead & T-Mobile Center</li>
              <li><Award size={14} style={{marginRight: '8px'}}/> Date Nights & Special Events</li>
              <li>Unlimited Stops</li>
              <li><CreditCard size={14} style={{marginRight: '8px'}}/> Online Prepayment</li>
            </ul>
            <Link to="/booking" className="btn-card">Book Night Out</Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/booking">Book Now</Link>
          <a href="tel:9133690854">Contact</a>
        </div>
        <p style={{color: '#444', fontSize: '0.8rem', marginTop: '20px'}}>© 2025 Johnson County Executive Transportation</p>
      </footer>
    </div>
  );
};

export default Home;