import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiPhone, FiMapPin, FiArrowLeft, FiX, FiMaximize2, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import "./AdminProDetail.css"; // Reusing your existing CSS for consistency

const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=`;

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/admin/customer-details/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Error loading customer details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="admin-loader-container"><div className="spinner"></div><p>Syncing Customer Records...</p></div>;
  if (!data) return <div className="admin-error">Customer record not found.</div>;

  return (
    <div className="admin-detail-wrapper">
      {/* NAVIGATION BAR */}
      <nav className="detail-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Customers List
        </button>
      </nav>

      {/* CUSTOMER BIO HEADER */}
      <div className="header-card">
        <div className="pro-bio-main">
          <div className="avatar-wrapper">
            <img 
              src={data.summary.profile_pic_url ? data.summary.profile_pic_url: `${DEFAULT_AVATAR}${data.summary.name}`} 
              alt="customer-profile"
            />
          </div>
          <div className="bio-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1>{data.summary.name}</h1>
                <span className="status-tag Completed" style={{fontSize: '10px'}}>Customer</span>
            </div>
            <div className="contact-grid">
              <span><FiMail /> {data.summary.email}</span>
              <span><FiPhone /> {data.summary.phone_number}</span>
              <span><FiMapPin /> {data.summary.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <label>Total Life-Time Spend</label>
          <h2>₹{data.summary.total_spent?.toLocaleString()}</h2>
        </div>
        <div className="stat-card rating">
          <label>Successful Bookings</label>
          <h2><FiShoppingBag className="star-icon" style={{color: '#4f46e5'}} /> {data.summary.total_bookings_count}</h2>
        </div>
        <div className="stat-card jobs">
          <label>Member Since</label>
          <h2><FiCalendar style={{fontSize: '20px', verticalAlign: 'middle', marginRight: '8px'}} /> {new Date(data.summary.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}</h2>
        </div>
      </div>

      {/* BOOKING LOGS TABLE */}
      <div className="history-container">
        <div className="table-header">
          <h3>Customer Request History</h3>
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
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td className="font-bold">{job.pro_name || <span style={{color: '#9ca3af', fontWeight: '400'}}>Unassigned</span>}</td>
                  <td>{job.service_type}</td>
                  <td className="revenue-text">₹{job.budget}</td>
                  <td><span className={`status-tag ${job.status}`}>{job.status}</span></td>
                  <td>
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