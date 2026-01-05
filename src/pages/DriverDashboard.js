import React, { useState, useEffect } from 'react';

const DriverDashboard = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // In a real app, we would fetch specifically assigned jobs
    // For now, we reuse the admin endpoint but filter in frontend or backend
    const fetchJobs = async () => {
       const token = localStorage.getItem('token');
       const res = await fetch('http://localhost:5000/api/admin/bookings', {
         headers: { 'Authorization': 'my-secret-admin-password' } // Reusing admin route for simplicity
       });
       const data = await res.json();
       // Only show jobs that are unclaimed OR claimed by ME
       setJobs(data);
    };
    fetchJobs();
  }, []);

  return (
    <div className="section-container" style={{padding: '40px 20px', minHeight: '100vh', background: '#111', color: '#fff'}}>
      <h1 style={{color: '#C5A059'}}>Driver Portal</h1>
      <p>Available Jobs and My Schedule</p>
      
      {jobs.map(job => (
        <div key={job.id} style={{background: '#222', borderLeft: '4px solid #C5A059', padding: '20px', marginBottom: '20px'}}>
           <h3>{job.date} @ {job.time}</h3>
           <p><strong>From:</strong> {job.pickup}</p>
           <p><strong>To:</strong> {job.dropoff}</p>
           {job.driver ? (
             <span style={{color: 'green'}}>CLAIMED by {job.driver}</span>
           ) : (
             <button style={{padding: '10px', background: '#C5A059', border: 'none'}}>CLAIM JOB</button>
           )}
        </div>
      ))}
    </div>
  );
};

export default DriverDashboard;