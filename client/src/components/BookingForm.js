import React, { useState, useEffect } from 'react';

const BookingForm = ({ onSubmit }) => {
  // --- STATE MANAGEMENT ---
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
    serviceType: 'Sedan' // Default Service
  });

  const [checking, setChecking] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // Handle Window Resize for Responsive Layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HANDLERS ---

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.date || !formData.time || !formData.pickup || !formData.name) {
      alert("Please fill in all required details.");
      return;
    }

    setChecking(true);

    try {
      // --- PRICING LOGIC ---
      let calculatedAmount = 8500; // Default: Sedan ($85.00)

      if (formData.serviceType === 'SUV') {
        calculatedAmount = 9500; // Executive SUV ($95.00)
      } else if (formData.serviceType === 'NightOut') {
        calculatedAmount = 15000; // Night Out ($150.00 min)
      } else if (formData.serviceType === 'Corporate') {
        calculatedAmount = 15000; // Corporate Event ($150.00 min)
      }

      // WORLD CUP 2026 OVERRIDE
      // If date is June 2026, set flat rate to $250.00
      const bookingDate = new Date(formData.date);
      if (bookingDate.getFullYear() === 2026 && bookingDate.getMonth() === 5) {
        calculatedAmount = 25000; 
      }

      // --- CHECK AVAILABILITY (PRODUCTION URL) ---
      const apiUrl = 'https://www.jocoexec.com';
      
      const response = await fetch(`${apiUrl}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time }),
      });
      
      const data = await response.json();

      if (data.available) {
        // Pass the calculated amount and form data back to the parent component
        onSubmit({ ...formData, amount: calculatedAmount }); 
      } else {
        alert("❌ Sorry, that time slot is already booked. Please select a different time.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Connection Error. Please ensure you are connected to the network.");
    } finally {
      setChecking(false);
    }
  };

  // --- RENDER ---
  return (
    <div style={formCardStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={headerTitleStyle}>Request a Ride</h2>
        <p style={headerSubtitleStyle}>Professional Chauffeur Service</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        
        {/* Full Name */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Full Name</label>
          <input 
            type="text" 
            name="name" 
            style={inputStyle} 
            onChange={handleChange} 
            placeholder="John Doe" 
            required 
          />
        </div>
        
        {/* Contact Info Grid */}
        <div style={isMobile ? columnGridStyle : rowGridStyle}>
           <div style={{ flex: 1 }}>
             <label style={labelStyle}>Email Address</label>
             <input 
                type="email" 
                name="email" 
                style={inputStyle} 
                onChange={handleChange} 
                placeholder="email@example.com" 
                required 
             />
           </div>
           <div style={{ flex: 1 }}>
             <label style={labelStyle}>Phone Number</label>
             <input 
                type="tel" 
                name="phone" 
                style={inputStyle} 
                onChange={handleChange} 
                placeholder="(913) 000-0000" 
                required 
             />
           </div>
        </div>

        {/* SERVICE SELECTION DROPDOWN */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Select Service Type</label>
            <select 
                name="serviceType" 
                style={inputStyle} 
                onChange={handleChange} 
                value={formData.serviceType}
            >
                <option value="Sedan">Luxury Sedan ($85.00)</option>
                <option value="SUV">Executive SUV ($95.00)</option>
                <option value="NightOut">Night Out / Hourly ($150.00)</option>
                <option value="Corporate">Corporate Event Hosting ($150.00)</option>
            </select>
        </div>

        {/* Date & Time Grid */}
        <div style={isMobile ? columnGridStyle : rowGridStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Date</label>
            <input 
                type="date" 
                name="date" 
                style={inputStyle} 
                onChange={handleChange} 
                required 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Time</label>
            <input 
                type="time" 
                name="time" 
                style={inputStyle} 
                onChange={handleChange} 
                required 
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Pickup Location</label>
            <input 
                type="text" 
                name="pickup" 
                style={inputStyle} 
                onChange={handleChange} 
                placeholder="Address, Airport, or Hotel" 
                required 
            />
        </div>

        {/* Dropoff Location */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Dropoff Location</label>
            <input 
                type="text" 
                name="dropoff" 
                style={inputStyle} 
                onChange={handleChange} 
                placeholder="Destination Address" 
                required 
            />
        </div>

        {/* Meet & Greet Checkbox */}
        <div style={checkboxContainerStyle}>
          <label style={checkboxLabelStyle}>
            <input 
              type="checkbox" 
              name="meetAndGreet" 
              checked={formData.meetAndGreet} 
              onChange={handleChange} 
              style={checkboxStyle}
            />
            <span>Add Airport Meet & Greet (+$25.00)</span>
          </label>
        </div>

        {/* Submit Button */}
        <button 
            type="submit" 
            style={checking ? disabledButtonStyle : activeButtonStyle} 
            disabled={checking}
        >
          {checking ? "CHECKING AVAILABILITY..." : "PROCEED TO DEPOSIT"}
        </button>

      </form>
      
      {/* Trust Badge Footer */}
      <div style={footerContainerStyle}>
         <h4 style={footerTitleStyle}>Executive Reliability</h4>
         <p style={footerTextStyle}>
            Real-time flight tracking and chauffeur coordination ensure your vehicle is on-site before you land.
         </p>
      </div>
    </div>
  );
};

// --- PROFESSIONAL STYLES ---

const formCardStyle = {
  background: '#111', 
  border: '1px solid #C5A059', 
  padding: '35px', 
  borderRadius: '12px', 
  maxWidth: '550px', 
  width: '100%',
  margin: '0 auto', 
  color: '#fff',
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  boxSizing: 'border-box'
};

const headerTitleStyle = {
    color: '#C5A059', 
    marginTop: 0, 
    fontSize: '1.8rem',
    fontFamily: '"Playfair Display", serif',
    marginBottom: '5px'
};

const headerSubtitleStyle = {
    color: '#888',
    fontSize: '0.9rem',
    margin: 0
};

const inputGroupStyle = {
    marginBottom: '20px'
};

const rowGridStyle = {
    display: 'flex', 
    flexDirection: 'row', 
    gap: '15px',
    marginBottom: '20px'
};

const columnGridStyle = {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
    marginBottom: '20px'
};

const labelStyle = { 
  display: 'block', 
  marginBottom: '8px', 
  color: '#C5A059', 
  fontWeight: 'bold', 
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = { 
  width: '100%', 
  padding: '14px', 
  background: '#000', 
  border: '1px solid #333', 
  color: '#fff', 
  borderRadius: '6px', 
  boxSizing: 'border-box',
  fontSize: '16px', // Prevents iOS zoom
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const checkboxContainerStyle = { 
  marginBottom: '25px', 
  padding: '15px', 
  background: '#000', 
  borderRadius: '6px', 
  border: '1px solid #333' 
};

const checkboxLabelStyle = { 
  color: '#C5A059', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  fontSize: '1rem' 
};

const checkboxStyle = { 
  width: '20px', 
  height: '20px',
  accentColor: '#C5A059',
  cursor: 'pointer'
};

const activeButtonStyle = { 
  width: '100%', 
  padding: '18px', 
  background: '#C5A059', 
  color: '#000', 
  border: 'none', 
  fontWeight: 'bold', 
  fontSize: '1rem', 
  cursor: 'pointer', 
  borderRadius: '6px', 
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'background 0.3s ease'
};

const disabledButtonStyle = {
  ...activeButtonStyle,
  background: '#555',
  color: '#888',
  cursor: 'not-allowed'
};

const footerContainerStyle = { 
  marginTop: '30px', 
  borderTop: '1px solid #222', 
  paddingTop: '20px', 
  textAlign: 'center' 
};

const footerTitleStyle = { 
  color: '#C5A059', 
  margin: '0 0 8px 0', 
  textTransform: 'uppercase', 
  letterSpacing: '1px',
  fontSize: '1rem'
};

const footerTextStyle = { 
  fontSize: '0.9rem', 
  color: '#888', 
  margin: 0, 
  lineHeight: '1.5' 
};

export default BookingForm;