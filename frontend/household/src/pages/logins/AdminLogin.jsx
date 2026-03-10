import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminRegister.css'; 
import { API_URL } from '../../apiConfig';

const AdminLogin = () => {
  // 1. State for inputs and error handling
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // 2. Handle Login Submission
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { email, password });

      // 1. Store the TOKEN (This is the most important part)
      localStorage.setItem('token', response.data.token); 
      localStorage.setItem('adminName', response.data.user.name);
      localStorage.setItem('role', response.data.user.role);
      
      // 2. Use { replace: true } to clear the login page from history
      navigate('/admin-dashboard', { replace: true });
      
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
};

  return (
    <div className="admin-reg-container">
      <div className="admin-info-side">
        <Link to="/" style={{color: 'white', textDecoration: 'none', marginBottom: '40px', fontSize: '14px', display: 'block'}}>← Back</Link>
        <h2>Admin Login</h2>
        <p>Enter your credentials to access the management console.</p>
      </div>

      <div className="admin-form-side">
        <div className="reg-card">
          <h3>Welcome Back</h3>

          {/* Error Message Display */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'center',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>WORK EMAIL</label>
              <input 
                type="email" 
                placeholder="admin@azservices.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="input-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="submit-btn">Login to Console</button>
            <p style={{marginTop: '20px', fontSize: '13px', color: '#64748b'}}>
              ${"Don't have an account?"}` <Link to="/register-admin">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;