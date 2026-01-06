import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    email: '', 
    password: '', 
    role: 'customer' // Default role
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle Input Changes
  const handleChange = (e) => {
    // Handle Checkbox logic for Driver role
    if (e.target.name === 'isDriver') {
        setFormData({ ...formData, role: e.target.checked ? 'driver' : 'customer' });
    } else {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    // Clear error when typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // UPDATED IP ADDRESS: 192.168.1.12
      const res = await fetch('http://192.168.1.12:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Account created successfully! Please log in.");
        navigate('/login');
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Ensure your server is running.");
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
            <h2 style={titleStyle}>Create Account</h2>
            <p style={subtitleStyle}>Join our premium transportation network</p>
          </div>

          {/* Error Message */}
          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="John Doe" 
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>

            {/* Username (NEW) */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Username</label>
              <input 
                type="text" 
                name="username" 
                placeholder="Choose a username" 
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>

            {/* Email */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="name@example.com" 
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>

            {/* Password */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Create a strong password" 
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>

            {/* Driver Role Checkbox */}
            <div style={checkboxContainerStyle}>
              <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#fff' }}>
                <input 
                  type="checkbox" 
                  name="isDriver" 
                  onChange={handleChange} 
                  style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: '#C5A059' }} 
                />
                Register as a Chauffeur / Driver
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={loading ? disabledButtonStyle : buttonStyle}
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
          </form>

          {/* Footer Links */}
          <div style={footerStyle}>
            <p style={{ color: '#888', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={linkStyle}>
                Log In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- PROFESSIONAL STYLES (Matches Login.js) ---

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
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px', // Added padding for scrollability on small screens
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

const headerStyle = { textAlign: 'center', marginBottom: '30px' };
const logoStyle = { color: '#C5A059', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '10px', fontFamily: '"Playfair Display", serif' };
const titleStyle = { color: '#fff', fontSize: '1.5rem', marginBottom: '5px', fontWeight: '500' };
const subtitleStyle = { color: '#888', fontSize: '0.9rem' };

const inputGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', color: '#C5A059', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' };

const inputStyle = {
  width: '100%',
  padding: '14px',
  background: '#000',
  border: '1px solid #333',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.3s ease',
};

const checkboxContainerStyle = {
  background: '#1a1a1a',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #333',
  marginBottom: '20px'
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
};

const disabledButtonStyle = { ...buttonStyle, background: '#555', color: '#888', cursor: 'not-allowed' };

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

const footerStyle = { textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #222' };
const linkStyle = { color: '#C5A059', textDecoration: 'none', fontWeight: 'bold' };

export default Register;