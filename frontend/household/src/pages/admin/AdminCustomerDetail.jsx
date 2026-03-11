import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiMail, FiPhone, FiMapPin, FiArrowLeft, FiX, 
  FiMaximize2, FiCalendar, FiShoppingBag, FiUser 
} from 'react-icons/fi';
import "./AdminProDetail.css"; 
import { API_URL } from '../../apiConfig';

const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=`;

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/customer-details/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Error loading customer details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="admin-loader-container">
      <div className="spinner"></div>
      <p>Syncing Customer Records...</p>
    </div>
  );

  if (!data) return <div className="admin-error">Customer record not found.</div>;

  return (
    <div className="admin-detail-wrapper">
      {/* NAVIGATION BAR */}
      <nav className="detail-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Customers
        </button>
      </nav>

      {/* CUSTOMER BIO HEADER (Optimized for Mobile) */}
      <div className="header-card">
        <div className="pro-bio-main">
          <div className="avatar-wrapper">
            <img 
              src={data.summary.profile_pic_url ? data.summary.profile_pic_url: `${DEFAULT_AVATAR}${data.summary.name}`} 
              alt="customer-profile"
            />
            <div className="verified-badge-icon" style={{ background: '#4f46e5' }}>
              <FiUser />
            </div>
          </div>
          <div className="bio-info">
            <div className="name-status-row">
                <h1>{data.summary.name}</h1>
                <span className="account-type-tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                  Customer
                </span>
            </div>
            <div className="contact-grid">
              <div className="contact-item"><FiMail /> <span>{data.summary.email}</span></div>
              <div className="contact-item"><FiPhone /> <span>{data.summary.phone_number}</span></div>
              <div className="contact-item"><FiMapPin /> <span>{data.summary.location || "No Location Set"}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <label>Total Life-Time Spend</label>
          <h2 style={{ color: '#059669' }}>₹{data.summary.total_spent?.toLocaleString() || 0}</h2>
        </div>
        <div className="stat-card rating">
          <label>Successful Bookings</label>
          <h2><FiShoppingBag className="star-icon" style={{color: '#4f46e5'}} /> {data.summary.total_bookings_count || 0}</h2>
        </div>
        <div className="stat-card jobs">
          <label>Member Since</label>
          <h2 style={{ fontSize: '1.2rem' }}>
            <FiCalendar style={{ verticalAlign: 'middle', marginRight: '8px', color: '#64748b'}} /> 
            {new Date(data.summary.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </h2>
        </div>
      </div>

      {/* BOOKING LOGS TABLE (With Mobile data-labels) */}
      <div className="history-container">
        <div className="table-header">
          <h3>Customer Request History</h3>
          <small>{data.bookings.length} Total Requests Found</small>
        </div>
        <div className="table-responsive">
          <table className="admin-pro-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service Provider</th>
                <th>Service Type</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Job Photos</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map(job => (
                <tr key={job.id}>
                  <td data-label="Date">{new Date(job.created_at).toLocaleDateString()}</td>
                  <td data-label="Provider" className="font-bold">
                    {job.pro_name || <span style={{color: '#9ca3af', fontWeight: '400'}}>Unassigned</span>}
                  </td>
                  <td data-label="Service">{job.service_type}</td>
                  <td data-label="Amount" className="revenue-text">₹{job.budget}</td>
                  <td data-label="Status">
                    <span className={`status-tag ${job.status}`}>{job.status}</span>
                  </td>
                  <td data-label="Photos">
                    <div className="evidence-gallery">
                      {job.job_images && job.job_images.length > 0 ? (
                        job.job_images.map((img, i) => (
                          <div key={i} className="thumb-container" onClick={() => setSelectedImg(img)}>
                            <img src={img} alt="proof" />
                            <div className="thumb-overlay"><FiMaximize2 /></div>
                          </div>
                        ))
                      ) : <span className="no-data">No Images</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PORTRAIT-SAFE IMAGE MODAL */}
      {selectedImg && (
        <div className="modal-overlay" onClick={() => setSelectedImg(null)}>
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedImg(null)}>
              <FiX />
            </button>
            <img src={selectedImg} alt="Full view" className="modal-img-portrait" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerDetail;