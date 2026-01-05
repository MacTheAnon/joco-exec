import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/user/my-bookings', {
          headers: { 'Authorization': token }
        });
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
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
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { border-bottom: 2px solid #C5A059; padding-bottom: 10px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .total { font-size: 1.2rem; font-weight: bold; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
            .footer { margin-top: 40px; font-size: 0.7rem; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header"><h1>JOCO EXEC</h1><p>Trip Receipt</p></div>
          <div class="row"><strong>Date:</strong> <span>${trip.date}</span></div>
          <div class="row"><strong>Passenger:</strong> <span>${trip.name}</span></div>
          <div class="row"><strong>Pickup:</strong> <span>${trip.pickup}</span></div>
          <div class="row"><strong>Dropoff:</strong> <span>${trip.dropoff}</span></div>
          <div class="total"><div class="row">Total Paid: <span>$${(trip.amount / 100).toFixed(2)}</span></div></div>
          <div class="footer">Thank you for choosing JOCO EXEC.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const isPast = (date, time) => new Date(`${date}T${time}`) < new Date();

  return (
    <div className="section-container" style={containerStyle}>
      <h1 style={{color: '#C5A059', fontSize: '1.8rem', marginBottom: '10px'}}>Hello, {user?.name.split(' ')[0]}</h1>
      <p style={{color: '#888', marginBottom: '30px', fontSize: '0.9rem'}}>Manage your upcoming trips and receipts.</p>

      {loading ? (
        <p style={{textAlign: 'center', color: '#666'}}>Syncing trip history...</p>
      ) : trips.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>No trips found in your history.</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {trips.map(trip => (
            <div key={trip.id} style={tripCardStyle}>
              <div style={contentBlockStyle}>
                <span style={{
                  fontSize: '0.7rem', 
                  padding: '3px 8px', 
                  borderRadius: '4px', 
                  background: isPast(trip.date, trip.time) ? '#222' : '#C5A059',
                  color: isPast(trip.date, trip.time) ? '#666' : '#000',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {isPast(trip.date, trip.time) ? 'Completed' : 'Upcoming'}
                </span>
                <h3 style={{margin: '12px 0 5px 0', fontSize: '1.1rem'}}>{trip.date} @ {trip.time}</h3>
                <p style={{margin: 0, color: '#aaa', fontSize: '0.85rem', wordBreak: 'break-word'}}>
                  {trip.pickup} <br/> <span style={{color: '#C5A059'}}>→</span> {trip.dropoff}
                </p>
              </div>

              <div style={actionBlockStyle}>
                <div style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#fff'}}>${(trip.amount / 100).toFixed(2)}</div>
                <button 
                  onClick={() => handlePrint(trip)}
                  style={printButtonStyle}
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

// --- MOBILE-FIRST STYLES ---



const containerStyle = {
  padding: '20px', 
  minHeight: '85vh', 
  background: '#000', 
  color: '#fff',
  maxWidth: '800px',
  margin: '0 auto'
};

const emptyStateStyle = {
  textAlign: 'center', 
  padding: '60px 20px', 
  border: '1px dashed #333', 
  color: '#666',
  borderRadius: '8px'
};

const tripCardStyle = {
  background: '#0f0f0f', 
  border: '1px solid #1a1a1a', 
  borderRadius: '12px', 
  padding: '20px',
  display: 'flex',
  flexDirection: window.innerWidth < 600 ? 'column' : 'row', // Stack on phones
  justifyContent: 'space-between',
  alignItems: window.innerWidth < 600 ? 'flex-start' : 'center',
  gap: '20px'
};

const contentBlockStyle = { flex: 1 };

const actionBlockStyle = {
  textAlign: window.innerWidth < 600 ? 'left' : 'right',
  width: window.innerWidth < 600 ? '100%' : 'auto',
  borderTop: window.innerWidth < 600 ? '1px solid #222' : 'none',
  paddingTop: window.innerWidth < 600 ? '15px' : '0'
};

const printButtonStyle = {
  marginTop: '10px',
  padding: '10px 15px',
  background: 'transparent',
  border: '1px solid #C5A059',
  color: '#C5A059',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  width: window.innerWidth < 600 ? '100%' : 'auto' // Full width on phone
};

export default Dashboard;