import React, { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig'; // ✅ New Config Import

const DriverDashboard = ({ user }) => { // ✅ Accepts user from App.js
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Note: We removed the dangerous "const user = JSON.parse..." line

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/user/my-bookings`, {
          headers: { 'Authorization': token }
        });
        
        if (!res.ok) throw new Error("Could not fetch jobs");
        
        const data = await res.json();
        setMyJobs(data);
      } catch (err) {
        setError('Unable to load schedule. Check your connection.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.isApproved) fetchJobs();
    else setLoading(false);
  }, [user]);

  // --- 1. Pending Approval View ---
  if (!user?.isApproved) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#fff', background: '#000', minHeight: '90vh' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #C5A059', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ color: '#C5A059' }}>Account Pending</h2>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Welcome, {user?.name}. Your chauffeur credentials are currently under review. 
            Once approved by the JOCO Admin, you will receive trip alerts here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #222', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#C5A059', margin: 0 }}>Driver Portal</h1>
        <p style={{ color: '#888' }}>Dispatcher active for: <strong>{user.email}</strong></p>
      </div>

      {loading ? (
        <p>Loading trips...</p>
      ) : error ? (
        <p style={{ color: '#ff4d4d' }}>{error}</p>
      ) : myJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #333' }}>
          <p style={{ color: '#888' }}>No active trips claimed yet.</p>
          <p style={{ fontSize: '0.9rem' }}>Check your email/SMS for new dispatch alerts.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {myJobs.map(job => (
            <div key={job.id} style={{ background: '#111', borderRadius: '8px', borderLeft: '5px solid #C5A059', overflow: 'hidden' }}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{job.date} @ {job.time}</span>
                  <span style={{ color: '#C5A059', fontWeight: 'bold' }}>${(job.amount / 100).toFixed(2)}</span>
                </div>

                <div style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0' }}><strong>Passenger:</strong> {job.name}</p>
                  <p style={{ margin: '5px 0' }}><strong>Phone:</strong> <a href={`tel:${job.phone}`} style={{ color: '#C5A059' }}>{job.phone}</a></p>
                </div>

                <div style={{ background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 5px 0' }}>📍 {job.pickup}</p>
                  <p style={{ margin: 0 }}>🏁 {job.dropoff}</p>
                </div>

                {job.flightNumber && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '5px 0', color: '#888', fontSize: '0.85rem' }}>
                      ✈️ Flight: <strong>{job.flightNumber}</strong>
                    </p>
                    <a 
                      href={`https://flightaware.com/live/flight/${job.flightNumber}`}
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        display: 'block', background: '#333', color: '#fff', textAlign: 'center', 
                        padding: '10px', borderRadius: '4px', textDecoration: 'none', 
                        fontSize: '0.9rem', marginTop: '5px', border: '1px solid #555'
                      }}
                    >
                      📡 CHECK LIVE STATUS
                    </a>
                  </div>
                )}

                <a 
                  href={`https://maps.apple.com/?daddr=${encodeURIComponent(job.pickup)}&dirflg=d`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'block', background: '#C5A059', color: '#000', textAlign: 'center', 
                    padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold'
                  }}
                >
                  NAVIGATE TO PICKUP
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;