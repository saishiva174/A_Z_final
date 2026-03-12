

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCamera, FiChevronLeft, FiX } from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../../apiConfig';
import './BookingPage.css'

const BookingPage = () => {
  const { proId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);
  const [proDetails, setProDetails] = useState({ name: "Loading...", rate: 0 });
  const [bookingData, setBookingData] = useState({
    problemName: '',
    description: '',
    location: '',
    preferredTime: '',
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/pro/profile/${proId}`)
      .then(res => {
        setProDetails({ name: res.data.name, rate: res.data.rate });
      })
      .catch(err => console.error("Error fetching pro details:", err));
  }, [proId]);

  const handleFileChange = (e) => {
    const newlySelected = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newlySelected]);
    e.target.value = null; 
  };

  const removeFile = (e, index) => {
    e.stopPropagation();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('customer_id', localStorage.getItem('userId'));
    formData.append('pro_id', proId);
    formData.append('service_type', bookingData.problemName);
    formData.append('description', bookingData.description);
    formData.append('location', bookingData.location);
    formData.append('preferred_time', bookingData.preferredTime);
    formData.append('budget', proDetails.rate);

    selectedFiles.forEach(file => formData.append('problem_images', file));

    try {
      await axios.post(`${API_URL}/api/users/book-job`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Booking Request Sent!");
      navigate('/customer-dashboard');
    } catch (err) {
      alert("Error sending request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tab-view animate-slide-in">
      <header className="view-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft /> Back
        </button>
        <h1>Booking Request</h1>
        <p>Booking with <strong>{proDetails.name}</strong></p>
      </header>

      <div className="profile-settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="input-grid">
            
            <div className="form-input full">
              <label>Problem Title</label>
              <input 
                type="text" 
                placeholder="e.g., Leaking Kitchen Pipe "
                required 
                onChange={e => setBookingData({...bookingData, problemName: e.target.value})} 
              />
            </div>

            <div className="form-input full">
              <label>Description</label>
              <textarea 
                placeholder="Describe the issue in detail..."
                required 
                onChange={e => setBookingData({...bookingData, description: e.target.value})} 
              />
            </div>

            <div className="form-input">
              <label>Preferred Time</label>
              <input 
                type="datetime-local" 
                required 
                onChange={e => setBookingData({...bookingData, preferredTime: e.target.value})} 
              />
            </div>

            <div className="form-input">
              <label>Service Address</label>
              <input 
                type="text" 
                placeholder="Flat No, Building Name, Street, Landmark"
                required 
                onChange={e => setBookingData({...bookingData, location: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-input full" style={{ marginTop: '1.5rem' }}>
            <label>Add Photos</label>
            <div className="upload-box">
               <input type="file" multiple accept="image/*" onChange={handleFileChange} id="file-up" hidden />
               <label htmlFor="file-up" className="file-label"><FiCamera /> Capture or Upload</label>
               
               <div className="preview-thumbnails">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="thumb-container" onClick={() => setZoomImage(URL.createObjectURL(file))}>
                    <img src={URL.createObjectURL(file)} className="thumb" alt="preview" />
                    <button type="button" className="remove-icon-corner" onClick={(e) => removeFile(e, i)}>
                      <FiX />
                    </button>
                  </div>
                ))}
               </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="loader-container">
                  <div className="btn-loader"></div>
                  <span>Processing...</span>
                </div>
              ) : "Confirm Booking Request"}
            </button>
          </div>
        </form>
      </div>

      {zoomImage && (
        <div className="img-zoom-overlay" onClick={() => setZoomImage(null)}>
          <div className="zoom-container">
            <img src={zoomImage} alt="Zoomed View" />
            <button className="close-zoom"><FiX /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;