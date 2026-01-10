import React, { useState, useEffect } from 'react';
import { Map, Marker } from 'mapkit-react';

const AdminMap = ({ bookings }) => {
  const [token, setToken] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Fetch the secure JWT from your completed server.js
    fetch('/api/maps/token')
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(err => console.error("Error loading Apple Maps Token:", err));
  }, []);

  const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '30px'
  };

  // Center on Johnson County area by default
  const center = { latitude: 38.8814, longitude: -94.8191 };

  if (!token) return <div style={{padding: '20px', textAlign: 'center'}}>Initializing Fleet Map...</div>;

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#333' }}>Fleet Distribution Map (Apple Maps)</h3>
      <div style={containerStyle}>
        <Map 
          token={token}
          initialRegion={{
            centerLatitude: center.latitude,
            centerLongitude: center.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {bookings.map((job) => (
            <Marker 
              key={job.id} 
              latitude={job.coords?.lat || center.latitude} 
              longitude={job.coords?.lng || center.longitude}
              title={job.name}
              subtitle={job.pickup}
              onSelect={() => setSelected(job)}
              onDeselect={() => setSelected(null)}
            />
          ))}
        </Map>
      </div>
      {selected && (
        <div style={{ marginTop: '10px', padding: '10px', borderLeft: '4px solid #C5A059', background: '#f9f9f9' }}>
           <strong>{selected.name}</strong> — {selected.pickup}
        </div>
      )}
    </div>
  );
};

export default AdminMap;