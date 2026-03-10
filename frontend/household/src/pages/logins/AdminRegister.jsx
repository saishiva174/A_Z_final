import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminRegister.css';
import '../Home.css';
import { API_URL } from '../../apiConfig';

const AdminRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(''); // New state for error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error when user starts typing again
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/register`, formData);
      setError(''); // Clear any previous errors
      alert("Registration Successful!");
      navigate('/admin-login');
     
    } catch (err) {
      // Check if the backend sent a specific error message
      if (err.response && err.response.data) {
        setError(err.response.data.message); // Sets "This email is already registered."
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="admin-reg-container">
      <div className="admin-info-side">
        <Link to="/" style={{color: 'white', textDecoration: 'none', marginBottom: '40px', fontSize: '14px'}}>← Back</Link>
        <h2>Admin Console</h2>
        <p>Security is our priority. Register your official work credentials.</p>
      </div>

      <div className="admin-form-side">
        <div className="reg-card">
          <h3>Create Admin Account</h3>
          
          {/* Professional Error Message Box */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #fee2e2',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>FULL NAME</label>
              <input type="text" name="name" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>WORK EMAIL</label>
              <input type="email" name="email" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>PASSWORD</label>
              <input type="password" name="password" onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-btn">Initialize Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;