import  { useState, useEffect } from 'react';
import {  FiMapPin, FiStar, FiChevronLeft,FiCamera} from 'react-icons/fi';
import axios from 'axios';

import './viewProfessional.css';
import { API_URL } from '../../apiConfig';
import { useParams, useNavigate } from 'react-router-dom';
const ViewProfessional = () => {
  const { proId } = useParams();
  const navigate = useNavigate();
  const [loading,setLoading]=useState(true);
  const [details, setDetails] = useState(null);
  

  useEffect(()=>{
  fetchProProfile(proId);
},[proId])


// Function to add new images to the existing list


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
      <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /> Back to Browse</button>

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
            <button 
      className="book-trigger-btn" 
      onClick={() => navigate(`/book/${proId}`)}
    >
      Book Now
    </button>
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
     
    </div>
  );
};

export default ViewProfessional;