import { useState } from 'react';
import { Link, useNavigate,useLocation} from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiLogIn, FiArrowLeft, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import './ProfessionalSignUp.css'; 
import { API_URL } from '../../apiConfig';

const CustomerLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        identifier,
        password
      });


      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userName', response.data.user.name);
      localStorage.setItem('userId', response.data.user.id);

      
      navigate('/customer-dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email/phone or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box">
        
        {/* Left Branding Panel: Indigo Theme */}
        <div className="pro-brand-panel small" style={{ background: '#4f46e5' }}>
          <div className="brand-inner">
            <Link to="/" className="back-link"><FiArrowLeft /> Home</Link>
            <div className="brand-text">
              <span className="startup-tag" style={{ color: '#c7d2fe' }}>Customer Access</span>
              <h1>Welcome <br/> <span style={{ color: '#fff' }}>Back.</span></h1>
              <p>Log in to manage your bookings and connect with top-rated professionals near you.</p>
              
              <ul className="mini-list">
                <li>• Verify service status</li>
                <li>• Message professionals</li>
                <li>• Safe & Secure payments</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="pro-form-panel">
          <div className="form-content">
            <div className="section-title">
              <h2>Customer Sign In</h2>
              <div className="progress-dots">
                <span className="active" style={{ background: '#4f46e5' }}></span>
                <span></span>
              </div>
            </div>

            {error && <div className="alert-box">{error}</div>}

            <form onSubmit={handleLogin} className="pro-form-grid">
              
              <div className="field-group full-row">
                <label className="grid-subheading">Registered Credentials</label>
                <div className="custom-input">
                  <FiUser className="i" />
                  <input 
                    type="text" 
                    placeholder="Email or Phone Number" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="field-group full-row">
                <label className="grid-subheading">Secure Password</label>
                <div className="custom-input">
                  <FiLock className="i" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <div className="eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </div>
                </div>
              </div>

              <button type="submit" className="pro-action-btn" style={{ background: '#4f46e5' }} disabled={loading}>
                {loading ? "Verifying..." : "Enter Dashboard"} <FiLogIn />
              </button>
            </form>

            <p className="pro-login-footer">
              New to our platform? <Link to="/customer-signup" style={{ color: '#4f46e5' }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;