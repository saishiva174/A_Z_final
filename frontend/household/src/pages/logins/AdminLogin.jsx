import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiLock, FiMail } from 'react-icons/fi'; // Icons for better UX
import './AdminRegister.css'; 
import { API_URL } from '../../apiConfig';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { email, password });

      localStorage.setItem('token', response.data.token); 
      localStorage.setItem('adminName', response.data.user.name);
      localStorage.setItem('role', response.data.user.role);
      
      navigate('/admin-dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-reg-container">
      {/* LEFT SIDE: DESKTOP ONLY BRANDING */}
      <div className="admin-info-side">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Website
        </Link>
        <div className="info-content">
          <h2>Admin Console</h2>
          <p>Secure access for managing professionals, customers, and platform transactions.</p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="admin-form-side">
        <div className="reg-card">
          <div className="form-header">
            <h3>Welcome Back</h3>
            <p>Please log in to your account</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label><FiMail /> WORK EMAIL</label>
              <input 
                type="email" 
                placeholder="admin@services.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="input-group">
              <label><FiLock /> PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Verifying..." : "Login to Console"}
            </button>

            <div className="form-footer">
              Don't have an account? <Link to="/register-admin">Register here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;