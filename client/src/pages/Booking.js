import React, { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import SquarePayment from '../components/SquarePayment'; 

const Booking = () => {
  const [step, setStep] = useState(1); 
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  const handleBookingSubmit = (details) => {
    setBookingDetails(details);
    setStep(2); 
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = (details) => {
    setBookingDetails(details);
    setStep(3); 
    window.scrollTo(0, 0);
  };

  return (
    <div className="section-container" style={pageContainerStyle}>
      
      {/* --- PROGRESS INDICATOR --- */}
      {step < 3 && (
        <div style={progressWrapper}>
          <div style={{...stepDot, background: step >= 1 ? '#C5A059' : '#333'}}>1</div>
          <div style={{...stepLine, background: step >= 2 ? '#C5A059' : '#333'}}></div>
          <div style={{...stepDot, background: step >= 2 ? '#C5A059' : '#333'}}>2</div>
          <div style={{...stepLine, background: step >= 3 ? '#C5A059' : '#333'}}></div>
          <div style={{...stepDot, background: step >= 3 ? '#C5A059' : '#333'}}>3</div>
        </div>
      )}

      {/* STEP 1: INITIAL BOOKING FORM */}
      {step === 1 && (
        <div style={formWrapper}>
          <h1 style={titleStyle}>Reserve Your Vehicle</h1>
          <p style={subtitleStyle}>Professional Chauffeur Service</p>
          <BookingForm onSubmit={handleBookingSubmit} />
        </div>
      )}

      {/* STEP 2: SQUARE PAYMENT */}
      {step === 2 && (
        <div style={formWrapper}>
          <h1 style={titleStyle}>Secure Deposit</h1>
          <div style={summaryBox}>
            <p style={{margin: 0}}>Booking for:</p>
            <strong style={{ color: '#C5A059', fontSize: '1.1rem' }}>
              {bookingDetails.date} at {bookingDetails.time}
            </strong>
          </div>
          
          <SquarePayment onSuccess={handlePaymentSuccess} bookingDetails={bookingDetails} />
          
          <button 
            onClick={() => setStep(1)} 
            style={backButtonStyle}
          >
            ← Change Trip Details
          </button>
        </div>
      )}

      {/* STEP 3: SUCCESS VIEW */}
      {step === 3 && (
        <div style={successCard}>
          <div style={successIcon}>✓</div>
          <h1 style={{ color: '#C5A059', marginTop: 0, fontSize: '1.8rem' }}>CONFIRMED</h1>
          <p style={{ color: '#ccc' }}>
            Thank you, {bookingDetails?.name}. Your luxury transport is locked in.
          </p>
          
          <div style={detailsList}>
            <p style={detailItem}><strong>Date:</strong> {bookingDetails?.date}</p>
            <p style={detailItem}><strong>Time:</strong> {bookingDetails?.time}</p>
            <p style={detailItem}><strong>Pickup:</strong> {bookingDetails?.pickup}</p>
            <p style={detailItem}><strong>Dropoff:</strong> {bookingDetails?.dropoff}</p>
          </div>

          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '25px' }}>
            A confirmation email has been sent to {bookingDetails?.email}.
          </p>
          
          <button 
            onClick={() => window.location.href = '/'} 
            className="btn-primary"
            style={{ width: '100%', padding: '15px' }}
          >
            RETURN HOME
          </button>
        </div>
      )}
    </div>
  );
};

// --- MOBILE-FIRST STYLES ---



const pageContainerStyle = { 
  minHeight: '85vh', 
  padding: '20px', 
  background: '#000', 
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const formWrapper = { width: '100%', maxWidth: '500px' };

const titleStyle = { textAlign: 'center', marginBottom: '10px', color: '#C5A059', fontSize: '1.8rem' };
const subtitleStyle = { textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '1rem' };

const progressWrapper = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', width: '100%', maxWidth: '300px' };
const stepDot = { width: '30px', height: '30px', borderRadius: '50%', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.3s' };
const stepLine = { height: '2px', flex: 1, transition: '0.3s' };

const summaryBox = { background: '#111', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '25px', border: '1px solid #222' };

const backButtonStyle = { display: 'block', margin: '30px auto', background: 'none', border: 'none', color: '#666', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' };

const successCard = { width: '100%', maxWidth: '500px', textAlign: 'center', background: '#0a0a0a', padding: '40px 20px', border: '1px solid #C5A059', borderRadius: '8px', marginTop: '30px' };
const successIcon = { fontSize: '3rem', color: '#C5A059', marginBottom: '10px' };

const detailsList = { textAlign: 'left', background: '#000', padding: '20px', margin: '25px 0', border: '1px solid #222', borderRadius: '4px' };
const detailItem = { margin: '8px 0', fontSize: '0.9rem', borderBottom: '1px solid #111', paddingBottom: '8px' };

export default Booking;