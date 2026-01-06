import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        // Dynamic API URL for Mobile/Linux testing
        const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.1.12:5000';
        
        const res = await fetch(`${apiUrl}/api/user/my-bookings`, {
          headers: { 
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error("Failed to fetch trips");
        
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

  // --- RECEIPT PRINTING LOGIC ---
  const handlePrint = (trip) => {
    const printWindow = window.open('', '_blank');
    const fare = (trip.amount / 100).toFixed(2);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - JOCO EXEC</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 3px solid #C5A059; padding-bottom: 15px; margin-bottom: 30px; text-align: center; }
            .header h1 { color: #000; margin: 0; letter-spacing: 2px; }
            .header p { color: #C5A059; font-weight: bold; margin: 5px 0 0; }
            .section { margin-bottom: 25px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .row strong { color: #555; }
            .total-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #eee; }
            .total-row { display: flex; justify-content: space-between; font-size: 1.4rem; font-weight: bold; color: #000; }
            .footer { margin-top: 50px; font-size: 0.8rem; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JOCO EXEC</h1>
            <p>EXECUTIVE TRANSPORTATION RECEIPT</p>
          </div>
          
          <div class="section">
            <div class="row"><strong>Transaction ID:</strong> <span>${trip.id}</span></div>
            <div class="row"><strong>Service Date:</strong> <span>${trip.date}</span></div>
            <div class="row"><strong>Scheduled Time:</strong> <span>${trip.time}</span></div>
          </div>

          <div class="section">
            <div class="row"><strong>Passenger:</strong> <span>${trip.name}</span></div>
            <div class="row"><strong>Pickup:</strong> <span>${trip.pickup}</span></div>
            <div class="row"><strong>Drop-off:</strong> <span>${trip.dropoff}</span></div>
          </div>

          <div class="total-box">
            <div class="total-row">
              <span>Total Paid</span>
              <span style="color: #C5A059;">$${fare}</span>
            </div>
            <p style="font-size: 0.8rem; margin: 10px 0 0; color: #666;">Charged to card on file via Square Secure Checkout</p>
          </div>

          <div class="footer">
            <p>Johnson County Executive Transportation</p>
            <p>Questions? Contact us at info@jocoexec.com or (913) 369-0854</p>
            <p>© 2026 JOCO EXEC. All rights reserved.</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isPast = (date, time) => {
    const tripDateTime = new Date(`${date}T${time}`);
    return tripDateTime < new Date();
  };

  return (
    <div className="section-container" style={containerStyle}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={welcomeStyle}>Hello, {user?.name.split(' ')[0]}</h1>
        <p style={subTextStyle}>Manage your executive travel history and print receipts.</p>
      </header>

      {loading ? (
        <div style={statusStyle}>
          <div className="spinner"></div>
          <p>Syncing your trip history...</p>
        </div>
      ) : trips.length === 0 ? (
        <div style={emptyStateStyle}>
          <h3 style={{ color: '#C5A059' }}>No Trips Found</h3>
          <p>You haven't booked any trips yet. Your history will appear here once you complete a reservation.</p>
          <button onClick={() => window.location.href='/booking'} style={actionButtonStyle}>BOOK YOUR FIRST RIDE</button>
        </div>
      ) : (
        <div style={listStyle}>
          {trips.map(trip => (
            <div key={trip.id} style={tripCardStyle}>
              <div style={tripInfoStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={badgeStyle(isPast(trip.date, trip.time))}>
                    {isPast(trip.date, trip.time) ? 'COMPLETED' : 'UPCOMING'}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>ID: {trip.id.slice(-6)}</span>
                </div>
                
                <h3 style={dateStyle}>{trip.date} <span style={{ color: '#C5A059' }}>@</span> {trip.time}</h3>
                
                <div style={locationBoxStyle}>
                  <p style={locTextStyle}><strong>Pickup:</strong> {trip.pickup}</p>
                  <p style={locTextStyle}><strong>Dropoff:</strong> {trip.dropoff}</p>
                </div>
              </div>

              <div style={priceActionStyle}>
                <div style={fareStyle}>${(trip.amount / 100).toFixed(2)}</div>
                <button 
                  onClick={() => handlePrint(trip)}
                  style={printBtnStyle}
                >
                  PRINT RECEIPT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES OBJECTS ---

const containerStyle = {
  padding: '40px 20px',
  minHeight: '85vh',
  background: '#000',
  color: '#fff',
  maxWidth: '900px',
  margin: '0 auto'
};

const welcomeStyle = {
  color: '#C5A059',
  fontSize: '2.2rem',
  margin: 0,
  fontWeight: 'bold'
};

const subTextStyle = {
  color: '#888',
  marginTop: '5px',
  fontSize: '1rem'
};

const statusStyle = {
  textAlign: 'center',
  padding: '100px 0',
  color: '#666'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 30px',
  border: '1px dashed #333',
  borderRadius: '12px',
  background: '#0a0a0a'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const tripCardStyle = {
  background: '#0f0f0f',
  border: '1px solid #1a1a1a',
  borderRadius: '12px',
  padding: '25px',
  display: 'flex',
  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  gap: '20px'
};

const tripInfoStyle = { flex: 2 };

const badgeStyle = (isPast) => ({
  fontSize: '0.65rem',
  padding: '4px 10px',
  borderRadius: '50px',
  background: isPast ? '#222' : '#C5A059',
  color: isPast ? '#888' : '#000',
  fontWeight: 'bold',
  letterSpacing: '1px'
});

const dateStyle = {
  margin: '10px 0',
  fontSize: '1.4rem',
  fontWeight: '600'
};

const locationBoxStyle = {
  marginTop: '15px',
  borderLeft: '2px solid #222',
  paddingLeft: '15px'
};

const locTextStyle = {
  margin: '5px 0',
  color: '#ccc',
  fontSize: '0.9rem',
  lineHeight: '1.5'
};

const priceActionStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: window.innerWidth < 768 ? 'flex-start' : 'flex-end',
  borderTop: window.innerWidth < 768 ? '1px solid #222' : 'none',
  paddingTop: window.innerWidth < 768 ? '20px' : '0'
};

const fareStyle = {
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#fff',
  marginBottom: '10px'
};

const printBtnStyle = {
  padding: '10px 20px',
  background: 'transparent',
  border: '1px solid #C5A059',
  color: '#C5A059',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  transition: '0.3s',
  width: window.innerWidth < 768 ? '100%' : 'auto'
};

const actionButtonStyle = {
  marginTop: '20px',
  padding: '15px 30px',
  background: '#C5A059',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default Dashboard;