import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, FiMail, FiLock, FiArrowRight, 
  FiArrowLeft, FiPhone, FiEye, FiEyeOff, FiShield 
} from 'react-icons/fi';

import './ProfessionalSignUp.css';
import { API_URL } from '../../apiConfig';

const CustomerSignup = () => {
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone_number: '' 
  });
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { email: formData.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/verify-otp-only`, { 
        email: formData.email, 
        otp 
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Code.");
    } finally {
      setLoading(false);
    }
  };


  const handleFinalSignup = async (e) => {
    e.preventDefault();
    if (formData.phone_number.length !== 10) return setError("10-digit phone required.");
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/complete-signup`, {
        ...formData,
        role: 'customer'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'customer');
      navigate('/customer-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box">
        {/* Left Branding Panel (Remains Constant) */}
        <div className="pro-brand-panel small" style={{background: '#4f46e5'}}>
          <div className="brand-inner">
            <Link to="/" className="back-link"><FiArrowLeft /> Home</Link>
            <div className="brand-text">
              <h1>{step === 1 ? "Verify Email" : step === 2 ? "Enter Code" : "Final Details"}</h1>
              <p>Step {step} of 3</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel (Dynamic based on Step) */}
        <div className="pro-form-panel">
          <div className="form-content">
            
            {error && <div className="alert-box">{error}</div>}

            {/* VIEW 1: EMAIL INPUT */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="pro-form-grid">
                <div className="field-group full-row">
                  <label className="grid-subheading">Enter your Email</label>
                  <div className="custom-input">
                    <FiMail className="i" />
                    <input 
                      type="email" 
                      placeholder="name@mail.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>
                <button type="submit" className="pro-action-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"} <FiArrowRight />
                </button>
              </form>
            )}

            {/* VIEW 2: OTP INPUT */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="pro-form-grid">
                <div className="field-group full-row">
                  <label className="grid-subheading">Verification Code</label>
                  <div className="custom-input">
                    <FiShield className="i" />
                    <input 
                      type="text" 
                      placeholder="000000" 
                      maxLength={6}
                      required 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)} 
                    />
                  </div>
                </div>
                <button type="submit" className="pro-action-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Confirm Code"} <FiArrowRight />
                </button>
                <button type="button" onClick={() => setStep(1)} className="back-link">Change Email</button>
              </form>
            )}

            {/* VIEW 3: FULL DETAILS */}
            {step === 3 && (
              <form onSubmit={handleFinalSignup} className="pro-form-grid">
                <div className="field-group full-row">
                  <label className="grid-subheading">Full Name</label>
                  <div className="custom-input">
                    <FiUser className="i" />
                    <input type="text" placeholder="John Doe" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                <div className="field-group">
                  <label className="grid-subheading">Phone</label>
                  <div className="custom-input">
                    <FiPhone className="i" />
                    <input type="tel" maxLength={10} placeholder="Phone number" required onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                  </div>
                </div>

                <div className="field-group">
                  <label className="grid-subheading">Password</label>
                  <div className="custom-input">
                    <FiLock className="i" />
                    <input type={showPassword ? "text" : "password"} placeholder="Min 8 chars" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="pro-action-btn" disabled={loading}>
                  {loading ? "Creating Account..." : "Complete Signup"} <FiArrowRight />
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;