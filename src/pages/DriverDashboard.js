import React, { useState, useEffect } from 'react';

const DriverDashboard = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/my-bookings', {
          headers: { 'Authorization': localStorage.getItem('token') }
        });
        const data = await res.json();
        setMyJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (!user?.isApproved) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', color: '#fff', background: '#000', minHeight: '80vh' }}>
        <h2 style={{ color: '#C5A059' }}>Account Pending Approval</h2>
        <p style={{ color: '#888' }}>Your chauffeur credentials are being reviewed. You will see jobs here once approved by Admin.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#C5A059' }}>Driver Portal</h1>
      <p style={{ marginBottom: '30px' }}>Logged in as: <strong>{user.name}</strong></p>

      {loading ? (
        <p>Loading your schedule...</p>
      ) : myJobs.length === 0 ? (
        <div style={{ padding: '40px', border: '1px dashed #444', textAlign: 'center' }}>
          <p style={{ color: '#888' }}>No active trips assigned to you yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {myJobs.map(job => (
            <div key={job.id} style={{ background: '#111', padding: '20px', borderLeft: '5px solid #C5A059', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{job.date} @ {job.time}</span>
                <span style={{ color: '#C5A059', fontWeight: 'bold' }}>${(job.amount / 100).toFixed(2)}</span>
              </div>
              
              <p style={{ margin: '5px 0' }}><strong>Client:</strong> {job.name}</p>
              <p style={{ margin: '5px 0', color: '#ccc' }}><strong>Pickup:</strong> {job.pickup}</p>
              <p style={{ margin: '5px 0', color: '#ccc' }}><strong>Dropoff:</strong> {job.dropoff}</p>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.pickup)}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ background: '#C5A059', color: '#000', padding: '8px 15px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
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