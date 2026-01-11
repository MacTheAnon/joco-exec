import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- API CONFIGURATION ---
const API_BASE = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';

const Login = ({ setUser }) => {
  // We use 'identifier' to capture either Email OR Username
  const [formData, setFormData] = useState({ 
    identifier: '', 
    password: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user types
    if (error) setError('');
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Updated to use dynamic API_BASE
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        // 1. Save Token & User Data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 2. Update Global State
        if (setUser) setUser(data.user); 
        
        // 3. Smart Redirect based on Role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'driver') {
          navigate('/driver-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        <div style={cardStyle}>
          
          {/* Header Section */}
          <div style={headerStyle}>
            <h1 style={logoStyle}>JOCO EXEC</h1>
            <h2 style={titleStyle}>Welcome Back</h2>
            <p style={subtitleStyle}>Sign in to access your dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Username or Email</label>
              <input 
                type="text" 
                name="identifier" 
                placeholder="Enter your username or email" 
                value={formData.identifier}
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Enter your password" 
                value={formData.password}
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={loading ? disabledButtonStyle : buttonStyle}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
            </button>
          </form>

          {/* Footer Links */}
          <div style={footerStyle}>
            <p style={{ color: '#888', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={linkStyle}>
                Create Account
              </Link>
            </p>
            <div style={{ marginTop: '10px' }}>
              <Link to="/" style={secondaryLinkStyle}>
                ← Return Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- FULL PROFESSIONAL STYLING ---

const containerStyle = {
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const overlayStyle = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark overlay for readability
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const cardStyle = {
  background: '#111',
  padding: '40px',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  border: '1px solid #333',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
};

const logoStyle = {
  color: '#C5A059',
  fontSize: '1.8rem',
  letterSpacing: '2px',
  marginBottom: '10px',
  fontFamily: '"Playfair Display", serif',
};

const titleStyle = {
  color: '#fff',
  fontSize: '1.5rem',
  marginBottom: '5px',
  fontWeight: '500',
};

const subtitleStyle = {
  color: '#888',
  fontSize: '0.9rem',
};

const inputGroupStyle = {
  marginBottom: '20px',
};

const labelStyle = {
  display: 'block',
  color: '#C5A059',
  marginBottom: '8px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  background: '#000',
  border: '1px solid #333',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box', // Prevents padding from breaking layout
  transition: 'border-color 0.3s ease',
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  background: '#C5A059',
  color: '#000',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginTop: '10px',
};

const disabledButtonStyle = {
  ...buttonStyle,
  background: '#555',
  color: '#888',
  cursor: 'not-allowed',
};

const errorStyle = {
  background: 'rgba(255, 0, 0, 0.1)',
  border: '1px solid #ff4444',
  color: '#ff4444',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '20px',
  textAlign: 'center',
  fontSize: '0.9rem',
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #222',
};

const linkStyle = {
  color: '#C5A059',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const secondaryLinkStyle = {
  color: '#666',
  textDecoration: 'none',
  fontSize: '0.85rem',
  transition: 'color 0.2s',
};

export default Login;