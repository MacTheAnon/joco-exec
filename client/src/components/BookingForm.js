import React, { useState, useEffect } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete'; // ✅ Switched to Hook for stability

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
    vehicleType: 'Luxury Sedan' 
  });

  const [checking, setChecking] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- GOOGLE MAPS HOOKS (Fixes the Ref/Crash Error) ---
  
  // 1. Pickup Ref
const { ref: pickupRef } = usePlacesWidget({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  onPlaceSelected: (place) => {
    // Ensure we take a string property, never the 'place' object itself
    const addr = place.formatted_address || place.name || "";
    setFormData((prev) => ({ ...prev, pickup: addr }));
  },
  options: {
    types: ['geocode', 'establishment'],
    componentRestrictions: { country: "us" },
  },
});

// 2. Dropoff Ref
const { ref: dropoffRef } = usePlacesWidget({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  onPlaceSelected: (place) => {
    const addr = place.formatted_address || place.name || "";
    setFormData((prev) => ({ ...prev, dropoff: addr }));
  },
  options: {
    types: ['geocode', 'establishment'],
    componentRestrictions: { country: "us" },
  },
});
  // --- HANDLERS ---
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.pickup || !formData.name) {
      alert("Please fill in all required details.");
      return;
    }

    setChecking(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';

      // 1. CHECK AVAILABILITY
      const availResponse = await fetch(`${apiUrl}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time }),
      });
      
      const availData = await availResponse.json();

      if (!availData.available) {
        alert("❌ Sorry, that time slot is already booked. Please select a different time.");
        setChecking(false);
        return;
      }

      // 2. GET OFFICIAL QUOTE
      const quoteResponse = await fetch(`${apiUrl}/api/get-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            vehicleType: formData.vehicleType,
            pickup: formData.pickup,
            dropoff: formData.dropoff
        }),
      });

      const quoteData = await quoteResponse.json();

      if (quoteData.error) {
        throw new Error(quoteData.error);
      }

      // 3. SUCCESS
      onSubmit({ 
          ...formData, 
          amount: Math.round(quoteData.quote * 100), 
          distance: quoteData.distance 
      }); 

    } catch (err) {
      console.error(err);
      alert("Error fetching quote. Please check address validity.");
    } finally {
      setChecking(false);
    }
  };

  // --- RENDER ---
  return (
    <div style={formCardStyle}>
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
        
        {/* Contact Info */}
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

        {/* Vehicle Selection */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Select Service / Vehicle</label>
            <select 
                name="vehicleType" 
                style={inputStyle} 
                onChange={handleChange} 
                value={formData.vehicleType}
            >
                <option value="Luxury Sedan">Luxury Lexus Sedan (Base $85 or $3/mile)</option>
                <option value="Luxury SUV">Executive SUV (Base $95 or $4.50/mile)</option>
                <option value="Night Out">Night Out (Starts at $150)</option>
            </select>
        </div>

        {/* Date & Time */}
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

        {/* ✅ PICKUP: FIXED GOOGLE INPUT */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Pickup Location</label>
            <input
                ref={pickupRef}
                type="text"
                style={inputStyle}
                placeholder="Start typing address..."
                required
                defaultValue={formData.pickup}
                onChange={(e) => setFormData({...formData, pickup: e.target.value})}
            />
        </div>

        {/* ✅ DROPOFF: FIXED GOOGLE INPUT */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Dropoff Location</label>
            <input
                ref={dropoffRef}
                type="text"
                style={inputStyle}
                placeholder="Start typing destination..."
                required
                defaultValue={formData.dropoff}
                onChange={(e) => setFormData({...formData, dropoff: e.target.value})}
            />
        </div>

        {/* Meet & Greet */}
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

        <button 
            type="submit" 
            style={checking ? disabledButtonStyle : activeButtonStyle} 
            disabled={checking}
        >
          {checking ? "CALCULATING QUOTE..." : "GET QUOTE & RESERVE"}
        </button>

      </form>
      
      <div style={footerContainerStyle}>
         <h4 style={footerTitleStyle}>Executive Reliability</h4>
         <p style={footerTextStyle}>
           Real-time flight tracking and chauffeur coordination ensure your vehicle is on-site before you land.
         </p>
      </div>
    </div>
  );
};

// --- STYLES ---
const formCardStyle = { background: '#111', border: '1px solid #C5A059', padding: '35px', borderRadius: '12px', maxWidth: '550px', width: '100%', margin: '0 auto', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', boxSizing: 'border-box'};
const headerTitleStyle = { color: '#C5A059', marginTop: 0, fontSize: '1.8rem', fontFamily: '"Playfair Display", serif', marginBottom: '5px'};
const headerSubtitleStyle = { color: '#888', fontSize: '0.9rem', margin: 0};
const inputGroupStyle = { marginBottom: '20px'};
const rowGridStyle = { display: 'flex', flexDirection: 'row', gap: '15px', marginBottom: '20px'};
const columnGridStyle = { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px'};
const labelStyle = { display: 'block', marginBottom: '8px', color: '#C5A059', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'};
const inputStyle = { width: '100%', padding: '14px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s'};
const checkboxContainerStyle = { marginBottom: '25px', padding: '15px', background: '#000', borderRadius: '6px', border: '1px solid #333' };
const checkboxLabelStyle = { color: '#C5A059', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' };
const checkboxStyle = { width: '20px', height: '20px', accentColor: '#C5A059', cursor: 'pointer'};
const activeButtonStyle = { width: '100%', padding: '18px', background: '#C5A059', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'background 0.3s ease'};
const disabledButtonStyle = { ...activeButtonStyle, background: '#555', color: '#888', cursor: 'not-allowed'};
const footerContainerStyle = { marginTop: '30px', borderTop: '1px solid #222', paddingTop: '20px', textAlign: 'center' };
const footerTitleStyle = { color: '#C5A059', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem'};
const footerTextStyle = { fontSize: '0.9rem', color: '#888', margin: 0, lineHeight: '1.5' };

export default BookingForm;