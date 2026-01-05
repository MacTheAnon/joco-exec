import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => { // <--- Added setUser prop
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.token) {
        // 1. SAVE to browser
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 2. UPDATE Global State (Navbar)
        if (setUser) setUser(data.user); 
        
        // 3. REDIRECT based on Role
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'driver') navigate('/driver-dashboard');
        else navigate('/dashboard');
        
      } else if (data.success) {
        alert("Registration Successful! Please Log In.");
        setIsRegistering(false);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Server error. Check if your backend is running on port 5000.");
    }
  };

  return (
    <div style={{minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111'}}>
      <div style={{background: '#000', padding: '40px', border: '1px solid #C5A059', borderRadius: '8px', maxWidth: '400px', width: '100%', color: '#fff'}}>
        <h2 style={{color: '#C5A059', textAlign: 'center'}}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required 
              style={inputStyle} />
          )}
          
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required 
            style={inputStyle} />
          
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
            style={inputStyle} />

          {isRegistering && (
             <div style={{marginBottom: '15px'}}>
               <label style={{marginRight: '10px', color: '#888'}}>I am a:</label>
               <select name="role" onChange={handleChange} style={{padding: '8px', background: '#222', color: '#fff', border: '1px solid #444'}}>
                 <option value="customer">Passenger</option>
                 <option value="driver">Driver</option>
                 <option value="admin">Admin</option>
               </select>
             </div>
          )}

          <button type="submit" style={{width: '100%', padding: '15px', background: '#C5A059', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#000'}}>
            {isRegistering ? 'REGISTER' : 'LOGIN'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '20px', color: '#888', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
        </p>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', background: '#222', border: '1px solid #444', color: '#fff', boxSizing: 'border-box' };

export default Login;