import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminMap from '../components/AdminMap'; 

const Admin = () => {
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState(null);
  const [users, setUsers] = useState([]); 
  const [activeTab, setActiveTab] = useState('bookings'); 
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';
  
  const fetchData = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    try {
      const bookRes = await fetch(`${apiUrl}/api/admin/bookings`, { headers: { 'Authorization': password } });
      const userRes = await fetch(`${apiUrl}/api/admin/users`, { headers: { 'Authorization': password } });

      if (bookRes.status === 401 || userRes.status === 401) {
        setError('❌ Access Denied: Incorrect Password');
        return;
      }
      
      setBookings(await bookRes.json());
      setUsers(await userRes.json());
    } catch (err) {
      setError('❌ Connection Error. Ensure server is running.');
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      const res = await fetch(`${apiUrl}/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': password }
      });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
      } 
    }
  };

  const approveDriver = async (email) => {
    const res = await fetch(`${apiUrl}/api/admin/approve-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': password },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      alert(`Driver ${email} is now approved for dispatch.`);
      fetchData();
    }
  };

  const assignDriver = async (bookingId, driverId) => {
    const updatedBookings = bookings.map(b => 
        b.id === bookingId || b._id === bookingId ? { ...b, driverId: driverId } : b
    );
    setBookings(updatedBookings);

    try {
        const res = await fetch(`${apiUrl}/api/admin/assign-driver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': password },
            body: JSON.stringify({ bookingId, driverId })
        });
        if (!res.ok) throw new Error("Failed to assign");
    } catch (err) {
        alert("Error assigning driver. Please try again.");
        fetchData(); 
    }
  };

  // ✅ NEW: Dispatch Radio Function
  const dispatchRadio = async (driverId, driverName) => {
      const message = window.prompt(`🎙️ RADIO DISPATCH to ${driverName}:\nEnter brief instruction (e.g. 'Go to Gate 5'):`);
      if (!message) return;

      try {
          const res = await fetch(`${apiUrl}/api/admin/dispatch-radio`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': password },
              body: JSON.stringify({ driverId, message })
          });
          
          if (res.ok) {
              alert("✅ Radio sent! Driver's phone will ring momentarily.");
          } else {
              const data = await res.json();
              alert("❌ Dispatch Failed: " + (data.error || "Unknown Error"));
          }
      } catch (e) {
          alert("❌ Network Error");
      }
  };

  // HELPER: Lookup Driver Name from ID
  const getDriverName = (driverId) => {
      if (!driverId) return 'Unclaimed';
      const driver = users.find(u => u._id === driverId);
      return driver ? `Assigned: ${driver.name}` : 'Unknown ID';
  };

  const getChartData = () => {
    if (!bookings) return [];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTotal = bookings
        .filter(b => b.date === date)
        .reduce((sum, b) => sum + (Number(b.amount || 0) / 100), 0);
      return { day: date.split('-').slice(1).join('/'), revenue: dayTotal };
    });
  };

  const totalRevenue = bookings ? bookings.reduce((sum, b) => sum + (Number(b.amount || b.totalCharged) / 100), 0) : 0;
  
  const filteredBookings = bookings ? bookings.filter(job => 
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.pickup.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.date) - new Date(a.date)) : [];

  if (!bookings) {
    return (
      <div style={loginOverlay}>
        <h1 style={{color: '#C5A059', textAlign: 'center'}}>JOCO ADMIN</h1>
        <form onSubmit={fetchData} style={loginCard}>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={loginInput} />
          <button type="submit" style={loginBtn}>LOGIN</button>
        </form>
        {error && <p style={{color: 'red', marginTop: '15px'}}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{padding: '20px', minHeight: '100vh', background: '#f8f9fa', color: '#333', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={headerNav}>
        <h1 style={{fontSize: '1.8rem'}}>Fleet Control</h1>
        <button onClick={() => setBookings(null)} style={logoutBtn}>Log Out</button>
      </div>

      <div style={statsGrid}>
        <div style={statCard}><span style={statLabel}>Total Revenue</span><h2 style={statValue}>${totalRevenue.toLocaleString()}</h2></div>
        <div style={statCard}><span style={statLabel}>Bookings</span><h2 style={statValue}>{bookings.length}</h2></div>
        <div style={statCard}><span style={statLabel}>Drivers</span><h2 style={statValue}>{users.filter(u => u.role === 'driver').length}</h2></div>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '25px'}}>
        <button onClick={() => setActiveTab('bookings')} style={activeTab === 'bookings' ? activeTabStyle : inactiveTabStyle}>Schedule</button>
        <button onClick={() => setActiveTab('drivers')} style={activeTab === 'drivers' ? activeTabStyle : inactiveTabStyle}>Drivers</button>
      </div>

      {activeTab === 'bookings' ? (
        <>
          <AdminMap bookings={bookings} />
          <div style={chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="day"/><YAxis/><Tooltip/>
                    <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3}/>
                </LineChart>
            </ResponsiveContainer>
          </div>
          <input type="text" placeholder="Search bookings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchBoxStyle} />
          
          <div style={tableWrapper}>
            <table style={mainTable}>
              <thead><tr style={tableHeader}><th>Date/Client</th><th>Route</th><th>Dispatcher</th><th>Fare</th><th>Action</th></tr></thead>
              <tbody>
                {filteredBookings.map((job) => (
                  <tr key={job.id} style={tableRow}>
                    <td style={tdStyle}><div><strong>{job.date}</strong></div><div style={{color: '#666', fontSize:'0.8rem'}}>{job.name}</div></td>
                    <td style={tdStyle}>{job.pickup}</td>
                    
                    {/* Dispatch Dropdown + Radio Button */}
                    <td style={tdStyle}>
                       <div style={{display: 'flex', gap: '5px'}}>
                           <select 
                             value={job.driverId || ""} 
                             onChange={(e) => assignDriver(job.id || job._id, e.target.value)}
                             style={selectStyle}
                           >
                             <option value="">-- Unclaimed --</option>
                             {users.filter(u => u.role === 'driver' && u.isApproved).map(d => (
                               <option key={d._id} value={d._id}>{d.name}</option>
                             ))}
                           </select>
                           
                           {/* ✅ RADIO BUTTON: Only shows if driver is assigned */}
                           {job.driverId && (
                               <button 
                                 onClick={() => dispatchRadio(job.driverId, getDriverName(job.driverId))} 
                                 title="Radio Blast Driver"
                                 style={{background: '#333', border:'none', borderRadius: '4px', cursor: 'pointer', padding: '0 8px'}}
                               >
                                 🎙️
                               </button>
                           )}
                       </div>
                    </td>

                    <td style={tdStyle}><strong>${(job.amount / 100).toFixed(2)}</strong></td>
                    <td style={tdStyle}>
                        <button onClick={() => deleteBooking(job.id)} style={redBtnStyle}>Remove</button>
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
            <thead><tr style={tableHeader}><th>Name</th><th>Email</th><th>Status</th><th>Radio</th><th>Action</th></tr></thead>
            <tbody>
              {users.filter(u => u.role === 'driver').map(d => (
                <tr key={d._id} style={tableRow}>
                  <td style={tdStyle}>{d.name}</td><td style={tdStyle}>{d.email}</td>
                  <td style={tdStyle}><span style={driverBadge(d.isApproved)}>{d.isApproved ? 'ACTIVE' : 'PENDING'}</span></td>
                  
                  {/* ✅ RADIO COLUMN in Driver Tab too */}
                  <td style={tdStyle}>
                      <button 
                         onClick={() => dispatchRadio(d._id, d.name)} 
                         style={{background: '#333', color: '#fff', border:'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px'}}
                       >
                         🎙️ CALL
                       </button>
                  </td>

                  <td style={tdStyle}>{!d.isApproved && <button onClick={() => approveDriver(d.email)} style={approveBtnStyle}>APPROVE</button>}</td>
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
const loginOverlay = { minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '20px' };
const loginCard = { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '350px', background: '#111', padding: '40px', borderRadius: '12px' };
const loginInput = { padding: '15px', background: '#000', color: '#fff', border: '1px solid #333', fontSize: '16px', borderRadius: '4px' };
const loginBtn = { padding: '15px', background: '#C5A059', fontWeight: 'bold', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const headerNav = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const logoutBtn = { background: '#eee', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const statLabel = { fontSize: '0.75rem', color: '#888', fontWeight: 'bold' };
const statValue = { fontSize: '1.8rem', margin: '5px 0 0' };
const chartContainer = { background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '30px' };
const searchBoxStyle = { width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const tableWrapper = { overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const mainTable = { width: '100%', borderCollapse: 'collapse', minWidth: '700px' };
const tableHeader = { background: '#f8f8f8', textAlign: 'left', borderBottom: '2px solid #eee' };
const tableRow = { borderBottom: '1px solid #eee' };
const thStyle = { padding: '15px', color: '#666', fontSize: '0.85rem' };
const tdStyle = { padding: '15px', fontSize: '0.9rem', color: '#000' };
const activeTabStyle = { background: '#000', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const inactiveTabStyle = { background: '#fff', color: '#666', padding: '10px 20px', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer' };
const redBtnStyle = { background: 'transparent', color: 'red', border: '1px solid red', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };
const approveBtnStyle = { background: '#C5A059', border: 'none', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };
const statusBadge = (active) => ({ background: active ? '#e6f4ea' : '#fff0f0', color: active ? 'green' : 'red', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' });
const driverBadge = (approved) => ({ background: approved ? '#e6f4ea' : '#fff4e5', color: approved ? 'green' : 'orange', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' });
const selectStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', color: '#333', fontSize: '0.9rem', width: '100%' };

export default Admin;