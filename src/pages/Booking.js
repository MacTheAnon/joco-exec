import React, { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import SquarePayment from '../components/SquarePayment'; 

const Booking = () => {
  const [step, setStep] = useState(1); 
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleBookingSubmit = (details) => {
    setBookingDetails(details);
    setStep(2); 
    window.scrollTo(0, 0);
  };
const Booking = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [details, setDetails] = useState(null);

  const handleSuccess = (bookingData) => {
    setDetails(bookingData);
    setIsConfirmed(true);
    window.scrollTo(0, 0);
  };

  if (isConfirmed) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', minHeight: '80vh', color: '#fff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#000', border: '2px solid #C5A059', padding: '40px', borderRadius: '8px' }}>
          <div style={{ fontSize: '4rem', color: '#C5A059', marginBottom: '20px' }}>✓</div>
          <h1 style={{ color: '#C5A059', marginTop: 0 }}>BOOKING CONFIRMED</h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Thank you, {details.name}. Your luxury transport is locked in.</p>
          
          <div style={{ textAlign: 'left', background: '#111', padding: '20px', margin: '30px 0', border: '1px solid #333' }}>
            <p><strong>Confirmation ID:</strong> <span style={{color: '#C5A059'}}>{Math.random().toString(36).toUpperCase().substring(2, 10)}</span></p>
            <p><strong>Date:</strong> {details.date}</p>
            <p><strong>Time:</strong> {details.time}</p>
            <p><strong>Pickup:</strong> {details.pickup}</p>
            <p><strong>Dropoff:</strong> {details.dropoff}</p>
          </div>

          <p style={{ color: '#888', fontSize: '0.9rem' }}>A confirmation email has been sent to {details.email}.</p>
          
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ background: '#C5A059', color: '#000', border: 'none', padding: '15px 30px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  // ... rest of your existing booking form code ...
}
  const handlePaymentSuccess = () => {
    setStep(3); 
    window.scrollTo(0, 0);
  };

  return (
    <div className="section-container" style={{minHeight: '80vh', padding: '40px 20px'}}>
      
      {/* STEP 1: FORM */}
      {step === 1 && (
        <>
          <h1 style={{textAlign: 'center', marginBottom: '40px'}}>Reserve Your Vehicle</h1>
          <BookingForm onSubmit={handleBookingSubmit} />
        </>
      )}

      {/* STEP 2: PAYMENT */}
      {step === 2 && (
        <>
          <h1 style={{textAlign: 'center', marginBottom: '40px'}}>Secure Deposit</h1>
          <div style={{maxWidth: '500px', margin: '0 auto 30px', color: '#ccc', textAlign: 'center'}}>
            Booking for: <strong style={{color: '#C5A059'}}>{bookingDetails.date} at {bookingDetails.time}</strong>
          </div>
          
          {/* PASS DETAILS TO PAYMENT COMPONENT */}
          <SquarePayment onSuccess={handlePaymentSuccess} bookingDetails={bookingDetails} />
          
          <button 
            onClick={() => setStep(1)} 
            style={{display: 'block', margin: '20px auto', background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer'}}
          >
            Go Back
          </button>
        </>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div style={{maxWidth: '600px', margin: '50px auto', textAlign: 'center', background: '#111', padding: '40px', border: '2px solid #C5A059', borderRadius: '8px'}}>
          <div style={{fontSize: '3rem', marginBottom: '20px'}}>✅</div>
          <h1 style={{color: '#C5A059'}}>Booking Confirmed!</h1>
          <p style={{color: '#fff', fontSize: '1.2rem'}}>Thank you for choosing Joco Executive.</p>
          <p style={{marginTop: '30px', color: '#888'}}>We will contact you shortly to confirm chauffeur details.</p>
        </div>
      )}
    </div>
  );
};

export default Booking;