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

    // 1. ASK SERVER: Is this time free?
    try {
      const response = await fetch('http://localhost:5000/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time }),
      });
      
      const data = await response.json();

      if (data.available) {
        // 2. IF FREE: Move to Payment
        onSubmit(formData); 
      } else {
        // 3. IF TAKEN: Block them
        alert("❌ Sorry, that time slot is already booked. Please choose another time.");
      }
    } catch (err) {
      alert("Server Error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  // --- STYLES ---
  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '8px', color: '#C5A059', fontWeight: 'bold' };
  const buttonStyle = { width: '100%', padding: '15px', background: '#C5A059', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' };

  return (
    <div style={{background: '#111', border: '2px solid #C5A059', padding: '30px', borderRadius: '8px', maxWidth: '500px', margin: '0 auto', color: '#fff'}}>
      <h2 style={{color: '#C5A059', textAlign: 'center', marginTop: 0}}>Request a Ride</h2>
      
      <form onSubmit={handleSubmit}>
        {/* CONTACT INFO */}
        <label style={labelStyle}>Full Name</label>
        <input type="text" name="name" style={inputStyle} onChange={handleChange} required />
        
        <div style={{display: 'flex', gap: '10px'}}>
           <div style={{flex:1}}><label style={labelStyle}>Email</label><input type="email" name="email" style={inputStyle} onChange={handleChange} required /></div>
           <div style={{flex:1}}><label style={labelStyle}>Phone</label><input type="tel" name="phone" style={inputStyle} onChange={handleChange} required /></div>
        </div>

        {/* DATE & TIME */}
        <div style={{display: 'flex', gap: '10px'}}>
          <div style={{flex: 1}}>
            <label style={labelStyle}>Date</label>
            <input type="date" name="date" style={inputStyle} onChange={handleChange} required />
          </div>
          <div style={{flex: 1}}>
            <label style={labelStyle}>Time</label>
            <input type="time" name="time" style={inputStyle} onChange={handleChange} required />
          </div>
        </div>

        <label style={labelStyle}>Pickup Location</label>
        <input type="text" name="pickup" style={inputStyle} onChange={handleChange} required />

        <label style={labelStyle}>Dropoff Location</label>
        <input type="text" name="dropoff" style={inputStyle} onChange={handleChange} required />

        <button type="submit" style={buttonStyle} disabled={checking}>
          {checking ? "Checking Availability..." : "Proceed to Deposit"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;