import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Surgical Replacement: Importing the Apple-compatible AdminMap
import AdminMap from '../components/AdminMap'; 

const Admin = () => {
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState(null);
  const [users, setUsers] = useState([]); 
  const [activeTab, setActiveTab] = useState('bookings'); 
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  // Markers state preserved for potential manual coordination if needed
  const [selectedMarker, setSelectedMarker] = useState(null);

  // --- API CONFIGURATION ---
  const apiUrl = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';
  
  const fetchData = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    try {
      const bookRes = await fetch(`${apiUrl}/api/admin/bookings`, {
        headers: { 'Authorization': password }
      });
      
      const userRes = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { 'Authorization': password }
      });

      if (bookRes.status === 401 || userRes.status === 401) {
        setError('❌ Access Denied: Incorrect Password');
        return;
      }
      
      const bookData = await bookRes.json();
      const userData = await userRes.json();
      setBookings(bookData);
      setUsers(userData);
    } catch (err) {
      console.error(err);
      setError('❌ Connection Error. Ensure server is running on https://www.jocoexec.com');
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      const res = await fetch(`${apiUrl}/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': password }
      });
      if (res.ok) {
       setBookings(bookings.filter(b => b._id !== id));
      } 
    }
  };

  const approveDriver = async (email) => {
    const res = await fetch(`${apiUrl}/api/admin/approve-driver`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': password 
      },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      alert(`Driver ${email} is now approved for dispatch.`);
      // Refresh Data without full reload
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
        .reduce((sum, b) => sum + (Number(b.amount) / 100), 0);
      return { day: date.split('-').slice(1).join('/'), revenue: dayTotal };
    });
  };

  // KPI & Filter Logic (100% Preserved)
  const totalRevenue = bookings ? bookings.reduce((sum, b) => sum + (Number(b.amount) / 100), 0) : 0;
  const driverCount = users.filter(u => u.role === 'driver' && u.isApproved).length;

  const filteredBookings = bookings ? bookings.filter(job => 
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.driver && job.driver.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.date) - new Date(a.date)) : [];

  // --- LOGIN VIEW ---
  if (!bookings) {
    return (
      <div style={loginOverlay}>
        <h1 style={{color: '#C5A059', textAlign: 'center', letterSpacing: '2px'}}>JOCO EXEC DISPATCH</h1>
        <form onSubmit={fetchData} style={loginCard}>
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={loginInput} 
          />
          <button type="submit" style={loginBtn}>ACCESS FLEET DATA</button>
        </form>
        {error && <p style={{color: '#ff4d4d', marginTop: '15px', textAlign: 'center'}}>{error}</p>}
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div style={{padding: '20px', minHeight: '100vh', background: '#f8f9fa', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={headerNav}>
        <div>
          <h1 style={{fontSize: '1.8rem', margin: 0, fontWeight: '800'}}>Fleet Control</h1>
          <p style={{color: '#888', margin: 0}}>Operational Analytics & Dispatch</p>
        </div>
        <button onClick={() => setBookings(null)} style={logoutBtn}>Log Out</button>
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <span style={statLabel}>Total Revenue</span>
          <h2 style={statValue}>${totalRevenue.toLocaleString()}</h2>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Active Bookings</span>
          <h2 style={statValue}>{bookings.length}</h2>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Approved Chauffeurs</span>
          <h2 style={statValue}>{driverCount}</h2>
        </div>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '25px'}}>
        <button onClick={() => setActiveTab('bookings')} style={activeTab === 'bookings' ? activeTabStyle : inactiveTabStyle}>Trip Schedule</button>
        <button onClick={() => setActiveTab('drivers')} style={activeTab === 'drivers' ? activeTabStyle : inactiveTabStyle}>Manage Drivers</button>
      </div>

      {activeTab === 'bookings' ? (
        <>
          {/* SURGERY: Replacing the bulky GoogleMap with the new Apple-enabled AdminMap */}
          <AdminMap bookings={bookings} />

          <div style={chartContainer}>
            <h3 style={sectionTitle}>Revenue Performance (Last 7 Days)</h3>
            <div style={{height: '250px', width: '100%'}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#999" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={4} dot={{ r: 6, fill: '#C5A059', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <input 
            type="text" 
            placeholder="Search bookings..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={searchBoxStyle} 
          />

          <div style={tableWrapper}>
            <table style={mainTable}>
              <thead>
                <tr style={tableHeader}>
                  <th style={thStyle}>Client / Date</th>
                  <th style={thStyle}>Route</th>
                  <th style={thStyle}>Dispatch Status</th>
                  <th style={thStyle}>Fare</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((job) => (
                  <tr key={job._id} style={tableRow}>
                    <td style={tdStyle}>
                      <div><strong>{job.date}</strong></div>
                      <div style={{color: '#666', fontSize: '0.8rem'}}>{job.name}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{fontSize: '0.85rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {job.pickup}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadge(job.driver)}>
                        {job.driver ? `Assigned: ${job.driver.split('@')[0]}` : 'Unclaimed'}
                      </span>
                    </td>
                    <td style={tdStyle}><strong>${(job.amount / 100).toFixed(2)}</strong></td>
                    <td style={tdStyle}>
                      {/* FIX: Using job._id here ensures the delete works */}
                      <button onClick={() => deleteBooking(job._id)} style={redBtnStyle}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={tableWrapper}>
          <table style={mainTable}>
            <thead>
              <tr style={tableHeader}>
                <th style={thStyle}>Chauffeur Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Auth Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'driver').map(driver => (
                <tr key={driver.email} style={tableRow}>
                  <td style={tdStyle}>{driver.name}</td>
                  <td style={tdStyle}>{driver.email}</td>
                  <td style={tdStyle}>
                    <span style={driverBadge(driver.isApproved)}>
                      {driver.isApproved ? 'VERIFIED' : 'PENDING REVIEW'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {!driver.isApproved && (
                      <button onClick={() => approveDriver(driver.email)} style={approveBtnStyle}>ACTIVATE</button>
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

// --- STYLES (100% Preserved) ---
const sectionTitle = { marginTop: 0, fontSize: '1rem', color: '#333', marginBottom: '15px' };
const loginOverlay = { minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '20px' };
const loginCard = { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '350px', background: '#0f0f0f', padding: '40px', borderRadius: '12px', border: '1px solid #1a1a1a' };
const loginInput = { padding: '15px', background: '#000', color: '#fff', border: '1px solid #333', fontSize: '16px', borderRadius: '4px' };
const loginBtn = { padding: '15px', background: '#C5A059', fontWeight: 'bold', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const headerNav = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' };
const logoutBtn = { background: '#eee', color: '#333', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const statLabel = { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' };
const statValue = { fontSize: '1.8rem', color: '#000', margin: '5px 0 0', fontWeight: '800' };
const chartContainer = { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' };
const searchBoxStyle = { width: '100%', padding: '18px', marginBottom: '25px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' };
const tableWrapper = { overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const mainTable = { width: '100%', borderCollapse: 'collapse', minWidth: '800px' };
const tableHeader = { background: '#fcfcfc', borderBottom: '2px solid #eee', textAlign: 'left' };
const tableRow = { borderBottom: '1px solid #f0f0f0' };
const thStyle = { padding: '18px', fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '18px', fontSize: '0.95rem' };
const activeTabStyle = { background: '#000', color: '#fff', padding: '12px 25px', border: 'none', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' };
const inactiveTabStyle = { background: '#fff', color: '#666', padding: '12px 25px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer' };
const redBtnStyle = { background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const approveBtnStyle = { background: '#C5A059', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const statusBadge = (driver) => ({ background: driver ? '#eefdf3' : '#fff1f0', color: driver ? '#28a745' : '#cf1322', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' });
const driverBadge = (isApproved) => ({ background: isApproved ? '#e6f4ea' : '#fff4e5', color: isApproved ? '#1e7e34' : '#b7791f', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' });

export default Admin;