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
      fetchData(); 
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

  // --- LOGIN VIEW ---
  if (!bookings) {
    return (
      <div style={{minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', padding: '20px'}}>
        <h1 style={{color: '#C5A059', textAlign: 'center'}}>JOCO EXEC Dispatch</h1>
        <form onSubmit={fetchData} style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '320px', background: '#1a1a1a', padding: '30px', borderRadius: '8px'}}>
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{padding: '15px', background: '#000', color: '#fff', border: '1px solid #444', fontSize: '16px'}} 
          />
          <button type="submit" style={{padding: '15px', background: '#C5A059', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px'}}>ACCESS FLEET DATA</button>
        </form>
        {error && <p style={{color: '#ff4d4d', marginTop: '15px'}}>{error}</p>}
      </div>
    );
  }

  // --- MAIN ADMIN VIEW ---
  return (
    <div style={{padding: '20px', minHeight: '100vh', background: '#f8f9fa'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
        <h1 style={{fontSize: '1.5rem', margin: 0}}>Fleet Control</h1>
        <button onClick={() => setBookings(null)} style={{background: '#333', color: '#fff', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Log Out</button>
      </div>

      {/* TABS */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap'}}>
        <button 
          onClick={() => setActiveTab('bookings')} 
          style={activeTab === 'bookings' ? activeTabStyle : inactiveTabStyle}
        >
          Trip Schedule
        </button>
        <button 
          onClick={() => setActiveTab('drivers')} 
          style={activeTab === 'drivers' ? activeTabStyle : inactiveTabStyle}
        >
          Manage Drivers
        </button>
      </div>

      {activeTab === 'bookings' ? (
        <>
          {/* REVENUE CHART */}
          <div style={{background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '25px'}}>
            <h3 style={{marginTop: 0, fontSize: '1rem'}}>7-Day Revenue Trend</h3>
            <div style={{height: '250px', width: '100%'}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" hide={window.innerWidth < 500} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3} dot={{ r: 5, fill: '#C5A059' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <input 
            type="text" 
            placeholder="Search trips, pickups, or drivers..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={searchBoxStyle} 
          />

          {/* BOOKINGS TABLE */}
          <div style={tableContainerStyle}>
            <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '700px'}}>
              <thead>
                <tr style={{background: '#111', color: '#C5A059', textAlign: 'left'}}>
                  <th style={thStyle}>Date & Client</th>
                  <th style={thStyle}>Route</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Fare</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((job) => (
                  <tr key={job.id} style={{borderBottom: '1px solid #eee'}}>
                    <td style={tdStyle}>
                      <strong>{job.date}</strong><br/>
                      <span style={{fontSize: '0.85rem', color: '#666'}}>{job.name}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{fontSize: '0.85rem'}}>{job.pickup.substring(0, 30)}...</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{color: job.driver ? '#28a745' : '#dc3545', fontWeight: 'bold', fontSize: '0.8rem'}}>
                        {job.driver ? 'ASSIGNED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={tdStyle}>${(job.amount / 100).toFixed(2)}</td>
                    <td style={tdStyle}>
                      <button onClick={() => deleteBooking(job.id)} style={redBtnStyle}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* DRIVERS MANAGEMENT */
        <div style={tableContainerStyle}>
          <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '500px'}}>
            <thead>
              <tr style={{background: '#111', color: '#C5A059', textAlign: 'left'}}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'driver').map(driver => (
                <tr key={driver.email} style={{borderBottom: '1px solid #eee'}}>
                  <td style={tdStyle}>{driver.name}</td>
                  <td style={tdStyle}>{driver.email}</td>
                  <td style={tdStyle}>
                    {driver.isApproved ? 
                      <b style={{color:'green', fontSize: '0.8rem'}}>APPROVED</b> : 
                      <b style={{color:'orange', fontSize: '0.8rem'}}>PENDING</b>
                    }
                  </td>
                  <td style={tdStyle}>
                    {!driver.isApproved && (
                      <button onClick={() => approveDriver(driver.email)} style={approveBtnStyle}>APPROVE</button>
                    )}
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
const thStyle = { padding: '15px', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', fontSize: '0.9rem' };
const tableContainerStyle = { overflowX: 'auto', WebkitOverflowScrolling: 'touch', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const searchBoxStyle = { width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' };
const activeTabStyle = { background: '#C5A059', color: '#000', padding: '12px 20px', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' };
const inactiveTabStyle = { background: '#ddd', color: '#666', padding: '12px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' };
const redBtnStyle = { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const approveBtnStyle = { background: '#C5A059', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };

export default Admin;