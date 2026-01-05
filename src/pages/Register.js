import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'driver' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account created successfully!");
        // Optional: Auto-login after registration
        if (data.user && data.token) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          setUser(data.user);
          navigate(data.user.role === 'driver' ? '/driver-dashboard' : '/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '100px 20px', maxWidth: '400px', margin: '0 auto', color: '#fff', textAlign: 'center' }}>
      <h2 style={{ color: '#C5A059', marginBottom: '30px' }}>Join the Fleet</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input style={inputStyle} type="text" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input style={inputStyle} type="email" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input style={inputStyle} type="password" placeholder="Create Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        
        <label style={{ textAlign: 'left', color: '#888', fontSize: '0.9rem' }}>Account Type:</label>
        <select style={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="driver">Chauffeur / Driver</option>
          <option value="customer">Customer</option>
          <option value="admin">Administrator</option>
        </select>
        
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "CREATING ACCOUNT..." : "REGISTER"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px' };
const buttonStyle = { background: '#C5A059', color: '#000', padding: '15px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' };

export default Register;