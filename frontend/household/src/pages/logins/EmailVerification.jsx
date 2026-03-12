import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiShield, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { API_URL } from '../../apiConfig';
import './ProfessionalSignUp.css'; 

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code.");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/verify-otp-only`, { email, otp });
      // IMPORTANT: Pass verified email to the next page
      navigate('/customer-signup', { state: { verifiedEmail: email } });
    } catch (err) {
      setError("Invalid or expired code.");
    } finally { setLoading(false); }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box" style={{maxWidth: '450px'}}>
        <div className="pro-form-panel" style={{width: '100%'}}>
          <div className="form-content">
            <Link to="/" className="back-link"><FiArrowLeft /> Home</Link>
            <div className="section-title">
              <h2>{step === 1 ? "Verify Email" : "Check Inbox"}</h2>
              <p>{step === 1 ? "Enter your email to get started." : `Enter the code sent to ${email}`}</p>
            </div>
            {error && <div className="alert-box">{error}</div>}
            <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="pro-form-grid">
              <div className="field-group full-row">
                <div className="custom-input">
                  {step === 1 ? <FiMail className="i" /> : <FiShield className="i" />}
                  <input 
                    type={step === 1 ? "email" : "text"}
                    placeholder={step === 1 ? "name@mail.com" : "000000"}
                    required
                    value={step === 1 ? email : otp}
                    onChange={(e) => step === 1 ? setEmail(e.target.value) : setOtp(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="pro-action-btn" style={{background: '#4f46e5'}} disabled={loading}>
                {loading ? "Please wait..." : step === 1 ? "Send Code" : "Verify Email"} <FiArrowRight />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;