import React from 'react';
import { FiUser, FiCalendar, FiCreditCard, FiInfo, FiStar, FiX, FiMapPin, FiClock } from 'react-icons/fi';
import './BookingDetailView.css'

const BookingDetailView = ({ booking, onClose, onImageClick }) => {
  if (!booking) return null;

  // Helper for cleaner date rendering
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-detail-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER SECTION */}
        <div className="modal-header-v2">
          <div className="header-titles">
            <h2>Booking Audit Trail</h2>
            <span className="booking-id-tag">
              ID: #{booking.id.toString().slice(-6).toUpperCase()} • Customer: {booking.customer_name}
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
              <label><FiUser /> Customer Details</label>
              <p className="primary-text">{booking.customer_name}</p>
              <p className="secondary-text">{booking.customer_email || "Email Hidden"}</p>
              <p className="secondary-text">{booking.customer_phone || "Phone Hidden"}</p>
            </div>
            
            <div className="info-block">
              <label><FiClock /> Audit Timeline</label>
              <div className="timeline-item">
                <span className="dot start"></span>
                <p className="secondary-text"><strong>Created:</strong> {formatDate(booking.created_at)}</p>
              </div>
              <div className="timeline-item">
                <span className={`dot ${booking.completed_at ? 'end' : 'pending'}`}></span>
                <p className="secondary-text">
                  <strong>Finished:</strong> {booking.completed_at ? formatDate(booking.completed_at) : "In Progress"}
                </p>
              </div>
              <div style={{ marginTop: '12px' }}>
                <span className={`status-tag ${booking.status.toLowerCase()}`}>{booking.status}</span>
              </div>
            </div>

            <div className="info-block">
              <label><FiCreditCard /> Financials</label>
              <p className="budget-highlight">₹{booking.budget?.toLocaleString()}</p>
              <p className="secondary-text" style={{marginTop: '8px'}}><FiMapPin size={12}/> {booking.location || "On-site Service"}</p>
              <p className="secondary-text">Service: {booking.service_type}</p>
            </div>
          </div>

          {/* FEEDBACK & RATING SECTION */}
          {booking.booking_rating && (
            <div className="review-section">
              <label><FiStar /> Customer Performance Review</label>
              <div className="review-card">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      fill={i < booking.booking_rating ? "#ffb547" : "none"} 
                      color={i < booking.booking_rating ? "#ffb547" : "#cbd5e1"} 
                      size={18}
                    />
                  ))}
                  <span className="rating-number">{booking.booking_rating}.0</span>
                </div>
                <p className="review-text">"{booking.booking_review || "Verified completion without specific comments."}"</p>
              </div>
            </div>
          )}

          {/* NOTES SECTION */}
          <div className="description-section">
            <label><FiInfo /> Original Requirements</label>
            <div className="notes-box">
              {booking.description || "The customer provided no additional notes for this request."}
            </div>
          </div>

          {/* GALLERY SECTION */}
          <div className="modal-gallery-section">
            <label>Completion Evidence ({booking.job_images?.length || 0})</label>
            <div className="full-gallery">
              {booking.job_images && booking.job_images.length > 0 ? (
                booking.job_images.map((img, idx) => (
                  <div key={idx} className="gallery-img-wrapper" onClick={() => onImageClick(img)}>
                    <img src={img} alt="Evidence" />
                    <div className="img-hover-hint">View</div>
                  </div>
                ))
              ) : (
                <div className="no-images-placeholder">
                  <FiInfo /> No completion images were uploaded for this booking.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close Audit Trail</button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailView;