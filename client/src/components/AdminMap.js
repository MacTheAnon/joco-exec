import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const AdminMap = ({ bookings }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
  });

  const [selected, setSelected] = useState(null);

  const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '30px'
  };

  // Center on Johnson County area by default
  const center = { lat: 38.8814, lng: -94.8191 };

  return isLoaded ? (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#333' }}>Fleet Distribution Map</h3>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={{ styles: silverMapStyle }}
      >
        {bookings.map((job) => (
          <Marker 
            key={job.id} 
            position={job.coords || center} // Note: Requires geocoding service or stored lat/lng
            onClick={() => setSelected(job)}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/gold-dot.png"
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={selected.coords || center}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ color: '#000', padding: '5px' }}>
              <strong style={{ color: '#C5A059' }}>{selected.name}</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>{selected.pickup}</p>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>{selected.time}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : <p>Loading Maps...</p>;
};

// Custom "Silver" style for a premium look
const silverMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "footer": "none" }
];

export default AdminMap;