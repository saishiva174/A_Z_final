import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiLogIn, FiArrowLeft, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

import './ProfessionalSignUp.css'; // Using the same CSS file for consistency
import { API_URL } from '../../apiConfig';

const ProfessionalLogin = () => {
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
      const res = await axios.post(`${API_URL}/api/pro/login`, { identifier, password });
      
      if (res.data.user.role === 'pro') {

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('proId',res.data.user.id)
        navigate('/pro-dashboard');
      } else {
        setError("This account is not registered as a Professional.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box">
        
        {/* Left Branding Panel - Same as Signup */}
        <div className="pro-brand-panel small">
          <div className="brand-inner">
            <Link to="/" className="back-link"><FiArrowLeft /> Home</Link>
            <div className="brand-text">
              <span className="startup-tag">Pro Console</span>
              <h1>Welcome <br/> <span className="blue">Back.</span></h1>
              <p>Log in to manage your bookings, track earnings, and connect with new customers.</p>
              
              <ul className="mini-list">
                <li>• Real-time job alerts</li>
                <li>• Earnings analytics</li>
                <li>• Profile management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="pro-form-panel">
          <div className="form-content">
            <div className="section-title">
              <h2>Partner Login</h2>
              <div className="progress-dots"><span className="active"></span></div>
            </div>

            {error && <div className="alert-box">{error}</div>}

            <form onSubmit={handleLogin} className="pro-form-grid">
              
              <div className="field-group full-row">
                <label className="grid-subheading" style={{border: 'none'}}>Account Identifier</label>
                <div className="custom-input">
                  <FiUser className="i" />
                  <input 
                    type="text" 
                    placeholder="Email or Phone Number" 
                    required 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)} 
                  />
                </div>
              </div>

              <div className="field-group full-row">
                <label className="grid-subheading" style={{border: 'none'}}>Security</label>
                <div className="custom-input">
                  <FiLock className="i" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>

              <button type="submit" className="pro-action-btn" disabled={loading}>
                {loading ? "Authenticating..." : "Access Dashboard"} <FiLogIn />
              </button>
            </form>

            <p className="pro-login-footer">
              New to AZ Pro? <Link to="/pro-signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLogin;