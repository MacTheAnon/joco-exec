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
      // Use Environment Variable
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (formData.role === 'driver') {
          alert("Registration Successful! Your chauffeur account is now PENDING APPROVAL. You will be notified once an admin activates your account.");
          navigate('/login');
        } else {
          alert("Account created successfully!");
          if (data.user && data.token) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            setUser(data.user);
            navigate('/dashboard');
          }
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
    <div className="section-container" style={{ maxWidth: '450px' }}>
      <h2 style={{ marginBottom: '10px' }}>Join the Fleet</h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>Create an account to book trips or join our chauffeur team.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          className="input-field"
          style={mobileInput}
          name="name" 
          type="text" 
          placeholder="Full Name" 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          className="input-field"
          style={mobileInput}
          name="email" 
          type="email" 
          placeholder="Email Address" 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          className="input-field"
          style={mobileInput}
          name="password" 
          type="password" 
          placeholder="Create Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
        />
        
        <div style={{ textAlign: 'left' }}>
          <label style={{ color: '#888', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
            Registering as:
          </label>
          <select 
            style={mobileInput}
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})}
          >
            <option value="driver">Chauffeur / Driver</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        
        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>
      </form>
    </div>
  );
};

const mobileInput = { 
  padding: '14px', 
  background: '#111', 
  border: '1px solid #333', 
  color: '#fff', 
  borderRadius: '4px', 
  width: '100%', 
  boxSizing: 'border-box',
  fontSize: '16px' 
};

export default Register;