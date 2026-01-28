import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- API CONFIGURATION ---
const API_BASE = process.env.REACT_APP_API_URL || 'https://www.jocoexec.com';

const Register = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    email: '', 
    phone: '', // ✅ Added Phone to state
    password: '', 
    companyName: '', 
    role: 'customer' 
  });
  
  const [isCorporate, setIsCorporate] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- HANDLERS ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleChange = (type) => {
    if (type === 'corporate') {
        const newState = !isCorporate;
        setIsCorporate(newState);
        setIsDriver(false);
        setFormData({ 
            ...formData, 
            role: newState ? 'corporate' : 'customer',
            companyName: newState ? formData.companyName : ''
        });
    } else if (type === 'driver') {
        const newState = !isDriver;
        setIsDriver(newState);
        setIsCorporate(false);
        setFormData({ 
            ...formData, 
            role: newState ? 'driver' : 'customer',
            companyName: '' 
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
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

  // --- RENDER ---
  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        <div style={cardStyle}>
          
          {/* HEADER */}
          <div style={headerStyle}>
            <h1 style={logoStyle}>JOCO EXEC</h1>
            <h2 style={titleStyle}>Create Account</h2>
            <p style={subtitleStyle}>Join our premium transportation network</p>
          </div>

          {/* ERROR MESSAGE */}
          {error && <div style={errorStyle}>{error}</div>}

          {/* FORM */}
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

            {/* Username */}
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

            {/* Company Name (CONDITIONAL) */}
            {isCorporate && (
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Company Name</label>
                    <input 
                        type="text" 
                        name="companyName" 
                        placeholder="Business Name LLC" 
                        onChange={handleChange} 
                        required 
                        style={inputStyle} 
                    />
                </div>
            )}

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

            {/* ✅ ADDED: Phone Number Input */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="+1 (913) 555-0199" 
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

            {/* ACCOUNT TYPE TOGGLES */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                <div 
                    onClick={() => handleRoleChange('corporate')}
                    style={isCorporate ? activeToggleStyle : inactiveToggleStyle}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '5px' }}>🏢</span>
                    Corporate
                </div>
                <div 
                    onClick={() => handleRoleChange('driver')}
                    style={isDriver ? activeToggleStyle : inactiveToggleStyle}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '5px' }}>🚘</span>
                    Driver
                </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading} 
              style={loading ? disabledButtonStyle : buttonStyle}
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
          </form>

          {/* FOOTER */}
          <div style={footerStyle}>
            <p style={{ color: '#888', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={linkStyle}>Log In</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- PROFESSIONAL STYLES ---

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
  padding: '40px 20px',
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

// Toggle Button Styles
const inactiveToggleStyle = { 
    flex: 1, 
    padding: '15px', 
    background: '#1a1a1a', 
    border: '1px solid #333', 
    borderRadius: '8px', 
    color: '#888', 
    textAlign: 'center', 
    cursor: 'pointer', 
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
};

const activeToggleStyle = { 
    ...inactiveToggleStyle, 
    background: '#C5A059', 
    color: '#000', 
    fontWeight: 'bold', 
    borderColor: '#C5A059',
    transform: 'scale(1.02)'
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