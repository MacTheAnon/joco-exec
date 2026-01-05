import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState(null);
  const [users, setUsers] = useState([]); 
  const [activeTab, setActiveTab] = useState('bookings'); 
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (e) => {
    if (e) e.preventDefault();
    try {
      // Fetch Bookings
      const bookRes = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: { 'Authorization': password }
      });
      
      // Fetch Users
      const userRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': password }
      });

      if (bookRes.status === 401 || userRes.status === 401) {
        setError('Wrong Password');
        return;
      }
      
      const bookData = await bookRes.json();
      const userData = await userRes.json();
      setBookings(bookData);
      setUsers(userData);
      setError('');
    } catch (err) {
      setError('Connection Error - Is the server running?');
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': password }
      });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
      }
    }
  };

  const approveDriver = async (email) => {
    const res = await fetch('http://localhost:5000/api/admin/approve-driver', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': password 
      },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      alert(`Driver ${email} is now approved for dispatch.`);
      fetchData(); // Refresh list
    }
  };

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
        <form onSubmit={fetchData} style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', background: '#1a1a1a', padding: '30px', borderRadius: '8px'}}>
          <input type="password" placeholder="Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <button type="submit" style={goldButton}>ACCESS FLEET DATA</button>
        </form>
        {error && <p style={{color: '#ff4d4d'}}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{padding: '40px 20px', minHeight: '100vh', background: '#f8f9fa'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <h1>Fleet Control Center</h1>
        <button onClick={() => setBookings(null)} style={{background: '#333', color: '#fff', padding: '10px 20px', cursor: 'pointer', border: 'none'}}>Log Out</button>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '30px'}}>
        <button onClick={() => setActiveTab('bookings')} style={activeTab === 'bookings' ? activeTabStyle : inactiveTabStyle}>Trip Schedule</button>
        <button onClick={() => setActiveTab('drivers')} style={activeTab === 'drivers' ? activeTabStyle : inactiveTabStyle}>Manage Drivers</button>
      </div>

      {activeTab === 'bookings' ? (
        <>
          <div style={cardStyle}>
            <h3>7-Day Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3} dot={{ r: 6, fill: '#C5A059' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <input type="text" placeholder="Search schedules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchBox} />

          <div style={tableContainer}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#111', color: '#C5A059', textAlign: 'left'}}>
                  <th style={padding}>Trip Info</th>
                  <th style={padding}>Route</th>
                  <th style={padding}>Status</th>
                  <th style={padding}>Fare</th>
                  <th style={padding}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((job) => (
                  <tr key={job.id} style={{borderBottom: '1px solid #eee'}}>
                    <td style={padding}><strong>{job.date}</strong><br/>{job.name}</td>
                    <td style={padding}>{job.pickup.substring(0, 30)}...</td>
                    <td style={padding}><span style={{color: job.driver ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>{job.driver ? 'ASSIGNED' : 'PENDING'}</span></td>
                    <td style={padding}>${(job.amount / 100).toFixed(2)}</td>
                    <td style={padding}><button onClick={() => deleteBooking(job.id)} style={redBtn}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={tableContainer}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#111', color: '#C5A059', textAlign: 'left'}}>
                <th style={padding}>Name</th>
                <th style={padding}>Email</th>
                <th style={padding}>Status</th>
                <th style={padding}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'driver').map(driver => (
                <tr key={driver.email} style={{borderBottom: '1px solid #eee'}}>
                  <td style={padding}>{driver.name}</td>
                  <td style={padding}>{driver.email}</td>
                  <td style={padding}>{driver.isApproved ? <b style={{color:'green'}}>APPROVED</b> : <b style={{color:'orange'}}>PENDING</b>}</td>
                  <td style={padding}>
                    {!driver.isApproved && <button onClick={() => approveDriver(driver.email)} style={goldSmallBtn}>APPROVE</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const padding = { padding: '15px' };
const inputStyle = { padding: '12px', background: '#000', color: '#fff', border: '1px solid #444' };
const goldButton = { padding: '12px', background: '#C5A059', fontWeight: 'bold', cursor: 'pointer', border: 'none' };
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px' };
const tableContainer = { overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const searchBox = { width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const redBtn = { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' };
const goldSmallBtn = { background: '#C5A059', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const activeTabStyle = { background: '#C5A059', color: '#000', padding: '10px 25px', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' };
const inactiveTabStyle = { background: '#ddd', color: '#666', padding: '10px 25px', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Admin;