import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { API_URL } from '../apiConfig'; // ✅ New Config Import

const SquarePayment = ({ onSuccess, bookingDetails }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  let displayAmount = bookingDetails.amount;
  if (bookingDetails.meetAndGreet) {
    displayAmount += 2500;
  }

  return (
    <div style={{maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ccc'}}>
      <h3 style={{color: '#000', marginTop: 0, textAlign: 'center'}}>Secure Booking Deposit</h3>
      
      <div style={{marginBottom: '20px', textAlign: 'center', background: '#f9f9f9', padding: '15px', borderRadius: '6px'}}>
        <p style={{margin: '5px 0', color: '#555'}}>Date: <strong>{bookingDetails.date}</strong></p>
        <p style={{margin: '5px 0', color: '#555'}}>Service: <strong>{bookingDetails.vehicleType || 'Standard'}</strong></p>
        {bookingDetails.meetAndGreet && (<p style={{margin: '5px 0', color: '#C5A059', fontWeight: 'bold'}}>+ Airport Meet & Greet Included</p>)}
        <p style={{fontSize: '1.2rem', marginTop: '10px'}}>Total Deposit: <strong style={{color: '#000'}}>${(displayAmount / 100).toFixed(2)}</strong></p>
      </div>

      <PaymentForm
        applicationId={process.env.REACT_APP_SQUARE_APP_ID}
        locationId={process.env.REACT_APP_SQUARE_LOCATION_ID}
        
        cardTokenizeResponseReceived={async (token) => {
          setIsSubmitting(true);
          try {
            const response = await fetch(`${API_URL}/api/process-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sourceId: token.token,
                vehicleType: bookingDetails.vehicleType, 
                pickup: bookingDetails.pickup, 
                dropoff: bookingDetails.dropoff,
                bookingDetails: bookingDetails 
              }),
            });

            if (response.ok) {
              const data = await response.json();
              onSuccess(data); 
            } else {
              const errorData = await response.json();
              alert(`Payment Error: ${errorData.error || 'Declined'}`);
              setIsSubmitting(false);
            }
          } catch (error) {
            alert('Network Error. Ensure Server is running.');
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