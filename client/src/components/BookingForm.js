import React, { useState, useEffect } from 'react';
import { Map, Marker } from 'mapkit-react';
import { API_URL } from '../apiConfig'; // ✅ New Config Import

const BookingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '',
    pickup: '', dropoff: '', pickupCoords: null, dropoffCoords: null,
    meetAndGreet: false, passengers: '1', vehicleType: 'Luxury Sedan',
    serviceType: 'distance', stops: [], isRoundTrip: false,
    returnTime: '', hourlyDuration: 2, flightNumber: '' 
  });

  const [mapToken, setMapToken] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pickupResults, setPickupResults] = useState([]);
  const [dropoffResults, setDropoffResults] = useState([]);
  const [stopResults, setStopResults] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/maps/token`)
      .then(res => res.json())
      .then(data => {
        if (data.token) setMapToken(data.token);
      })
      .catch(err => console.error("Map Token Error:", err));

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddressSearch = (query, callback) => {
    if (!window.mapkit || query.length < 3) return;
    const region = new window.mapkit.CoordinateRegion(
      new window.mapkit.Coordinate(38.8814, -94.8191),
      new window.mapkit.CoordinateSpan(0.5, 0.5)
    );
    const search = new window.mapkit.Search({ region });
    search.autocomplete(query, (error, data) => {
      if (!error) callback(data.results);
    });
  };

  const handleSelectAddress = (result, field, setResults) => {
    setFormData({ 
      ...formData, 
      [field]: result.displayLines.join(', '),
      [`${field}Coords`]: result.coordinate 
    });
    setResults([]); 
  };

  const addStop = () => {
    setFormData({ ...formData, stops: [...formData.stops, { id: Date.now(), address: '', coords: null }] });
  };

  const removeStop = (id) => {
    setFormData({ ...formData, stops: formData.stops.filter(s => s.id !== id) });
  };

  const handleStopSearch = (id, query) => {
    const newStops = formData.stops.map(s => s.id === id ? { ...s, address: query } : s);
    setFormData({ ...formData, stops: newStops });
    handleAddressSearch(query, (results) => {
      setStopResults(prev => ({ ...prev, [id]: results }));
    });
  };

  const handleSelectStop = (id, result) => {
    const newStops = formData.stops.map(s => 
      s.id === id ? { ...s, address: result.displayLines.join(', '), coords: result.coordinate } : s
    );
    setFormData({ ...formData, stops: newStops });
    setStopResults(prev => ({ ...prev, [id]: [] }));
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setChecking(true);

    if (formData.serviceType === 'hourly') {
      fetch(`${API_URL}/api/get-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vehicleType: formData.vehicleType,
          serviceType: 'hourly',
          duration: formData.hourlyDuration
        }),
      })
      .then(res => res.json())
      .then(quoteData => {
        onSubmit({ 
          ...formData, 
          amount: Math.round(quoteData.quote * 100), 
          distance: 'N/A (Hourly)',
          quoteDetails: quoteData
        }); 
      })
      .catch(err => {
        console.error(err);
        alert("Error calculating hourly price.");
      })
      .finally(() => setChecking(false));
      return;
    }

    if (!formData.pickupCoords || !formData.dropoffCoords) {
      alert("Please select addresses from the dropdown list.");
      setChecking(false);
      return;
    }

    if (!window.mapkit) {
      alert("Map services are not fully loaded. Please refresh.");
      setChecking(false);
      return;
    }

    const directions = new window.mapkit.Directions();
    const waypoints = formData.stops.filter(s => s.coords).map(s => ({ coordinate: s.coords }));

    directions.route({
      origin: formData.pickupCoords,
      destination: formData.dropoffCoords,
      waypoints: waypoints,
      transportType: window.mapkit.Directions.Transport.Automobile
    }, async (error, data) => {
      if (error || !data || !data.routes || data.routes.length === 0) {
        setChecking(false);
        alert("No route found between these locations.");
        return;
      }

      const distanceMeters = data.routes[0].distance;
      const distanceMiles = distanceMeters / 1609.34;

      try {
        const quoteRes = await fetch(`${API_URL}/api/get-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              vehicleType: formData.vehicleType,
              serviceType: 'distance',
              distance: distanceMiles,
              isRoundTrip: formData.isRoundTrip
          }),
        });
        
        if (!quoteRes.ok) throw new Error("Server Calculation Failed");
        const quoteData = await quoteRes.json();

        onSubmit({ 
            ...formData, 
            amount: Math.round(quoteData.quote * 100), 
            distance: quoteData.distance,
            quoteDetails: quoteData
        }); 

      } catch (err) {
        console.error("Pricing Error:", err);
        alert("Error calculating price. Please try again.");
      } finally {
        setChecking(false);
      }
    });
  };

  return (
    <div style={formCardStyle}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={headerTitleStyle}>Request a Ride</h2>
        <div style={mapBoxStyle}>
          {mapToken ? (
            <Map token={mapToken}>
               <Marker latitude={38.8814} longitude={-94.8191} title="JOCO EXEC" />
            </Map>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#666'}}>
                Loading Map...
            </div>
          )}
        </div>
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
            <label style={labelStyle}>Service Type</label>
            <select name="serviceType" style={inputStyle} onChange={handleChange} value={formData.serviceType}>
                <option value="distance">Point-to-Point / Round Trip</option>
                <option value="hourly">Hourly (Night Out)</option>
            </select>
        </div>

        <div style={inputGroupStyle}>
            <label style={labelStyle}>Vehicle Type</label>
            <select name="vehicleType" style={inputStyle} onChange={handleChange} value={formData.vehicleType}>
                <option value="Luxury Sedan">Luxury Sedan (Base $85 or $3/mile)</option>
                <option value="Luxury SUV">Executive SUV (Base $95 or $4.50/mile)</option>
                <option value="Night Out">Night Out (Starts $150)</option>
            </select>
        </div>

        <div style={isMobile ? columnGridStyle : rowGridStyle}>
          <div style={{ flex: 1 }}><label style={labelStyle}>Date</label><input type="date" name="date" style={inputStyle} onChange={handleChange} required /></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Time</label><input type="time" name="time" style={inputStyle} onChange={handleChange} required /></div>
        </div>

        <div style={inputGroupStyle}>
            <label style={labelStyle}>Pickup Location</label>
            <input 
                type="text" style={inputStyle} placeholder="Start typing pickup address..." 
                value={formData.pickup}
                onChange={(e) => { setFormData({...formData, pickup: e.target.value}); handleAddressSearch(e.target.value, setPickupResults); }}
                required 
            />
            {pickupResults.length > 0 && (
              <div style={dropdownStyle}>
                {pickupResults.map(res => (
                  <div key={res.id} style={dropdownItemStyle} onMouseDown={(e) => { e.preventDefault(); handleSelectAddress(res, 'pickup', setPickupResults); }}>
                    {res.displayLines.join(', ')}
                  </div>
                ))}
              </div>
            )}
        </div>

        <div style={inputGroupStyle}>
            <label style={labelStyle}>Flight Number (For Airport Pickups)</label>
            <input type="text" name="flightNumber" style={inputStyle} placeholder="e.g. AA1234 or DL505" value={formData.flightNumber} onChange={handleChange} />
        </div>

        {formData.serviceType === 'distance' ? (
            <>
                {formData.stops.map((stop, index) => (
                    <div key={stop.id} style={inputGroupStyle}>
                        <div style={{display: 'flex', justifyContent:'space-between'}}>
                             <label style={labelStyle}>Stop #{index + 1}</label>
                             <span onClick={() => removeStop(stop.id)} style={{color: 'red', cursor: 'pointer', fontSize:'0.8rem'}}>REMOVE</span>
                        </div>
                        <input type="text" style={inputStyle} placeholder="Add stop address..." value={stop.address} onChange={(e) => handleStopSearch(stop.id, e.target.value)} />
                        {stopResults[stop.id] && stopResults[stop.id].length > 0 && (
                            <div style={dropdownStyle}>
                                {stopResults[stop.id].map(res => (
                                    <div key={res.id} style={dropdownItemStyle} onMouseDown={(e) => { e.preventDefault(); handleSelectStop(stop.id, res); }}>
                                        {res.displayLines.join(', ')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                <button type="button" onClick={addStop} style={{...activeButtonStyle, background: '#333', color: '#C5A059', marginBottom: '20px'}}>+ Add Stop</button>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Dropoff Destination</label>
                    <input 
                        type="text" style={inputStyle} placeholder="Start typing dropoff address..." 
                        value={formData.dropoff}
                        onChange={(e) => { setFormData({...formData, dropoff: e.target.value}); handleAddressSearch(e.target.value, setDropoffResults); }}
                        required 
                    />
                    {dropoffResults.length > 0 && (
                      <div style={dropdownStyle}>
                        {dropoffResults.map(res => (
                          <div key={res.id} style={dropdownItemStyle} onMouseDown={(e) => { e.preventDefault(); handleSelectAddress(res, 'dropoff', setDropoffResults); }}>
                            {res.displayLines.join(', ')}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div style={checkboxContainerStyle}>
                  <label style={checkboxLabelStyle}>
                    <input type="checkbox" name="isRoundTrip" checked={formData.isRoundTrip} onChange={handleChange} style={checkboxStyle} />
                    <span>Book Round Trip? (Return to Pickup)</span>
                  </label>
                </div>

                {formData.isRoundTrip && (
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Return Pickup Time</label>
                        <input type="datetime-local" name="returnTime" style={inputStyle} onChange={handleChange} required />
                    </div>
                )}
            </>
        ) : (
            <div style={inputGroupStyle}>
                <label style={labelStyle}>Duration (Hours)</label>
                <select name="hourlyDuration" style={inputStyle} onChange={handleChange} value={formData.hourlyDuration}>
                    {[2, 3, 4, 5, 6, 7, 8, 10, 12].map(h => <option key={h} value={h}>{h} Hours</option>)}
                </select>
            </div>
        )}

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

const formCardStyle = { background: '#111', border: '1px solid #C5A059', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '550px', margin: '0 auto', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', boxSizing: 'border-box', position: 'relative' };
const dropdownStyle = { position: 'absolute', zIndex: 9999, background: '#000', border: '1px solid #C5A059', borderRadius: '4px', width: '100%', marginTop: '0', maxHeight: '200px', overflowY: 'auto' };
const dropdownItemStyle = { padding: '15px', cursor: 'pointer', borderBottom: '1px solid #222', fontSize: '1rem', color: '#fff', background: '#000' };
const headerTitleStyle = { color: '#C5A059', marginTop: 0, fontSize: '1.8rem', fontFamily: '"Playfair Display", serif', marginBottom: '5px'};
const mapBoxStyle = { height: '200px', borderRadius: '8px', overflow: 'hidden', marginTop: '20px', border: '1px solid #333', background: '#222' };
const inputGroupStyle = { marginBottom: '20px', position: 'relative' }; 
const rowGridStyle = { display: 'flex', flexDirection: 'row', gap: '15px', marginBottom: '20px'};
const columnGridStyle = { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px'};
const labelStyle = { display: 'block', marginBottom: '8px', color: '#C5A059', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase'};
const inputStyle = { width: '100%', padding: '14px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px'};
const checkboxContainerStyle = { marginBottom: '25px', padding: '15px', background: '#000', borderRadius: '6px', border: '1px solid #333' };
const checkboxLabelStyle = { color: '#C5A059', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' };
const checkboxStyle = { width: '24px', height: '24px', accentColor: '#C5A059', cursor: 'pointer'};
const activeButtonStyle = { width: '100%', padding: '18px', background: '#C5A059', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', textTransform: 'uppercase'};
const disabledButtonStyle = { ...activeButtonStyle, background: '#555', color: '#888', cursor: 'not-allowed'};

export default BookingForm;