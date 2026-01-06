import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';

const SquarePayment = ({ onSuccess, bookingDetails }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Visual Display Calculation
  let displayAmount = bookingDetails.amount;
  if (bookingDetails.meetAndGreet) {
    displayAmount += 2500; // +$25.00
  }

  return (
    <div style={{maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ccc'}}>
      <h3 style={{color: '#000', marginTop: 0, textAlign: 'center'}}>Secure Booking Deposit</h3>
      
      <div style={{marginBottom: '20px', textAlign: 'center', background: '#f9f9f9', padding: '15px', borderRadius: '6px'}}>
        <p style={{margin: '5px 0', color: '#555'}}>Date: <strong>{bookingDetails.date}</strong></p>
        {bookingDetails.meetAndGreet && <p style={{margin: '5px 0', color: '#C5A059', fontWeight: 'bold'}}>+ Airport Meet & Greet Included</p>}
        <p style={{fontSize: '1.2rem', marginTop: '10px'}}>
          Total Deposit: <strong style={{color: '#000'}}>${(displayAmount / 100).toFixed(2)}</strong>
        </p>
      </div>

      <PaymentForm
        // MAKE SURE THIS IS YOUR SANDBOX APP ID
        applicationId="sandbox-sq0idb-7q_dOjTtu2YL5b5KSwwu9A"
        locationId="LD7WCY7X0HQT4"
        cardTokenizeResponseReceived={async (token) => {
          setIsSubmitting(true);
          try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.1.12:5000';
            const response = await fetch(`${apiUrl}/api/process-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sourceId: token.token,
                amount: bookingDetails.amount, // Send base amount
                bookingDetails: bookingDetails // Server reads meetAndGreet here
              }),
            });

            if (response.ok) {
              onSuccess(bookingDetails); 
            } else {
              const errorData = await response.json();
              alert(`Payment Error: ${errorData.error || 'Declined'}`);
              setIsSubmitting(false);
            }
          } catch (error) {
            alert('Network Error. Ensure Server is running and IP is correct.');
            setIsSubmitting(false);
          }
        }}
      >
        <CreditCard 
          buttonProps={{
            text: isSubmitting ? "Processing..." : `Pay $${(displayAmount / 100).toFixed(2)}`,
            css: {
              backgroundColor: isSubmitting ? '#ccc' : '#C5A059',
              fontSize: '16px',
              color: '#000',
              fontWeight: 'bold',
              marginTop: '20px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            },
          }}
        />
      </PaymentForm>
    </div>
  );
};

export default SquarePayment;