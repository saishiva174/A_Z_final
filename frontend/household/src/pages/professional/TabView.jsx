import { useState } from 'react';
import { formatDateTime, handleUpdateStatus, DEFAULT_AVATAR } from '../../utils/utils';
import { FiClock, FiPhone, FiMapPin, FiImage, FiCheck, FiMessageSquare, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './TabView.css';

const TabView = ({ jobs, setJobs }) => {
  const [selectedJobPics, setSelectedJobPics] = useState(null);
  // NEW: State for the currently zoomed-in single image
  const [activeImage, setActiveImage] = useState(null); 

  const handleUpdateBooking = async (bookingId, newStatus) => {
    try {
      await handleUpdateStatus(bookingId, newStatus);
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === bookingId ? { ...job, status: newStatus } : job
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update booking status. Please try again.");
    }
  };

  // Helper to close everything
  const closeViewers = () => {
    setSelectedJobPics(null);
    setActiveImage(null);
  };

  return (
    <>
      <div className="tab-view">
        <header className="view-header">
          <h1>Job Requests</h1>
          <p>Review customer requirements and attachments</p>
        </header>

        <div className="job-grid">
          {Array.isArray(jobs) && 
            jobs.filter(job => job.status === "Pending").map(job => (
            <div key={job.id} className="job-card">
              
              <div className="job-details-section">
                <div className="job-main-info">
                  <img 
                    src={job.customer_avatar ? job.customer_avatar : `${DEFAULT_AVATAR}${job.customer_name}`} 
                    alt={job.customer_name} 
                    className="customer-avatar-img"
                  />
                  <div className="text-content">
                    <h4>{job.service_type}</h4>
                    <span className="customer-name-label">{job.customer_name}</span>
                  </div>
                </div>

                <div className="job-sub-details">
                  <p className="job-description">{`"${job.description}"`}</p>
                  <div className="meta-row">
                    <span><FiClock /> {formatDateTime(job.preferred_time)}</span>
                    <span><FiMapPin /> {job.location}</span>
                    <span><FiPhone /> {job.customer_phone}</span>
                  </div>
                  
                  {job.job_images?.length > 0 && (
                    <button className="view-files-link" onClick={() => setSelectedJobPics(job.job_images)}>
                      <FiImage /> View Customer Photos ({job.job_images.length})
                    </button>
                  )}
                </div>
              </div>

              <div className="job-actions-section">
                <div className="price-container">
                  <span className="price-label">ESTIMATED BUDGET</span>
                  <h3 className="price-tag">₹{job.budget.toLocaleString()}</h3>
                </div>
                
                <div className="button-group">
                  <button className="chat-btn-square" title="Chat with Customer">
                    <FiMessageSquare />
                  </button>
                  <button className="reject-btn" onClick={() => handleUpdateBooking(job.id, "Declined")}>
                    Decline
                  </button>
                  <button className="approve-btn" onClick={() => handleUpdateBooking(job.id, "Accepted")}>
                    <FiCheck /> Accept Job
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ENHANCED Image Viewer Overlay */}
      {selectedJobPics && (
        <div className="image-viewer-overlay" onClick={closeViewers}>
          <div className="viewer-content" onClick={e => e.stopPropagation()}>
            <div className="viewer-header">
              <h3>{activeImage ? "Photo Preview" : "Customer Attachments"}</h3>
              <div className="viewer-controls">
                {activeImage && (
                  <button className="back-btn" onClick={() => setActiveImage(null)}>
                    Back to Grid
                  </button>
                )}
                <button className="close-viewer" onClick={closeViewers}><FiX /></button>
              </div>
            </div>

            {/* Switch between Single Image and Grid */}
            {activeImage ? (
              <div className="single-image-container">
                <img src={activeImage} alt="Focused View" className="focused-img" />
              </div>
            ) : (
              <div className="viewer-grid">
                {selectedJobPics.map((url, index) => (
                  <div key={index} className="grid-img-wrapper" onClick={() => setActiveImage(url)}>
                    <img src={url} alt={`job-site-${index}`} />
                    <div className="img-hover-overlay">Click to Enlarge</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TabView;