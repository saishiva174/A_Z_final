import  { useState } from 'react';
import { FiStar, FiCalendar, FiMapPin, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import axios from 'axios';
import './ReviewPage.css'
export const ReviewPage = ({ booking, onBack,}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating.");
    setIsSubmitting(true);
    try {
      await axios.post(`/api/bookings/reviews`, {
        booking_id: booking.id,
        pro_id: booking.pro_id,
        rating,
        comment
      });
      alert("Review submitted successfully!");
      onBack();
    } catch (err) {
      alert("Error submitting review.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="review-page-container">
      {/* 1. Header with Back Button */}
      <nav className="review-nav">
        <button onClick={onBack} className="back-link"><FiChevronLeft /> Back to History</button>
        <h1>Submit Review</h1>
      </nav>

      <div className="review-content-grid">
        {/* LEFT COLUMN: Booking Context */}
        <section className="booking-summary-card">
          <h3>Work Details</h3>
          <div className="summary-info">
            <p><strong>Service:</strong> {booking.service_type}</p>
            <p><FiCalendar /> {new Date(booking.preferred_time).toLocaleDateString()}</p>
            <p><FiMapPin /> {booking.location || "On-site Service"}</p>
          </div>

          {/* Booking Images Gallery */}
          <div className="booking-gallery">
            <h4>Job Photos</h4>
            <div className="image-scroll">
              {booking.job_images && booking.job_images.length > 0 ? (
                booking.job_images.map((pic, i) => (
                  <img key={i} src={pic} alt="Job" className="job-pic" />
                ))
              ) : (
                <div className="no-pics">No photos uploaded for this job.</div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Professional & Rating Form */}
        <section className="rating-form-card">
          <div className="pro-profile-summary">
             <img 
               src={booking.pro_avatar ? booking.pro_avatar: `https://ui-avatars.com/api/?name=${booking.pro_name}`} 
               className="pro-large-avatar" 
             />
             <div className="pro-meta">
                <h2>{booking.pro_name}</h2>
                <span>Verified Professional <FiCheckCircle /></span>
             </div>
          </div>

          <div className="rating-selector">
            <p>How would you rate the service?</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar 
                  key={star}
                  className={star <= rating ? "star filled" : "star"}
                  onClick={() => setRating(star)}
                  fill={star <= rating ? "#FFD700" : "none"}
                />
              ))}
            </div>
          </div>

          <textarea 
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Post Review"}
          </button>
        </section>
      </div>
    </div>
  );
};