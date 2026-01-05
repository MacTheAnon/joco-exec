import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyTrips = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/my-bookings', {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      setTrips(data);
    };
    fetchMyTrips();
  }, []);

  const handlePrint = (trip) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - JOCO EXEC</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #C5A059; padding-bottom: 10px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { font-size: 1.5rem; font-weight: bold; margin-top: 20px; border-top: 1px solid #eee; pt-10px; }
            .footer { margin-top: 50px; font-size: 0.8rem; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JOCO EXEC</h1>
            <p>Official Trip Receipt</p>
          </div>
          <div class="row"><span><strong>Date:</strong></span> <span>${trip.date}</span></div>
          <div class="row"><span><strong>Time:</strong></span> <span>${trip.time}</span></div>
          <div class="row"><span><strong>Passenger:</strong></span> <span>${trip.name}</span></div>
          <div class="row"><span><strong>Pickup:</strong></span> <span>${trip.pickup}</span></div>
          <div class="row"><span><strong>Dropoff:</strong></span> <span>${trip.dropoff}</span></div>
          <div class="row"><span><strong>Transaction ID:</strong></span> <span>${trip.id}</span></div>
          <div class="total">
            <div class="row"><span>Total Paid:</span> <span>$${(trip.amount / 100).toFixed(2)}</span></div>
          </div>
          <div class="footer">
            Thank you for choosing Johnson County Executive Transportation.<br>
            Questions? Contact info@jocoexec.com
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const isPast = (date, time) => new Date(`${date}T${time}`) < new Date();

  return (
    <div className="section-container" style={{padding: '40px 20px', minHeight: '80vh', background: '#111', color: '#fff'}}>
      <h1 style={{color: '#C5A059'}}>Welcome, {user.name}</h1>
      <p style={{color: '#888', marginBottom: '30px'}}>Your personal trip history and receipts.</p>

      {trips.length === 0 ? (
        <div style={{textAlign: 'center', padding: '50px', border: '1px dashed #444'}}>
          <p>No trips found yet.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gap: '20px'}}>
          {trips.map(trip => (
            <div key={trip.id} style={{
              background: '#1a1a1a', 
              border: '1px solid #333', 
              borderRadius: '8px', 
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{
                  fontSize: '0.75rem', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  background: isPast(trip.date, trip.time) ? '#333' : '#C5A059',
                  color: isPast(trip.date, trip.time) ? '#888' : '#000',
                  fontWeight: 'bold'
                }}>
                  {isPast(trip.date, trip.time) ? 'Completed' : 'Upcoming'}
                </span>
                <h3 style={{margin: '10px 0 5px 0'}}>{trip.date} @ {trip.time}</h3>
                <p style={{margin: 0, color: '#ccc', fontSize: '0.9rem'}}>{trip.pickup} → {trip.dropoff}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#C5A059'}}>${(trip.amount / 100).toFixed(2)}</div>
                <button 
                  onClick={() => handlePrint(trip)}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    background: 'transparent',
                    border: '1px solid #C5A059',
                    color: '#C5A059',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  Print Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;