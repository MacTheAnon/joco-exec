import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBookings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: { 'Authorization': password }
      });
      
      if (res.status === 401) {
        setError('Wrong Password');
        return;
      }
      
      const data = await res.json();
      setBookings(data);
      setError('');
    } catch (err) {
      setError('Connection Error - Is the server running?');
    }
  };

  // --- CHART LOGIC: Last 7 Days Revenue ---
  const getChartData = () => {
    if (!bookings) return [];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTotal = bookings
        .filter(b => b.date === date)
        .reduce((sum, b) => sum + (b.amount / 100), 0);
      return { day: date.split('-').slice(1).join('/'), revenue: dayTotal };
    });
  };

  const filteredBookings = bookings ? bookings.filter(job => 
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.driver && job.driver.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  if (!bookings) {
    return (
      <div style={{minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111'}}>
        <h1 style={{color: '#C5A059'}}>JOCO EXEC Dispatch</h1>
        <form onSubmit={fetchBookings} style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', background: '#1a1a1a', padding: '30px', borderRadius: '8px'}}>
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{padding: '12px', background: '#000', color: '#fff', border: '1px solid #444'}}
          />
          <button type="submit" style={{padding: '12px', background: '#C5A059', fontWeight: 'bold', cursor: 'pointer'}}>ACCESS SCHEDULE</button>
        </form>
        {error && <p style={{color: '#ff4d4d'}}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{padding: '40px 20px', minHeight: '100vh', background: '#f8f9fa'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <h1>Fleet Revenue Trends</h1>
        <button onClick={() => setBookings(null)} style={{background: '#333', color: '#fff', padding: '10px 20px', cursor: 'pointer'}}>Log Out</button>
      </div>

      {/* REVENUE CHART SECTION */}
      <div style={{background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px', height: '300px'}}>
        <h3 style={{marginTop: 0}}>7-Day Revenue (USD)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3} dot={{ r: 6, fill: '#C5A059' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <input 
        type="text" 
        placeholder="Search schedules..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd'}}
      />

      <div style={{overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#111', color: '#C5A059', textAlign: 'left'}}>
              <th style={{padding: '15px'}}>Trip Info</th>
              <th style={{padding: '15px'}}>Route</th>
              <th style={{padding: '15px'}}>Status</th>
              <th style={{padding: '15px'}}>Fare</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((job) => (
              <tr key={job.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '15px'}}>
                  <strong>{job.date} @ {job.time}</strong><br/>
                  {job.name}
                </td>
                <td style={{padding: '15px', fontSize: '0.85rem'}}>
                  {job.pickup.substring(0, 30)}...
                </td>
                <td style={{padding: '15px'}}>
                  <span style={{color: job.driver ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>
                    {job.driver ? 'ASSIGNED' : 'PENDING'}
                  </span>
                </td>
                <td style={{padding: '15px', fontWeight: 'bold'}}>${(job.amount / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;