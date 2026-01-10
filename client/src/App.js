import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refunds from './pages/Refunds';

// Import Components
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Track window size in state for responsive menu behavior
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Add Resize Listener to handle mobile view dynamically
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/'; 
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router>
      <div className="App" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000'}}>
        
        {/* --- NAVIGATION --- */}
        <nav style={{
          background: '#000', 
          padding: '15px 25px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '2px solid #C5A059',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Link to="/" onClick={closeMenu} style={{textDecoration: 'none'}}>
            <div style={{color: '#C5A059', fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '1px'}}>
              JOCO EXEC
            </div>
          </Link>

          {/* Hamburger Icon */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: isMobile ? 'block' : 'none', 
              background: 'none',
              border: 'none',
              color: '#C5A059',
              fontSize: '1.8rem',
              cursor: 'pointer'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          
          {/* Navigation Links - Dynamically toggled for mobile */}
          <div style={{
            display: (isMenuOpen || !isMobile) ? 'flex' : 'none',
            flexDirection: isMobile ? 'column' : 'row',
            position: isMobile ? 'absolute' : 'static',
            top: '65px',
            left: 0,
            width: isMobile ? '100%' : 'auto',
            background: '#000',
            alignItems: 'center',
            gap: '15px',
            padding: isMobile ? '20px 0' : '0',
            borderBottom: isMobile ? '1px solid #C5A059' : 'none'
          }}>
            <Link to="/" style={navLinkStyle} onClick={closeMenu}>Home</Link>
            
            {user ? (
              <>
                {user.role === 'driver' && <Link to="/driver-dashboard" style={goldLinkStyle} onClick={closeMenu}>Driver Portal</Link>}
                {user.role === 'admin' && <Link to="/admin" style={goldLinkStyle} onClick={closeMenu}>Admin Panel</Link>}
                {user.role === 'customer' && <Link to="/dashboard" style={goldLinkStyle} onClick={closeMenu}>My Trips</Link>}
                <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={navLinkStyle} onClick={closeMenu}>Login</Link>
                <Link to="/register" style={navLinkStyle} onClick={closeMenu}>Driver Signup</Link>
                <Link to="/booking" style={bookBtnStyle} onClick={closeMenu}>Book Now</Link>
              </>
            )}
          </div>
        </nav>

        {/* --- MAIN CONTENT & ROUTES --- */}
        <div style={{width: '100%', flex: 1}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refunds" element={<Refunds />} />

            {/* Protected Routes logic preserved */}
            <Route path="/admin" element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/driver-dashboard" element={user && user.role === 'driver' ? <DriverDashboard /> : <Navigate to="/login" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

// Inline Styles
const navLinkStyle = { color: '#fff', textDecoration: 'none', padding: '10px' };
const goldLinkStyle = { ...navLinkStyle, color: '#C5A059', fontWeight: 'bold' };
const logoutBtnStyle = { background: 'transparent', color: '#fff', border: '1px solid #444', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px', marginLeft: '10px' };
const bookBtnStyle = { background: '#C5A059', color: '#000', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' };

export default App;