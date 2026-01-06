import React, { useState } from 'react';

const BookingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    pickup: '',
    dropoff: '',
    meetAndGreet: false,
    passengers: '1',
    serviceType: 'Sedan' // Default to Sedan ($85)
  });
  const [checking, setChecking] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.pickup || !formData.name) {
      alert("Please fill in all details.");
      return;
    }

    setChecking(true);

    try {
      // --- PRICING LOGIC ---
      let calculatedAmount = 8500; // Default Sedan ($85.00)

      if (formData.serviceType === 'SUV') {
        calculatedAmount = 9500; // SUV ($95.00)
      } else if (formData.serviceType === 'NightOut') {
        calculatedAmount = 15000; // Night Out ($150.00)
      }

      // WORLD CUP OVERRIDE (June 2026)
      const bookingDate = new Date(formData.date);
      if (bookingDate.getFullYear() === 2026 && bookingDate.getMonth() === 5) {
        calculatedAmount = 25000; // World Cup Fixed Price ($250.00)
      }

      // --- CHECK AVAILABILITY ---
      const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.1.12:5000';
      
      const response = await fetch(`${apiUrl}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time }),
      });
      
      const data = await response.json();

      if (data.available) {
        // Submit with the correct calculated amount
        onSubmit({ ...formData, amount: calculatedAmount }); 
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

        {/* --- SERVICE SELECTION DROPDOWN --- */}
        <label style={labelStyle}>Select Service</label>
        <select name="serviceType" style={mobileInputStyle} onChange={handleChange} value={formData.serviceType}>
            <option value="Sedan">Luxury Sedan ($85.00)</option>
            <option value="SUV">Executive SUV ($95.00)</option>
            <option value="NightOut">Night Out / Hourly ($150.00)</option>
        </select>

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
        <input type="text" name="pickup" style={mobileInputStyle} onChange={handleChange} placeholder="Address, Airport, or Hotel" required />

        <label style={labelStyle}>Dropoff Location</label>
        <input type="text" name="dropoff" style={mobileInputStyle} onChange={handleChange} placeholder="Destination Address" required />

        {/* --- MEET & GREET OPTION --- */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#000', borderRadius: '6px', border: '1px solid #333' }}>
          <label style={{ color: '#C5A059', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}>
            <input 
              type="checkbox" 
              name="meetAndGreet" 
              checked={formData.meetAndGreet} 
              onChange={handleChange} 
              style={{ width: '20px', height: '20px' }}
            />
            <span>Add Airport Meet & Greet (+$25.00)</span>
          </label>
        </div>

        <button type="submit" style={mobileButtonStyle} disabled={checking}>
          {checking ? "Checking Availability..." : "PROCEED TO DEPOSIT"}
        </button>
      </form>
      
      <div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '20px', textAlign: 'center' }}>
         <h4 style={{ color: '#C5A059', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Executive Reliability</h4>
         <p style={{ fontSize: '0.9rem', color: '#888', margin: 0, lineHeight: '1.4' }}>
            Real-time flight tracking and chauffeur coordination ensure your vehicle is on-site before you land.
         </p>
      </div>
    </div>
  );
};

// --- STYLES ---
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