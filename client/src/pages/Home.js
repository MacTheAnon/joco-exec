import React, { useEffect } from 'react';
import { Shield, Clock, Award } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import SquarePayment from '../components/SquarePayment'; // Assuming this exists

const Home = () => {
  const [bookingData, setBookingData] = React.useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* --- HERO SECTION --- */}
      <section style={{ 
        background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
          
          <div style={{ textAlign: 'center', color: '#fff', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '3rem', fontFamily: '"Playfair Display", serif', marginBottom: '20px' }}>
              <span style={{ color: '#C5A059' }}>JOCO</span> EXEC
            </h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#ccc' }}>
              Johnson County's premier executive transportation service. 
              Elevate your travel experience with our luxury fleet.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '500px' }}>
            {!bookingData ? (
              <BookingForm onSubmit={(data) => setBookingData(data)} />
            ) : (
              <SquarePayment 
                bookingDetails={bookingData} 
                onSuccess={() => {
                  alert("Booking Confirmed!");
                  setBookingData(null);
                }} 
              />
            )}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section style={{ background: '#1a1a1a', padding: '80px 20px', color: '#fff' }}>
        <div style={featuresGridStyle}>
          
          <div style={featureItemStyle}>
            <Shield size={45} color="#C5A059" />
            <h3 style={{ fontSize: '1.3rem', marginTop: '15px', color: '#fff' }}>Safe & Secure</h3>
            <p style={featureSubtextStyle}>
              Professional, vetted chauffeurs with clean driving records.
            </p>
          </div>

          {/* UPDATED BADGE HERE */}
          <div style={featureItemStyle}>
            <Clock size={45} color="#C5A059" />
            <h3 style={{ fontSize: '1.3rem', marginTop: '15px', color: '#fff' }}>Executive Reliability</h3>
            <p style={featureSubtextStyle}>
              Real-time flight tracking and chauffeur coordination ensure your vehicle is on-site before you land.
            </p>
          </div>

          <div style={featureItemStyle}>
            <Award size={45} color="#C5A059" />
            <h3 style={{ fontSize: '1.3rem', marginTop: '15px', color: '#fff' }}>Luxury Fleet</h3>
            <p style={featureSubtextStyle}>
              Immaculate Sedans and SUVs maintained to the highest standards.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

// Styles
const featuresGridStyle = {
  display: 'flex',
  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '50px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const featureItemStyle = {
  maxWidth: '300px',
  textAlign: 'center',
  padding: '20px'
};

const featureSubtextStyle = {
  fontSize: '0.95rem',
  color: '#aaa',
  marginTop: '15px',
  lineHeight: '1.6'
};

export default Home;