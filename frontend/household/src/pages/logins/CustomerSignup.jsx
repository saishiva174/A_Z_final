import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, FiMail, FiLock, FiArrowRight, 
  FiArrowLeft, FiPhone, FiEye, FiEyeOff, FiSmile 
} from 'react-icons/fi';

 import './ProfessionalSignUp.css'; // Using the same unified CSS
import { API_URL } from '../../apiConfig';

const CustomerSignup = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone_number: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone_number.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/users/register`, {
        ...formData,
        role: 'customer'
      });
      navigate('/customer-login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box">
        
        {/* Left Panel: Customer Branding */}
        <div className="pro-brand-panel small" style={{background: '#4f46e5'}}> {/* Purplish-blue for customers */}
          <div className="brand-inner">
            <Link to="/" className="back-link"><FiArrowLeft /> Home</Link>
            <div className="brand-text">
              <span className="startup-tag" style={{color: '#c7d2fe'}}>Community</span>
              <h1>Expert help, <br/> <span className="blue" style={{color: '#fff'}}>Simplified.</span></h1>
              <p>Book verified professionals for your home in seconds. No stress, just great service.</p>
              
              <ul className="mini-list">
                <li>• Verified Local Experts</li>
                <li>• Transparent Pricing</li>
                <li>• 24/7 Support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="pro-form-panel">
          <div className="form-content">
            <div className="section-title">
              <h2>Create Account</h2>
              <div className="progress-dots"><span className="active" style={{background: '#4f46e5'}}></span></div>
            </div>

            {error && <div className="alert-box">{error}</div>}

            <form onSubmit={handleSubmit} className="pro-form-grid">
              
              <div className="field-group full-row">
                <label className="grid-subheading">Full Name</label>
                <div className="custom-input">
                  <FiUser className="i" />
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    required 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="grid-subheading">Email</label>
                <div className="custom-input">
                  <FiMail className="i" />
                  <input 
                    type="email" 
                    placeholder="name@mail.com" 
                    required 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

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

              <div className="field-group full-row">
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
                {loading ? "Creating..." : "Get Started"} <FiArrowRight />
              </button>
            </form>

            <p className="pro-login-footer">
              Already have an account? <Link to="/customer-login" style={{color: '#4f46e5'}}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;