import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';

const SquarePayment = ({ onSuccess, bookingDetails }) => {
  // 1. Initialize with the first value
  const [selectedAmount, setSelectedAmount] = useState(7500); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Ensure every value is UNIQUE
  const paymentOptions = [
    { label: "Sedan - Trip Minimum ($85)", value: 8500 },
    { label: "SUV - Trip Minimum ($95)", value: 9500 }, 
    { label: "Night Out - Minimum ($150)", value: 15000 },
  ];

  return (
    <div style={{maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ccc'}}>
      <h3 style={{color: '#000', marginTop: 0, textAlign: 'center'}}>Secure Booking Deposit</h3>
      
      <div style={{marginBottom: '20px'}}>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Select Service Type:</label>
        
        {/* 3. The Select Logic must convert the string back to a Number */}
        <select 
          disabled={isSubmitting}
          value={selectedAmount} 
          onChange={(e) => {
            const newAmount = Number(e.target.value);
            console.log("Selected Amount changed to:", newAmount);
            setSelectedAmount(newAmount);
          }}
          style={{
            width: '100%', 
            padding: '12px', 
            fontSize: '1rem', 
            borderRadius: '4px',
            border: '1px solid #C5A059',
            background: '#fff',
            color: '#000',
            cursor: 'pointer'
          }}
        >
          {paymentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <p style={{fontSize: '0.9rem', color: '#666', marginTop: '10px', textAlign: 'center'}}>
          Deposit Amount: <strong style={{color: '#000'}}>${(selectedAmount / 100).toFixed(2)}</strong>
        </p>
      </div>

      <PaymentForm
        applicationId="sandbox-sq0idb-7q_dOjTtu2YL5b5KSwwu9A"
        locationId="LD7WCY7X0HQT4"
        cardTokenizeResponseReceived={async (token) => {
          setIsSubmitting(true);
          try {
            // UPDATED: Points to your new Windows Victus IP
            const response = await fetch('http://192.168.1.173:5000/api/process-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sourceId: token.token,
                amount: selectedAmount, 
                bookingDetails: bookingDetails 
              }),
            });

            if (response.ok) {
              onSuccess(bookingDetails); 
            } else {
              const errorData = await response.json();
              alert(`Error: ${errorData.error}`);
              setIsSubmitting(false);
            }
          } catch (error) {
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