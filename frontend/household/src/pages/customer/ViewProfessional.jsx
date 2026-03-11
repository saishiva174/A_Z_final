import  { useState, useEffect } from 'react';
import {  FiMapPin, FiStar, FiChevronLeft,FiCamera} from 'react-icons/fi';
import axios from 'axios';
import './viewProfessional.css';
import { API_URL } from '../../apiConfig';

const ViewProfessional = ({ proId, onBack }) => {

  const [loading,setLoading]=useState(true);
  const [details, setDetails] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(()=>{
  fetchProProfile(proId);
},[proId])


// Function to add new images to the existing list
const handleFileChange = (e) => {
  const newlySelected = Array.from(e.target.files);
  setSelectedFiles((prevFiles) => [...prevFiles, ...newlySelected]);
};

// Function to remove a specific image
const removeImage = (indexToRemove) => {
  setSelectedFiles((prevFiles) =>     prevFiles.filter((_, index) => index !== indexToRemove)
  );
};

 const fetchProProfile = async (proId) => {
    try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/pro/profile/${proId}`);
        const data = response.data;
          
         
        const professional = {
            id: data.id,
            name: data.name,
            location: data.location || "Location not set",
            phone_number: data.phone_number || "",
            profile_pic_url: data.profile_pic_url || "",
            bio: data.bio,
            rate: data.rate,
            avg_rating: data.rating,
            email:data.email,
            reviews: data.reviews || [] 
        };

        setDetails(professional);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
    }
};

const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('customer_id', localStorage.getItem('userId'));
  formData.append('pro_id', proId);
  formData.append('service_type', bookingData.problemName);
  formData.append('description', bookingData.description);
  formData.append('location', bookingData.location);
  formData.append('preferred_time', bookingData.preferredTime);
  formData.append('budget', details.rate);

  // Append multiple images
  selectedFiles.forEach(file => {
    formData.append('problem_images', file);
  });

  try {
    await axios.post(`${API_URL}/api/users/book-job`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert("Booking Request Sent!");
    setShowBookingForm(false);
  } catch (err) {
    console.error(err);
    alert("Error sending request");
  }
};
  

  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    problemName: '',
    description: '',
    location: '',
    preferredTime: '',
    budget: ''
  });

 

  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loader"></div> 
        <p>Loading Professional details...</p>
      </div>
    );
  }

  return (
    <div className="view-container">
      <button className="back-btn" onClick={onBack}><FiChevronLeft /> Back to Browse</button>

      <div className="profile-card">
        <div className="profile-main-info">
          <img src={details.profile_pic_url?details.profile_pic_url : `https://ui-avatars.com/api/?name=${details.name}`} alt="Pro" />
          <div className="info-text">
            <h1>{details.name}</h1>
            <span className="category-pill">{details.phone_number}</span>
            <div className="meta-row">
              <span><FiStar className="star-icon" />{`${details.avg_rating}(${details.reviews.length})`}</span>
              <span>{details.email}</span>
              <span><FiMapPin /> {details.location}</span>
            </div>
            <p className="bio-text">{details.bio}</p>
          </div>
          <div className="price-box">
            <p>Starting from</p>
            <h2>₹{details.rate}</h2>
            <button className="book-trigger-btn" onClick={() => setShowBookingForm(true)}>Book Now</button>
          </div>
        </div>
      </div>
<div className="reviews-grid">
  <h3>What customers say</h3>
  {details.reviews.map(rev => (
    <div key={rev.id} className="review-item">
      <div className="rev-header">
        <strong>{rev.customer_name}</strong>
        {/* Added Math.max to prevent errors if rating is null/0 */}
        <span>{"★".repeat(Math.max(0, rev.rating))}</span>
      </div>
      <p>"{rev.comment}"</p>
    </div>
  ))}
</div>
      {/* BOOKING MODAL */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="booking-modal animate-pop">
            <div className="modal-header">
              <h2>Create Booking Request</h2>
              <p>Sent to: {details.name}</p>
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-row">
                <label>Problem Title</label>
                <input type="text" placeholder="e.g. Short circuit in kitchen" required 
                  onChange={e => setBookingData({...bookingData, problemName: e.target.value})} />
              </div>
              <div className="form-row">
                <label>Detailed Description</label>
                <textarea placeholder="Tell the professional exactly what's wrong..." required
                  onChange={e => setBookingData({...bookingData, description: e.target.value})} />
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>Preferred Date & Time</label>
                  <input type="datetime-local" required 
                    onChange={e => setBookingData({...bookingData, preferredTime: e.target.value})} />
                </div>
                <div className="form-row">
                  <label>Your Service Address</label>
                  <input type="text" placeholder="House no, Street..." required 
                    onChange={e => setBookingData({...bookingData, location: e.target.value})} />
                </div>
                <div className="form-row">
  <label>Upload Problem Photos (Optional)</label>
  <div className="upload-box">
  <input 
    type="file" 
    multiple 
    accept="image/*" 
    onChange={handleFileChange} // Use the new append function
    id="file-upload"
    hidden
  />
  <label htmlFor="file-upload" className="file-label">
    <FiCamera /> Add Photos
  </label>
  
  <div className="preview-thumbnails">
    {selectedFiles.map((file, idx) => (
      <div key={idx} className="thumb-container">
        <img src={URL.createObjectURL(file)} alt="preview" className="thumb" />
        {/* Remove Button */}
        <button 
          type="button" 
          className="remove-thumb" 
          onClick={() => removeImage(idx)}
        >
          &times;
        </button>
      </div>
    ))}
  </div>
</div>
</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowBookingForm(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Confirm Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfessional;