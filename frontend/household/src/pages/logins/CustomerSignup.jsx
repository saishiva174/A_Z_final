import { useState, useEffect } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios';
import { 
  FiUser, FiMail, FiLock, FiArrowRight, 
  FiArrowLeft, FiPhone, FiEye, FiEyeOff 
} from 'react-icons/fi';

import './ProfessionalSignUp.css';
import { API_URL } from '../../apiConfig';

const CustomerSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const verifiedEmail = location.state?.verifiedEmail;

  useEffect(() => {
    if (!verifiedEmail) {
      navigate('/verify-email');
    }
  }, [verifiedEmail, navigate]);

  const [formData, setFormData] = useState({ 
    name: '', 
    email: verifiedEmail || '', 
    password: '', 
    phone_number: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation to match backend requirements
    if (formData.phone_number.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError('');

    try {
     
      const res = await axios.post(`${API_URL}/api/users/register`, {
        name: formData.name,
        email: verifiedEmail, // Use verifiedEmail directly to ensure it wasn't tampered with
        password: formData.password,
        phone_number: formData.phone_number,
        role: 'customer' 
      });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      localStorage.setItem('role', 'customer');
      
      
      navigate('/customer-dashboard'); 
      
    } catch (err) {
      
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box">
        
        <div className="pro-brand-panel small" style={{background: '#4f46e5'}}>
          <div className="brand-inner">
            <Link to="/verify-email" className="back-link"><FiArrowLeft /> Back</Link>
            <div className="brand-text">
              <span className="startup-tag" style={{color: '#c7d2fe'}}>Final Step</span>
              <h1>Almost <br/> <span className="blue" style={{color: '#fff'}}>There.</span></h1>
              <p>Complete your profile to start booking verified professionals.</p>
            </div>
          </div>
        </div>

        <div className="pro-form-panel">
          <div className="form-content">
            <div className="section-title">
              <h2>Account Details</h2>
              <div className="progress-dots"><span className="active" style={{background: '#4f46e5'}}></span></div>
            </div>

            {error && <div className="alert-box">{error}</div>}

            <form onSubmit={handleSubmit} className="pro-form-grid">
              
              {/* Email - READ ONLY */}
              <div className="field-group full-row">
                <label className="grid-subheading">Email (Verified)</label>
                <div className="custom-input">
                  <FiMail className="i" />
                  <input 
                    type="email" 
                    value={verifiedEmail || ''} 
                    readOnly 
                    style={{background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="field-group full-row">
                <label className="grid-subheading">Full Name</label>
                <div className="custom-input">
                  <FiUser className="i" />
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    required 
                    autoFocus
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="field-group">
                <label className="grid-subheading">Phone</label>
                <div className="custom-input">
                  <FiPhone className="i" />
                  <input 
                    type="tel" 
                    maxLength={10} 
                    placeholder="10-digit number" 
                    required 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value.replace(/[^0-9]/g, '')})} 
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="grid-subheading">Password</label>
                <div className="custom-input">
                  <FiLock className="i" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min. 8 characters" 
                    required 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                  <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>

              <button type="submit" className="pro-action-btn" style={{background: '#4f46e5'}} disabled={loading}>
                {loading ? "Creating Account..." : "Complete Signup"} <FiArrowRight />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;