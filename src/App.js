import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Customer Trip History
import DriverDashboard from './pages/DriverDashboard';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refunds from './pages/Refunds';

// Import Components
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clears token and user data
    setUser(null);
    window.location.href = '/'; 
  };

  return (
    <Router>
      <div className="App" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000'}}>
        
        {/* --- NAVIGATION BAR --- */}
        <nav style={{
          background: '#000', 
          padding: '20px 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '2px solid #C5A059',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          {/* LOGO */}
          <Link to="/" style={{textDecoration: 'none'}}>
            <div style={{color: '#C5A059', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px'}}>
              JOCO EXEC
            </div>
          </Link>
          
          {/* MENU LINKS */}
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Link to="/" style={{color: '#fff', marginRight: '20px', textDecoration: 'none'}}>Home</Link>
            
            {user ? (
              <>
                {/* Logic for Driver vs Customer Links */}
                {user.role === 'driver' ? (
                  <Link to="/driver-dashboard" style={{color: '#C5A059', marginRight: '20px', textDecoration: 'none', fontWeight: 'bold'}}>
                    Driver Portal
                  </Link>
                ) : (
                  <Link to="/dashboard" style={{color: '#C5A059', marginRight: '20px', textDecoration: 'none', fontWeight: 'bold'}}>
                    My Trips
                  </Link>
                )}
                
                <span style={{color: '#888', marginRight: '20px', fontSize: '0.9rem'}}>
                  Hello, {user.name.split(' ')[0]}
                </span>
                
                <button 
                  onClick={handleLogout} 
                  style={{
                    background: 'transparent', 
                    color: '#fff', 
                    border: '1px solid #444', 
                    padding: '5px 12px', 
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{color: '#fff', textDecoration: 'none', marginRight: '20px'}}>
                  Login
                </Link>
                <Link to="/booking" style={{
                  background: '#C5A059', 
                  color: '#000', 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold'
                }}>
                  Book Now
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* --- ROUTES --- */}
        <div style={{flex: 1}}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />

            {/* Legal Routes */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refunds" element={<Refunds />} />

            {/* Customer History */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />

            {/* Protected Driver Route */}
            <Route 
              path="/driver-dashboard" 
              element={user && user.role === 'driver' ? <DriverDashboard /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>

        {/* --- FOOTER --- */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;