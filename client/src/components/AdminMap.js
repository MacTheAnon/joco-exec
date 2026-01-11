import React, { useState, useEffect } from 'react';
import { Map, Marker } from 'mapkit-react';

// --- API CONFIGURATION ---
const API_BASE = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';

const AdminMap = ({ bookings }) => {
  const [token, setToken] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // 1. Fetch the secure JWT using the Universal URL
    fetch(`${API_BASE}/api/maps/token`)
      .then(res => res.json())
      .then(data => {
        if (data.token) {
            setToken(data.token);
        } else {
            console.error("Admin Map: Server returned no token");
        }
      })
      .catch(err => console.error("Admin Map Token Error:", err));
  }, []);

  const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '30px',
    overflow: 'hidden',
    position: 'relative' // Fix for loading text positioning
  };

  // Center on Johnson County area by default
  const center = { latitude: 38.8814, longitude: -94.8191 };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#333' }}>Fleet Distribution Map (Apple Maps)</h3>
      
      <div style={containerStyle}>
        {/* 2. Crash Proof Loading State */}
        {token ? (
            <Map 
              token={token}
              initialRegion={{
                centerLatitude: center.latitude,
                centerLongitude: center.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
            >
              {/* 3. Render Bookings as Markers */}
              {bookings.map((job) => (
                <Marker 
                  key={job.id} 
                  latitude={job.pickupCoords?.latitude || center.latitude} 
                  longitude={job.pickupCoords?.longitude || center.longitude}
                  title={job.name}
                  subtitle={job.vehicleType}
                  color={job.driver ? "#28a745" : "#C5A059"} // Green if assigned, Gold if open
                  onSelect={() => setSelected(job)}
                  onDeselect={() => setSelected(null)}
                />
              ))}
            </Map>
        ) : (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                background: '#f9f9f9', color: '#666'
            }}>
                Initializing Secure Map...
            </div>
        )}
      </div>

      {selected && (
        <div style={{ marginTop: '10px', padding: '15px', borderLeft: '4px solid #C5A059', background: '#f9f9f9', borderRadius: '4px' }}>
           <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{selected.name}</div>
           <div style={{color: '#666', fontSize: '0.9rem', marginTop: '5px'}}>
             📍 {selected.pickup} <br/>
             🏁 {selected.dropoff}
           </div>
           <div style={{marginTop: '10px', fontWeight: 'bold', color: selected.driver ? 'green' : '#C5A059'}}>
             {selected.driver ? `Assigned to: ${selected.driver}` : "Status: Unclaimed"}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminMap;