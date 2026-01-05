import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';

const SquarePayment = ({ onSuccess, bookingDetails }) => {
  const [selectedAmount, setSelectedAmount] = useState(7500); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentOptions = [
    { label: "Sedan - Trip Minimum ($75)", value: 7500 },
    { label: "SUV - Trip Minimum ($95)", value: 7500 },
    { label: "Night Out - Minimum ($150)", value: 15000 },
  ];

  return (
    <div style={{maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ccc'}}>
      <h3 style={{color: '#000', marginTop: 0, textAlign: 'center'}}>Secure Booking Deposit</h3>
      
      <div style={{marginBottom: '20px'}}>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Select Service Type:</label>
        <select 
          disabled={isSubmitting}
          value={selectedAmount} 
          onChange={(e) => setSelectedAmount(Number(e.target.value))}
          style={{width: '100%', padding: '10px', fontSize: '1rem', marginBottom: '10px'}}
        >
          {paymentOptions.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p style={{fontSize: '0.9rem', color: '#666', margin: 0}}>
          Total to charge: <strong>${(selectedAmount / 100).toFixed(2)}</strong>
        </p>
      </div>

      <hr style={{border: '0', borderTop: '1px solid #eee', margin: '20px 0'}} />

      <PaymentForm
        applicationId="sandbox-sq0idb-7q_dOjT-tu2YL5b5KSwwu9A"
        locationId="LD7WCY7X0HQT4"
        cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
          setIsSubmitting(true);
          try {
            const response = await fetch('http://localhost:5000/api/process-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sourceId: token.token,
                amount: selectedAmount,
                bookingDetails: bookingDetails 
              }),
            });

            const data = await response.json();

            if (response.ok) {
              onSuccess(bookingDetails); 
            } else {
              alert(data.error || 'Payment Failed');
              setIsSubmitting(false);
            }
          } catch (error) {
            console.error("Error:", error);
            alert('Connection Error. Make sure your server is running.');
            setIsSubmitting(false);
          }
        }}
      >
        <CreditCard 
          buttonProps={{
            text: isSubmitting ? "Processing..." : `Pay $${(selectedAmount / 100).toFixed(2)}`,
            css: {
              backgroundColor: isSubmitting ? '#ccc' : '#C5A059',
              fontSize: '16px',
              color: '#000',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: isSubmitting ? '#ccc' : '#b38f4d',
              },
            },
          }}
        />
      </PaymentForm>
      
      {isSubmitting && (
        <p style={{ textAlign: 'center', color: '#C5A059', fontSize: '0.8rem', marginTop: '10px' }}>
          Please do not refresh the page...
        </p>
      )}
    </div>
  );
};

export default SquarePayment;