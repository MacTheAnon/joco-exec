import React, { useState, useEffect } from 'react';
import { Map, Marker } from 'mapkit-react';

const BookingForm = ({ onSubmit }) => {
  // --- STATE MANAGEMENT (Coordinate Support Added) ---
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '',
    pickup: '', dropoff: '', pickupCoords: null, dropoffCoords: null,
    meetAndGreet: false, passengers: '1', vehicleType: 'Luxury Sedan' 
  });

  const [mapToken, setMapToken] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  
  // Autocomplete Suggestion States
  const [pickupResults, setPickupResults] = useState([]);
  const [dropoffResults, setDropoffResults] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    
    // Fetch Apple Maps Token from your server
    fetch('/api/maps/token')
      .then(res => res.json())
      .then(data => setMapToken(data.token));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- APPLE MAPS SEARCH LOGIC ---
  const handleAddressSearch = (query, setResults) => {
    if (!window.mapkit || query.length < 3) return;
    // Bias search toward Kansas City area for accuracy
    const region = new window.mapkit.CoordinateRegion(
      new window.mapkit.Coordinate(38.8814, -94.8191),
      new window.mapkit.CoordinateSpan(0.5, 0.5)
    );
    const search = new window.mapkit.Search({ region });
    search.autocomplete(query, (error, data) => {
      if (!error) setResults(data.results);
    });
  };

  const handleSelectAddress = (result, field, setResults) => {
    setFormData({ 
      ...formData, 
      [field]: result.displayLines.join(', '),
      [`${field}Coords`]: result.coordinate // Critical: Stores Lat/Lng for distance API
    });
    setResults([]); 
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupCoords || !formData.dropoffCoords) {
      alert("Please select addresses from the dropdown list to ensure accurate pricing.");
      return;
    }
    setChecking(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';

      // 1. Availability Check
      const availRes = await fetch(`${apiUrl}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time }),
      });
      const availData = await availRes.json();
      if (!availData.available) {
        alert("❌ Slot already booked.");
        setChecking(false);
        return;
      }

      // 2. GET QUOTE (Passes Coordinates for Mileage Math)
      const quoteRes = await fetch(`${apiUrl}/api/get-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            vehicleType: formData.vehicleType,
            pickup: formData.pickupCoords,
            dropoff: formData.dropoffCoords
        }),
      });
      const quoteData = await quoteRes.json();

      onSubmit({ 
          ...formData, 
          amount: Math.round(quoteData.quote * 100), 
          distance: quoteData.distance 
      }); 

    } catch (err) {
      alert("Error fetching quote. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={formCardStyle}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={headerTitleStyle}>Request a Ride</h2>
        {mapToken ? (
           <div style={mapBoxStyle}><Map token={mapToken}><Marker latitude={38.8814} longitude={-94.8191} title="JOCO EXEC" /></Map></div>
        ) : <div style={mapLoaderStyle}>Initializing Secure Maps...</div>}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Full Name</label>
          <input type="text" name="name" style={inputStyle} onChange={handleChange} required />
        </div>
        
        <div style={isMobile ? columnGridStyle : rowGridStyle}>
           <div style={{ flex: 1 }}><label style={labelStyle}>Email</label><input type="email" name="email" style={inputStyle} onChange={handleChange} required /></div>
           <div style={{ flex: 1 }}><label style={labelStyle}>Phone</label><input type="tel" name="phone" style={inputStyle} onChange={handleChange} required /></div>
        </div>

        <div style={inputGroupStyle}>
            <label style={labelStyle}>Vehicle Type</label>
            <select name="vehicleType" style={inputStyle} onChange={handleChange} value={formData.vehicleType}>
                <option value="Luxury Sedan">Luxury Sedan (Base $85)</option>
                <option value="Luxury SUV">Executive SUV (Base $95)</option>
                <option value="Night Out">Night Out (Starts $150)</option>
            </select>
        </div>

        <div style={isMobile ? columnGridStyle : rowGridStyle}>
          <div style={{ flex: 1 }}><label style={labelStyle}>Date</label><input type="date" name="date" style={inputStyle} onChange={handleChange} required /></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Time</label><input type="time" name="time" style={inputStyle} onChange={handleChange} required /></div>
        </div>

        {/* --- PICKUP AUTOCOMPLETE --- */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Pickup Location</label>
            <input 
                type="text" 
                style={inputStyle} 
                placeholder="Start typing pickup address..." 
                value={formData.pickup}
                onChange={(e) => {
                  setFormData({...formData, pickup: e.target.value});
                  handleAddressSearch(e.target.value, setPickupResults);
                }}
                required 
            />
            {pickupResults.length > 0 && (
              <div style={dropdownStyle}>
                {pickupResults.map(res => (
                  <div key={res.id} style={dropdownItemStyle} onClick={() => handleSelectAddress(res, 'pickup', setPickupResults)}>
                    {res.displayLines.join(', ')}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* --- DROPOFF AUTOCOMPLETE --- */}
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Dropoff Destination</label>
            <input 
                type="text" 
                style={inputStyle} 
                placeholder="Start typing dropoff address..." 
                value={formData.dropoff}
                onChange={(e) => {
                  setFormData({...formData, dropoff: e.target.value});
                  handleAddressSearch(e.target.value, setDropoffResults);
                }}
                required 
            />
            {dropoffResults.length > 0 && (
              <div style={dropdownStyle}>
                {dropoffResults.map(res => (
                  <div key={res.id} style={dropdownItemStyle} onClick={() => handleSelectAddress(res, 'dropoff', setDropoffResults)}>
                    {res.displayLines.join(', ')}
                  </div>
                ))}
              </div>
            )}
        </div>

        <div style={checkboxContainerStyle}>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" name="meetAndGreet" checked={formData.meetAndGreet} onChange={handleChange} style={checkboxStyle} />
            <span>Add Airport Meet & Greet (+$25.00)</span>
          </label>
        </div>

        <button type="submit" style={checking ? disabledButtonStyle : activeButtonStyle} disabled={checking}>
          {checking ? "CALCULATING..." : "GET QUOTE & RESERVE"}
        </button>
      </form>
    </div>
  );
};

// --- STYLES (100% Preserved with Search Dropdown Support) ---
const formCardStyle = { background: '#111', border: '1px solid #C5A059', padding: '35px', borderRadius: '12px', maxWidth: '550px', width: '100%', margin: '0 auto', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', boxSizing: 'border-box', position: 'relative'};
const dropdownStyle = { position: 'absolute', zIndex: 1000, background: '#000', border: '1px solid #C5A059', borderRadius: '4px', width: '90%', marginTop: '-15px' };
const dropdownItemStyle = { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #222', fontSize: '0.9rem', color: '#fff' };
const headerTitleStyle = { color: '#C5A059', marginTop: 0, fontSize: '1.8rem', fontFamily: '"Playfair Display", serif', marginBottom: '5px'};
const mapBoxStyle = { height: '200px', borderRadius: '8px', overflow: 'hidden', marginTop: '20px', border: '1px solid #333' };
const mapLoaderStyle = { height: '200px', marginTop: '20px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059' };
const inputGroupStyle = { marginBottom: '20px'};
const rowGridStyle = { display: 'flex', flexDirection: 'row', gap: '15px', marginBottom: '20px'};
const columnGridStyle = { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px'};
const labelStyle = { display: 'block', marginBottom: '8px', color: '#C5A059', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase'};
const inputStyle = { width: '100%', padding: '14px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px'};
const checkboxContainerStyle = { marginBottom: '25px', padding: '15px', background: '#000', borderRadius: '6px', border: '1px solid #333' };
const checkboxLabelStyle = { color: '#C5A059', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' };
const checkboxStyle = { width: '20px', height: '20px', accentColor: '#C5A059', cursor: 'pointer'};
const activeButtonStyle = { width: '100%', padding: '18px', background: '#C5A059', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', textTransform: 'uppercase'};
const disabledButtonStyle = { ...activeButtonStyle, background: '#555', color: '#888', cursor: 'not-allowed'};

export default BookingForm;