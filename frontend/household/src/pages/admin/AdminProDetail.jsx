import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiMail, FiPhone, FiMapPin, FiDownload, FiStar, FiArrowLeft, 
  FiX, FiMaximize2, FiCalendar, FiInfo, FiUser, FiCreditCard 
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import "./AdminProDetail.css";
import BookingDetailView from './BookingDetailView';
import { API_URL } from '../../apiConfig';

const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=`;

const AdminProDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  
  // 1. New State for Booking Pop-up
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/pro-details/${id}`);
        setData(res.data);
        console.log(res.data.bookings)
      } catch (err) {
        console.error("Error loading pro details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Professional Audit Report: ${data.summary.name}`, 14, 20);
    doc.autoTable({
      startY: 30,
      head: [['Metric', 'Details']],
      body: [
        ['Total Revenue', `INR ${data.summary.total_earnings?.toLocaleString()}`],
        ['Average Rating', `${data.summary.average_rating?.toFixed(1) || 0} / 5`],
        ['Jobs Completed', data.summary.completed_count],
        ['Location', data.summary.location],
        ['Contact', data.summary.phone_number]
      ],
      theme: 'grid'
    });
    doc.save(`${data.summary.name}_Audit.pdf`);
  };

  if (loading) return <div className="admin-loader-container"><div className="spinner"></div><p>Syncing Professional Records...</p></div>;
  if (!data) return <div className="admin-error">Record not found in database.</div>;

  return (
    <div className="admin-detail-wrapper">
      <nav className="detail-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Dashboard
        </button>
        <button onClick={downloadPDF} className="btn-download">
          <FiDownload /> Export Report
        </button>
      </nav>

      <div className="header-card">
        <div className="pro-bio-main">
          <div className="avatar-wrapper">
            <img 
              src={data.summary.profile_pic_url ? data.summary.profile_pic_url : `${DEFAULT_AVATAR}${data.summary.name}`} 
              alt="pro-profile"
            />
          </div>
          <div className="bio-info">
            <h1>{data.summary.name}</h1>
            <div className="contact-grid">
              <span><FiMail /> {data.summary.email}</span>
              <span><FiPhone /> {data.summary.phone_number}</span>
              <span><FiMapPin /> {data.summary.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card revenue">
          <label>Total Earnings</label>
          <h2>₹{data.summary.total_earnings?.toLocaleString()}</h2>
        </div>
        <div className="stat-card rating">
          <label>Performance Rating</label>
          <h2><FiStar className="star-icon" /> {data.summary.average_rating?.toFixed(1) || "0.0"}</h2>
        </div>
        <div className="stat-card jobs">
          <label>Jobs Completed</label>
          <h2>{data.summary.completed_count}</h2>
        </div>
      </div>

      <div className="history-container">
        <div className="table-header">
          <h3>Job History & Evidence</h3>
          <small>Click on a row to see full booking details</small>
        </div>
        <div className="table-responsive">
          <table className="admin-pro-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Service Type</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Work Evidence</th>
              </tr>
            </thead>
            <tbody>
           
              {data.bookings.map(job => (
                <tr 
                  key={job.id} 
                  className="clickable-row" 
                  onClick={() => setSelectedBooking(job)}
                >
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td className="font-bold">{job.customer_name}</td>
                  <td>{job.service_type}</td>
                  <td className="revenue-text">₹{job.budget}</td>
                  <td><span className={`status-tag ${job.status=="Reviewed"?"Completed":job.status}`}>{job.status=="Reviewed"?"Completed":job.status}</span></td>
                  <td>
                    <div className="evidence-gallery" onClick={(e) => e.stopPropagation()}>
                      {job.job_images && job.job_images.length > 0 ? (
                        job.job_images.map((img, i) => (
                          <div key={i} className="thumb-container" onClick={() => setSelectedImg(img)}>
                            <img src={img} alt="proof" />
                            <div className="thumb-overlay"><FiMaximize2 /></div>
                          </div>
                        ))
                      ) : <span className="no-data">No Evidence</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. BOOKING DETAIL MODAL */}
      {selectedBooking && (
       <BookingDetailView 
  booking={selectedBooking} 
  onClose={() => setSelectedBooking(null)} 
  onImageClick={(img) => setSelectedImg(img)}
/> 
      )}

      {/* IMAGE PREVIEW MODAL */}
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

export default AdminProDetail;