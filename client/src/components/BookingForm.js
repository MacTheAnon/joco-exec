import React, { useState } from 'react';

const BookingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '', time: '', pickup: '', dropoff: '', passengers: '1', name: '', email: '', phone: ''
  });
  const [checking, setChecking] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.pickup || !formData.name) {
      alert("Please fill in all details.");
      return;
    }

    setChecking(true);

    try {
      // UPDATED: Points to your new Windows Victus IP
      const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.1.173:5000';
      
      const response = await fetch(`${apiUrl}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time }),
      });
      
      const data = await response.json();

      if (data.available) {
        onSubmit(formData); 
      } else {
        alert("❌ Sorry, that time slot is already booked. Please choose another time.");
      }
    } catch (err) {
      alert("Server Error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={formCardStyle}>
      <h2 style={{color: '#C5A059', textAlign: 'center', marginTop: 0, fontSize: '1.5rem'}}>Request a Ride</h2>
      
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Full Name</label>
        <input type="text" name="name" style={mobileInputStyle} onChange={handleChange} placeholder="John Doe" required />
        
        <div style={responsiveGrid}>
           <div style={{flex:1}}>
             <label style={labelStyle}>Email</label>
             <input type="email" name="email" style={mobileInputStyle} onChange={handleChange} placeholder="email@example.com" required />
           </div>
           <div style={{flex:1}}>
             <label style={labelStyle}>Phone</label>
             <input type="tel" name="phone" style={mobileInputStyle} onChange={handleChange} placeholder="(913) 000-0000" required />
           </div>
        </div>

        <div style={responsiveGrid}>
          <div style={{flex: 1}}>
            <label style={labelStyle}>Date</label>
            <input type="date" name="date" style={mobileInputStyle} onChange={handleChange} required />
          </div>
          <div style={{flex: 1}}>
            <label style={labelStyle}>Time</label>
            <input type="time" name="time" style={mobileInputStyle} onChange={handleChange} required />
          </div>
        </div>

        <label style={labelStyle}>Pickup Location</label>
        <input type="text" name="pickup" style={mobileInputStyle} onChange={handleChange} placeholder="Street Address, Airport, or Hotel" required />

        <label style={labelStyle}>Dropoff Location</label>
        <input type="text" name="dropoff" style={mobileInputStyle} onChange={handleChange} placeholder="Destination Address" required />

        <button type="submit" style={mobileButtonStyle} disabled={checking}>
          {checking ? "Checking Availability..." : "PROCEED TO DEPOSIT"}
        </button>
      </form>
    </div>
  );
};

const isMobile = window.innerWidth < 600;

const formCardStyle = {
  background: '#111', 
  border: '1px solid #C5A059', 
  padding: isMobile ? '20px' : '35px', 
  borderRadius: '12px', 
  maxWidth: '500px', 
  margin: '0 auto', 
  color: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const labelStyle = { 
  display: 'block', 
  marginBottom: '8px', 
  color: '#C5A059', 
  fontWeight: 'bold', 
  fontSize: '0.9rem',
  letterSpacing: '0.5px'
};

const mobileInputStyle = { 
  width: '100%', 
  padding: '14px', 
  marginBottom: '20px', 
  background: '#000', 
  border: '1px solid #333', 
  color: '#fff', 
  borderRadius: '6px', 
  boxSizing: 'border-box',
  fontSize: '16px', 
  fontFamily: 'inherit'
};

const responsiveGrid = {
  display: 'flex', 
  flexDirection: isMobile ? 'column' : 'row', 
  gap: isMobile ? '0px' : '15px' 
};

const mobileButtonStyle = { 
  width: '100%', 
  padding: '18px', 
  background: '#C5A059', 
  color: '#000', 
  border: 'none', 
  fontWeight: 'bold', 
  fontSize: '1rem', 
  cursor: 'pointer', 
  marginTop: '10px',
  borderRadius: '6px',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

export default BookingForm;