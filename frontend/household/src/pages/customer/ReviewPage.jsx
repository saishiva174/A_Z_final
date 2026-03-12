import { useState, useEffect } from 'react';
import { FiStar, FiCalendar, FiMapPin, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import axios from 'axios';
import './ReviewPage.css'
import { API_URL } from '../../apiConfig';

export const ReviewPage = ({ booking, onBack }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- MOBILE BACK BUTTON PROTECTION ---
  useEffect(() => {
    // Push a dummy state so the back button closes the review instead of the app
    window.history.pushState({ reviewing: true }, "");

    const handleHardwareBack = () => {
      onBack(); // Triggers the parent's function to close this view
    };

    window.addEventListener('popstate', handleHardwareBack);

    return () => {
      window.removeEventListener('popstate', handleHardwareBack);
    };
  }, [onBack]);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating.");
    setIsSubmitting(true);
    try {
      const id = localStorage.getItem("userId");
      await axios.post(`${API_URL}/api/bookings/reviews`, {
        booking_id: booking.id,
        pro_id: booking.pro_id,
        rating,
        comment,
        customer_id: id
      });
      alert("Review submitted successfully!");
      
      // Clean up history before going back
      if (window.history.state?.reviewing) window.history.back();
      onBack();
    } catch (err) {
      alert("Error submitting review.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="review-page-container animate-fade-in">
      <nav className="review-nav">
        <button onClick={() => {
          if (window.history.state?.reviewing) window.history.back();
          onBack();
        }} className="back-link">
          <FiChevronLeft /> Back to History
        </button>
        <h1>Submit Review</h1>
      </nav>

      <div className="review-content-grid">
        <section className="booking-summary-card">
          <h3>Work Details</h3>
          <div className="summary-info">
            <p><strong>Service:</strong> {booking.service_type}</p>
            <p><FiCalendar /> {new Date(booking.preferred_time).toLocaleDateString()}</p>
            <p><FiMapPin /> {booking.location || "On-site Service"}</p>
          </div>

          <div className="booking-gallery">
            <h4>Job Photos</h4>
            <div className="image-scroll">
              {booking.job_images && booking.job_images.length > 0 ? (
                booking.job_images.map((pic, i) => (
                  <img key={i} src={pic} alt="Job" className="job-pic" />
                ))
              ) : (
                <div className="no-pics">No photos uploaded.</div>
              )}
            </div>
          </div>
        </section>

        <section className="rating-form-card">
          <div className="pro-profile-summary">
             <img 
               src={booking.pro_avatar ? booking.pro_avatar: `https://ui-avatars.com/api/?name=${booking.pro_name}`} 
               className="pro-large-avatar" 
               alt="Pro"
             />
             <div className="pro-meta">
                <h2>{booking.pro_name}</h2>
                <span className="verified-tag">Verified Professional <FiCheckCircle /></span>
             </div>
          </div>

          <div className="rating-selector">
            <p>How was your experience?</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar 
                  key={star}
                  className={star <= rating ? "star filled" : "star"}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <textarea 
            placeholder="What did you like or what could be improved?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? <div className="btn-loader"></div> : "Post Review"}
          </button>
        </section>
      </div>
    </div>
  );
};