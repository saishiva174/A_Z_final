import { useState } from 'react';
import { 
  FiX, FiCalendar, FiMapPin, FiDollarSign, 
  FiStar, FiUser, FiImage, FiMaximize2 
} from 'react-icons/fi';

import './BookingDetails.css';
import { formatDateTime } from '../../utils/utils';

const BookingDetails = ({ booking, onClose, review }) => {
  const [selectedImg, setSelectedImg] = useState(null); // State for image popup

  if (!booking) return null;

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section */}
        <div className="details-header">
          <div className="header-left">
            <button className="close-btn" onClick={onClose}><FiX /></button>
            <span className={`status-badge ${booking.status.toLowerCase()}`}>
              {booking.status}
            </span>
          </div>
          {booking.completed_at && (
            <span className="completion-date">
              Done: {formatDateTime(booking.completed_at)}
            </span>
          )}
        </div>

        <div className="details-scroll-content">
          {/* 1. SERVICE INFO */}
          <section className="detail-section">
            <h2 className="service-title">{booking.service_type}</h2>
            <div className="meta-grid">
              <div className="meta-item"><FiCalendar /> {new Date(booking.preferred_time).toLocaleDateString()}</div>
              <div className="meta-item"><FiMapPin /> {booking.location}</div>
              <div className="meta-item"><FiDollarSign /> {booking.budget}</div>
            </div>
            <p className="description-text">{booking.description}</p>
          </section>

          {/* 2. PROFESSIONAL INFO */}
          <section className="detail-section">
            <h3 className="section-label"><FiUser /> Assigned Professional</h3>
            {booking.pro_id ? (
              <div className="pro-profile">
                <img 
                  src={booking.pro_avatar ? booking.pro_avatar : `/uploads/defaults/default_avatar.jpg`} 
                  alt="Pro" 
                  className="pro-img"
                />
                <div className="pro-details">
                  <h4>{booking.pro_name}</h4>
                  <p>{booking.pro_phone}</p>
                </div>
              </div>
            ) : (
              <div className="waiting-box">Waiting for professional assignment...</div>
            )}
          </section>

          {/* 3. JOB PHOTOS with Popup Trigger */}
          {booking.job_images?.length > 0 && (
            <section className="detail-section">
              <h3 className="section-label"><FiImage /> Booking Photos</h3>
              <div className="photo-gallery">
                {booking.job_images.map((url, index) => (
                  <div key={index} className="gallery-item" onClick={() => setSelectedImg(url)}>
                    <img src={url} alt="job-site" />
                    <div className="img-hover-overlay"><FiMaximize2 /></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. REVIEW SECTION - With wrapping logic */}
          {booking.status === 'Reviewed' && (
            <section className="review-display-box">
              <h3 className="section-label">Your Review</h3>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className="star-icon"
                    fill={i < booking.user_rating ? "#FFD700" : "none"}
                    color={i < booking.user_rating ? "#FFD700" : "#CBD5E1"}
                  />
                ))}
              </div>
              {/* Comment goes to next line automatically via CSS word-break */}
              <p className="review-comment">"{booking.user_comment}"</p>
            </section>
          )}
        </div>

        {/* Footer Action */}
        {booking.status === 'Completed' && (
          <div className="details-footer">
            <button className="primary-review-btn" onClick={review}>Write a Review</button>
          </div>
        )}

        {/* IMAGE POPUP MODAL */}
        {selectedImg && (
          <div className="img-zoom-overlay" onClick={() => setSelectedImg(null)}>
            <div className="zoom-container">
              <img src={selectedImg} alt="Zoomed View" />
              <button className="close-zoom"><FiX /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;