import React from 'react';
import { FiUser, FiCalendar, FiCreditCard, FiInfo, FiStar, FiX, FiMapPin } from 'react-icons/fi';
import { formatDateTime } from '../../utils/utils';
import './BookingDetailView.css'
const BookingDetailView = ({ booking, onClose, onImageClick }) => {
  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-detail-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER SECTION */}
        <div className="modal-header-v2">
          <div>
            <h2>Booking Audit Trail</h2>
            <span className="booking-id-tag">
              Booking: #{booking.id} • Customer ID: #{booking.customer_id}
            </span>
          </div>
          <button className="close-circle-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body-content">
          {/* PRIMARY INFO GRID */}
          <div className="info-section">
            <div className="info-block">
              <label><FiUser /> Customer Information</label>
              <p className="primary-text">{booking.customer_name}</p>
              <p className="secondary-text">{booking.customer_email || "No Email"}</p>
              <p className="secondary-text">{booking.customer_phone || "No Phone"}</p>
            </div>
            
            <div className="info-block">
              <label><FiCalendar /> Timeline & Status</label>
              <p className="primary-text">{new Date(booking.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })}</p>
              <p className="secondary-text">{booking.completed_at ?new Date(booking.completed_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                }):""}</p>
              <div style={{ marginTop: '8px' }}>
                <span className={`status-tag ${booking.status}`}>{booking.status}</span>
              </div>
            </div>

            <div className="info-block">
              <label><FiCreditCard /> Financials</label>
              <p className="budget-highlight">₹{booking.budget}</p>
              
              <p className="secondary-text"><FiMapPin size={12}/> {booking.location || "On-site"}</p>
            </div>
          </div>

          {/* FEEDBACK & RATING SECTION */}
          {booking.booking_rating && (
            <div className="review-section">
              <label><FiStar /> Customer Feedback</label>
              <div className="review-card">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      fill={i < booking.booking_rating ? "#ffb547" : "none"} 
                      color={i < booking.booking_rating ? "#ffb547" : "#cbd5e1"} 
                    />
                  ))}
                  <span className="rating-number">{booking.booking_rating} / 5</span>
                </div>
                <p className="review-text">"{booking.booking_review || "The customer did not leave a written comment."}"</p>
              </div>
            </div>
          )}

          {/* NOTES SECTION */}
          <div className="description-section">
            <label><FiInfo /> Service Description</label>
            <div className="notes-box">
              {booking.description || "No specific instructions provided for this job."}
            </div>
          </div>

          {/* GALLERY SECTION */}
          <div className="modal-gallery-section">
            <label>Service Evidence / Job Images</label>
            <div className="full-gallery">
              {booking.job_images && booking.job_images.length > 0 ? (
                booking.job_images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="Proof of service" 
                    onClick={() => onImageClick(img)} 
                  />
                ))
              ) : (
                <div className="no-images">No images uploaded for this booking.</div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close Audit</button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailView;