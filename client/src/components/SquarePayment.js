import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';

const SquarePayment = ({ onSuccess, bookingDetails, amount }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div style={{maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ccc'}}>
      <h3 style={{color: '#000', marginTop: 0, textAlign: 'center'}}>Secure Checkout</h3>
      
      <p style={{textAlign: 'center', color: '#555', marginBottom: '20px'}}>
        Amount to Charge: <strong style={{color: '#000'}}>${(amount / 100).toFixed(2)}</strong>
      </p>

      <PaymentForm
        applicationId="sandbox-sq0idb-7q_dOjTtu2YL5b5KSwwu9A"
        locationId="LD7WCY7X0HQT4"
        cardTokenizeResponseReceived={async (token) => {
          setIsSubmitting(true);
          try {
            const response = await fetch('http://localhost:5000/api/process-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sourceId: token.token,
                amount: amount, 
                bookingDetails: bookingDetails 
              }),
            });

            if (response.ok) {
              onSuccess(bookingDetails); 
            } else {
              const errorData = await response.json();
              alert(`Payment Failed: ${errorData.error}`);
              setIsSubmitting(false);
            }
          } catch (error) {
            alert('Server connection error.');
            setIsSubmitting(false);
          }
        }}
      >
        <CreditCard 
          buttonProps={{
            text: isSubmitting ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`,
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