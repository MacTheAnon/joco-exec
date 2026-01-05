import React, { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import SquarePayment from '../components/SquarePayment'; 

const Booking = () => {
  // Use 'step' to control the flow: 1 = Form, 2 = Payment, 3 = Success
  const [step, setStep] = useState(1); 
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  // Called when the initial booking form is submitted
  const handleBookingSubmit = (details) => {
    setBookingDetails(details);
    setStep(2); 
    window.scrollTo(0, 0);
  };

  // Called when SquarePayment confirms a successful transaction
  const handlePaymentSuccess = (details) => {
    // Optionally update details with payment info if needed
    setBookingDetails(details);
    setStep(3); // Move to the success view
    window.scrollTo(0, 0);
  };

  return (
    <div className="section-container" style={{ minHeight: '80vh', padding: '40px 20px', background: '#000', color: '#fff' }}>
      
      {/* STEP 1: INITIAL BOOKING FORM */}
      {step === 1 && (
        <>
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#C5A059' }}>Reserve Your Vehicle</h1>
          <BookingForm onSubmit={handleBookingSubmit} />
        </>
      )}

      {/* STEP 2: SQUARE PAYMENT */}
      {step === 2 && (
        <>
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#C5A059' }}>Secure Deposit</h1>
          <div style={{ maxWidth: '500px', margin: '0 auto 30px', color: '#ccc', textAlign: 'center' }}>
            Booking for: <strong style={{ color: '#C5A059' }}>{bookingDetails.date} at {bookingDetails.time}</strong>
          </div>
          
          <SquarePayment onSuccess={handlePaymentSuccess} bookingDetails={bookingDetails} />
          
          <button 
            onClick={() => setStep(1)} 
            style={{ display: 'block', margin: '20px auto', background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </>
      )}

      {/* STEP 3: SUCCESS / CONFIRMATION VIEW */}
      {step === 3 && (
        <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center', background: '#111', padding: '40px', border: '2px solid #C5A059', borderRadius: '8px' }}>
          <div style={{ fontSize: '4rem', color: '#C5A059', marginBottom: '20px' }}>✓</div>
          <h1 style={{ color: '#C5A059', marginTop: 0 }}>BOOKING CONFIRMED</h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc' }}>
            Thank you, {bookingDetails?.name}. Your luxury transport is locked in.
          </p>
          
          <div style={{ textAlign: 'left', background: '#000', padding: '20px', margin: '30px 0', border: '1px solid #333' }}>
            <p><strong>Confirmation ID:</strong> <span style={{ color: '#C5A059' }}>{Math.random().toString(36).toUpperCase().substring(2, 10)}</span></p>
            <p><strong>Date:</strong> {bookingDetails?.date}</p>
            <p><strong>Time:</strong> {bookingDetails?.time}</p>
            <p><strong>Pickup:</strong> {bookingDetails?.pickup}</p>
            <p><strong>Dropoff:</strong> {bookingDetails?.dropoff}</p>
          </div>

          <p style={{ color: '#888', fontSize: '0.9rem' }}>A confirmation email has been sent to {bookingDetails?.email}.</p>
          
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ background: '#C5A059', color: '#000', border: 'none', padding: '15px 30px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
          >
            RETURN HOME
          </button>
        </div>
      )}
    </div>
  );
};

export default Booking;