import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiShield, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { API_URL } from '../../apiConfig';
import './EmailVerification.css'; 

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
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
      navigate('/customer-signup', { state: { verifiedEmail: email } });
    } catch (err) {
      setError("Invalid or expired code.");
    } finally { setLoading(false); }
  };

  return (
    <div className="v-page-wrapper">
      <div className="v-card">
        {/* Header Section */}
        <div className="v-header">
          <Link to="/" className="v-back-home">
            <FiArrowLeft /> Back
          </Link>
          <div className="v-icon-container">
            {step === 1 ? <FiMail /> : <FiShield />}
          </div>
          <h2>{step === 1 ? "Verify Email" : "Check Inbox"}</h2>
          <p>
            {step === 1 
              ? "Join A-Z Services. Enter your email to receive a secure code." 
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {error && <div className="v-error-banner">{error}</div>}

        <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="v-form-stack">
          <div className="v-input-group">
            <input 
              type={step === 1 ? "email" : "text"}
              placeholder={step === 1 ? "Enter your email" : "Enter 6-digit code"}
              required
              autoFocus
              value={step === 1 ? email : otp}
              onChange={(e) => step === 1 ? setEmail(e.target.value) : setOtp(e.target.value)}
              className="v-main-input"
            />
          </div>

          <button type="submit" className="v-primary-btn" disabled={loading}>
            {loading ? "Processing..." : step === 1 ? "Send Verification Code" : "Verify & Continue"} 
            {!loading && <FiArrowRight />}
          </button>
        </form>

        {step === 2 && (
          <div className="v-footer-actions">
            <p>Didn't get the code?</p>
            <button onClick={handleSendOTP} disabled={loading} className="v-text-btn">
              Resend Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;