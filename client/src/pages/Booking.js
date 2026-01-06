import React, { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import SquarePayment from '../components/SquarePayment'; 

const Booking = () => {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Payment, 3 = Success
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Handler when user submits the details form
  const handleFormSubmit = (data) => {
    setBookingDetails(data);
    setStep(2); // Move to Payment
  };

  // Handler when payment is successful
  const handlePaymentSuccess = () => {
    setStep(3); // Move to Success
  };

  return (
    <div style={{ background: '#000', minHeight: '90vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        {/* STEP 1: BOOKING FORM */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#fff', fontFamily: '"Playfair Display", serif' }}>Reserve Your Ride</h1>
              <p style={{ color: '#888' }}>Enter your trip details below to check availability.</p>
            </div>
            <BookingForm onSubmit={handleFormSubmit} />
          </>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && bookingDetails && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#fff', fontFamily: '"Playfair Display", serif' }}>Secure Deposit</h1>
              <button 
                onClick={() => setStep(1)} 
                style={{ background: 'none', border: 'none', color: '#C5A059', cursor: 'pointer', textDecoration: 'underline' }}
              >
                &larr; Go Back to Edit Details
              </button>
            </div>
            <SquarePayment bookingDetails={bookingDetails} onSuccess={handlePaymentSuccess} />
          </>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: 'center', background: '#111', padding: '40px', borderRadius: '12px', border: '1px solid #C5A059' }}>
            <h1 style={{ color: '#C5A059', fontSize: '3rem', marginBottom: '20px' }}>✓</h1>
            <h2 style={{ color: '#fff' }}>Booking Confirmed!</h2>
            <p style={{ color: '#ccc', margin: '20px 0' }}>
              Thank you, {bookingDetails?.name}. We have received your deposit.
              <br />
              A confirmation email has been sent to <strong>{bookingDetails?.email}</strong>.
            </p>
            <a href="/" style={{ 
              display: 'inline-block', 
              marginTop: '20px', 
              padding: '12px 25px', 
              background: '#C5A059', 
              color: '#000', 
              textDecoration: 'none', 
              fontWeight: 'bold', 
              borderRadius: '4px' 
            }}>
              Return Home
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Booking;