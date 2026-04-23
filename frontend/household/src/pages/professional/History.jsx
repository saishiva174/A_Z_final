import { useState } from 'react'
import { formatDateTime } from '../../utils/utils'
import { 
  FiPhone, FiClock, FiMapPin, FiStar, 
  FiX, FiPrinter, FiImage, FiMaximize2, FiInfo, FiSearch, FiSlash, FiZap, FiMessageSquare 
} from 'react-icons/fi'
import './History.css'
import { useNavigate } from 'react-router-dom';
const History = ({ jobs }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [zoomImg, setZoomImg] = useState(null); // State for full-screen image
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  const closeReceipt = () => setSelectedReceipt(null);

  const filteredJobs = jobs?.filter(job => {
    const isNotPending = job.status !== "Pending";
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Accepted" && job.status === "Accepted") ||
      (statusFilter === "Completed" && (job.status === "Completed" || job.status === "Reviewed")) ||
      (statusFilter === "Declined" && (job.status === "Declined" || job.status === "Cancelled"));

    const matchesSearch = 
      job.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toString().includes(searchQuery);

    return isNotPending && matchesStatus && matchesSearch;
  });

  const handleGoToChat = (bookingId) => {
    navigate(`/prochat/${bookingId}`); // 👈 Ensure this matches your route path
  };

  return (
    <div className="history-view-locked">
      <header className="view-header">
        <div className="header-text">
          <h1>Service History</h1>
          <p>Manage your accepted and finished services.</p>
        </div>
        
        <div className="header-controls">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {["All", "Accepted", "Completed", "Declined"].map((status) => (
              <button 
                key={status}
                className={`filter-pill ${statusFilter === status ? "active" : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      <div className="job-list-container">
        {filteredJobs?.map(job => (
          <div key={job.id} className={`history-list-item status-border-${job.status.toLowerCase()}`}>
            <div className="list-item-main">
              <div className="avatar-wrapper">
                <img src={job.customer_avatar || '/default-avatar.png'} alt="" className="list-avatar" />
                {job.status === "Reviewed" && (
                  <div className="list-rating-badge">
                    <FiStar fill="#F59E0B" color="#F59E0B" size={8} /> {job.user_rating}
                  </div>
                )}
              </div>
              
              <div className="list-content">
                <div className="list-title-row">
                  <h4>{job.service_type}</h4>
                  <div className="status-indicator">
                    <span className={`status-dot dot-${job.status.toLowerCase()}`}></span>
                    <span className={`list-status-text text-${job.status.toLowerCase()}`}>
                      {job.status === "Reviewed" ? "Completed" : job.status}
                    </span>
                  </div>
                </div>
                <div className="list-customer-name">{job.customer_name}</div>
                <p className="list-desc-preview">{`"${job.description}"`}</p>
                <div className="list-meta-row">
                  <span><FiClock size={12} /> {formatDateTime(job.completed_at || job.preferred_time)}</span>
                  <span><FiMapPin size={12} /> {job.location.split(',')[0]}</span>
                </div>
              </div>
            </div>

           <div className="list-item-side">
  <div className="price-wrapper">
    <div className={`list-price ${job.status === 'Declined' ? 'text-strike' : ''}`}>₹{job.budget}</div>
    <span className="list-id">#{job.id}</span>
  </div>

  {/* --- ACTION BUTTONS --- */}
  <div className="side-actions-group">
    {/* Show Chat for Accepted Jobs */}
    {job.status === "Accepted" && (
      <button 
        className="list-chat-btn" 
        onClick={() => handleGoToChat(job.id)}
      >
        <FiMessageSquare /> Chat
      </button>
    )}

    {/* Show Receipt for Completed/Reviewed Jobs */}
    {(job.status === "Completed" || job.status === "Reviewed") ? (
      <button className="list-receipt-btn" onClick={() => setSelectedReceipt(job)}>
        View Receipt
      </button>
    ) : (
      job.status !== "Accepted" && <div className="fallback-label">{job.status}</div>
    )}
  </div>
</div>
          </div>
        ))}
      </div>

      {/* --- RECEIPT MODAL --- */}
      {selectedReceipt && (
        <div className="receipt-overlay" onClick={closeReceipt}>
          <div className="receipt-modal-premium" onClick={e => e.stopPropagation()}>
             <div className="receipt-accent-bar"></div>
             <div className="receipt-inner-header">
                <div className="az-logo-small">AZ</div>
                <div className="header-title-group">
                   <h3>Job Receipt</h3>
                   <span className="receipt-id-tag">ID: {selectedReceipt.id}</span>
                </div>
                <button className="close-circle-btn" onClick={closeReceipt}><FiX /></button>
             </div>

             <div className="receipt-scrollable">
                {/* Customer Info */}
                <div className="receipt-pro-customer">
                   <img src={selectedReceipt.customer_avatar || '/default-avatar.png'} className="customer-large-avatar" alt="" />
                   <div className="customer-info">
                      <label>Client</label>
                      <h4>{selectedReceipt.customer_name}</h4>
                      <p><FiPhone size={12}/> {selectedReceipt.customer_phone}</p>
                   </div>
                </div>

                {/* Review Section (Conditionally shown) */}
                {selectedReceipt.status === "Reviewed" && (
                  <div className="receipt-section review-box">
                    <h5 className="section-label"><FiStar /> Customer Review</h5>
                    <div className="review-content">
                       <div className="stars-row">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} size={14} fill={i < selectedReceipt.user_rating ? "#F59E0B" : "transparent"} color={i < selectedReceipt.user_rating ? "#F59E0B" : "#cbd5e1"} />
                          ))}
                          <span className="rating-num">({selectedReceipt.user_rating}/5)</span>
                       </div>
                       <p className="review-text">"{selectedReceipt.user_comment || "No written feedback provided."}"</p>
                    </div>
                  </div>
                )}

                {/* Job Images Section */}
                {selectedReceipt.job_images?.length > 0 && (
                  <div className="receipt-section">
                    <h5 className="section-label"><FiImage /> Job Photos</h5>
                    <div className="receipt-photo-grid">
                      {selectedReceipt.job_images.map((img, idx) => (
                        <div key={idx} className="receipt-photo-card" onClick={() => setZoomImg(img)}>
                          <img src={img} alt="job proof" />
                          <div className="zoom-overlay"><FiMaximize2 /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="receipt-section">
                   <h5 className="section-label"><FiInfo /> Service Summary</h5>
                   <div className="overview-card">
                      <div className="overview-row"><span>Service Type</span><strong>{selectedReceipt.service_type}</strong></div>
                      <div className="overview-row"><span>Completed On</span><strong>{formatDateTime(selectedReceipt.completed_at)}</strong></div>
                      <div className="overview-row"><span>Location</span><strong>{selectedReceipt.location}</strong></div>
                   </div>
                </div>

                <div className="financial-footer">
                   <div className="finance-row total-paid"><span>Total Amount</span><span>₹{selectedReceipt.budget}</span></div>
                </div>
             </div>

             <div className="receipt-action-footer">
                <button className="btn-outline" onClick={() => window.print()}><FiPrinter /> Print</button>
                <button className="btn-solid" onClick={closeReceipt}>Close</button>
             </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX (For Zooming Images) --- */}
      {zoomImg && (
        <div className="lightbox-overlay" onClick={() => setZoomImg(null)}>
          <div className="lightbox-container" onClick={e => e.stopPropagation()}>
            <img src={zoomImg} alt="Zoomed view" />
            <button className="lightbox-close" onClick={() => setZoomImg(null)}><FiX /></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default History;