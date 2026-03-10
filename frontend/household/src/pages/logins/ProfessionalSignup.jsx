import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight, 
  FiArrowLeft, FiFileText, FiMapPin, FiPhone, FiEye, FiEyeOff 
} from 'react-icons/fi';
import './ProfessionalSignUp.css';
import { API_URL } from '../../apiConfig';

const ProfessionalSignup = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone_number: '', service: '', location: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isListOpen, setIsListOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const services = [
    "AC Repair", "Appliance Repair", "Carpentry", "Cleaning & Sanitization", 
    "CCTV & Security", "Electrical Work", "Flooring & Tiling", "Gardening",
    "Home Automation", "Interior Design", "Masonry", "Painting", 
    "Packers & Movers", "Pest Control", "Plumbing", "Roofing", 
    "Solar Installation", "Wallpaper Decor", "Waterproofing", "Window Work"
  ].sort();

  useEffect(() => {
    const handleClick = (e) => { 
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone_number.length !== 10) return setError("Enter a valid 10-digit phone number.");
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('role', 'pro');
      data.append('document', documentFile);
      await axios.post(`${API_URL}/api/pro/register`, data);
      navigate('/pro-login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="pro-signup-canvas">
      <div className="pro-signup-box">
        
        {/* Left Branding Panel */}
        <div className="pro-brand-panel small">
          <div className="brand-inner">
            <Link to="/" className="back-link"><FiArrowLeft /> Back</Link>
            <div className="brand-text">
              <span className="startup-tag">AZ Pro</span>
              <h1>Work for <br/> <span className="blue">Yourself.</span></h1>
              <p>The simplest way to find local jobs and grow your client base without the high fees.</p>
              
              <ul className="mini-list">
                <li>• No middleman cuts</li>
                <li>• Instant payouts</li>
                <li>• 100% transparent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="pro-form-panel">
          <div className="form-content">
            <div className="section-title">
              <h2>Partner Registration</h2>
              <div className="progress-dots"><span className="active"></span><span></span></div>
            </div>

            {error && <div className="alert-box">{error}</div>}

            <form onSubmit={handleSubmit} className="pro-form-grid">
              
              <h4 className="grid-subheading">Personal Details</h4>
              <div className="field-group">
                <div className="custom-input">
                  <FiUser className="i" />
                  <input type="text" placeholder="Full Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="field-group">
                <div className="custom-input">
                  <FiMail className="i" />
                  <input type="email" placeholder="Work Email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <h4 className="grid-subheading">Business Information</h4>
              <div className="field-group">
                <div className="custom-input">
                  <FiPhone className="i" />
                  <input type="tel" maxLength={10} placeholder="Mobile Number" required value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>
              </div>

              {/* PROFESSION DROPDOWN SECTION */}
              <div className="field-group" ref={dropdownRef}>
                <div className="custom-input">
                  <FiBriefcase className="i" />
                  <input 
                    type="text" 
                    placeholder="Search Profession..." 
                    value={searchTerm || formData.service} 
                    onFocus={() => setIsListOpen(true)}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsListOpen(true); }} 
                  />
                  {isListOpen && (
                    <div className="custom-dropdown">
                      {services
                        .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((s, i) => (
                          <div 
                            key={i} 
                            className="drop-item" 
                            onClick={() => { 
                              setFormData({...formData, service: s}); 
                              setSearchTerm(s); 
                              setIsListOpen(false); 
                            }}
                          >
                            {s}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="field-group">
                <div className="custom-input">
                  <FiMapPin className="i" />
                  <input type="text" placeholder="Operating City" required onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div className="field-group">
                <label className="file-label">
                  <FiFileText />
                  <span>{documentFile ? documentFile.name.slice(0,12)+'...' : 'Upload ID Proof'}</span>
                  <input type="file" hidden required onChange={(e) => setDocumentFile(e.target.files[0])} />
                </label>
              </div>

              <h4 className="grid-subheading">Security</h4>
              <div className="field-group full-row">
                <div className="custom-input">
                  <FiLock className="i" />
                  <input type={showPassword ? "text" : "password"} placeholder="Set Password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <span className="eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</span>
                </div>
              </div>

              <button type="submit" className="pro-action-btn" disabled={loading}>
                {loading ? "Verifying..." : "Join the Network"} <FiArrowRight />
              </button>
            </form>

            <p className="pro-login-footer">
              Already a partner? <Link to="/pro-login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSignup;