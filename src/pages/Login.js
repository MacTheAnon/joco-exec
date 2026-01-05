import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        // 1. Save credentials
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 2. Update Navbar state
        if (setUser) setUser(data.user); 
        
        // 3. Smart Redirect
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'driver') navigate('/driver-dashboard');
        else navigate('/dashboard');
        
      } else {
        alert(data.error || "Invalid login credentials.");
      }
    } catch (err) {
      alert("Connection error. Ensure your server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{color: '#C5A059', textAlign: 'center', marginBottom: '10px'}}>Welcome Back</h2>
        <p style={{textAlign: 'center', color: '#888', marginBottom: '30px', fontSize: '0.9rem'}}>
          Secure access to your JOCO EXEC account
        </p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            onChange={handleChange} 
            required 
            style={mobileInputStyle} 
          />
          
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            required 
            style={mobileInputStyle} 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{width: '100%', padding: '15px', marginTop: '10px'}}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '25px', fontSize: '0.9rem'}}>
          <span style={{color: '#888'}}>New to JOCO EXEC? </span>
          <Link to="/register" style={{color: '#C5A059', textDecoration: 'none', fontWeight: 'bold'}}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- MOBILE-FIRST STYLES ---
const containerStyle = {
  minHeight: '85vh', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  background: '#000',
  padding: '20px'
};

const cardStyle = {
  background: '#0f0f0f', 
  padding: '40px 30px', 
  border: '1px solid #1a1a1a', 
  borderRadius: '8px', 
  maxWidth: '400px', 
  width: '100%', 
  color: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const mobileInputStyle = { 
  width: '100%', 
  padding: '15px', 
  marginBottom: '20px', 
  background: '#111', 
  border: '1px solid #333', 
  color: '#fff', 
  boxSizing: 'border-box',
  fontSize: '16px', // Critical for Mobile (No zoom)
  borderRadius: '4px'
};

export default Login;