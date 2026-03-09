/* eslint-disable react/prop-types */

import { FiX,FiCheck,FiCheckCircle,FiXCircle,FiAlertCircle,FiChevronRight } from 'react-icons/fi'
import { formatDateTime } from '../../utils/utils'
import './History.css'
const History = ({myBookings,setSelectedBooking,setisReviewOpen,setTargetBooking}) => {

  
  

  return (
    <div className="tab-view">
        <header className="view-header">
          <h1>Booking History</h1>
        </header>
        
        <div className="bookings-container">
          {myBookings
            .filter(book => 
              ['Completed', 'Cancelled', 'Declined','Reviewed'].includes(book.status)
            )
            .map(book => (
              <div key={book.id} className="booking-row history-row-fade">
                {/* 1. Professional Info Section */}
                <div className="book-info">
                  <div className="pro-avatar-wrapper">
                    <img 
                      src={book.pro_avatar ? book.pro_avatar : `https://ui-avatars.com/api/?name=${book.pro_name || book.pro}`} 
                      alt="" 
                      className="pro-row-img" 
                    />
                    <div className={`book-icon-badge ${book.status.toLowerCase()}`}>
                      {book.status ==="Completed"||"Reviewed" ? <FiCheck /> : <FiX />}
                    </div>
                  </div>
                  
                  <div className="book-text">
                    <h4>{book.service_type}</h4>
                    <p>By <strong>{book.pro_name || book.pro}</strong> • {formatDateTime(book.preferred_time)}</p>
                  </div>
                </div>
    
                {/* 2. Centered Status & Price (The Alignment Fix) */}
                <div className="book-status">
                  <span className={`status-tag ${book.status.toLowerCase()}`}>
                    {book.status === 'Completed' && <FiCheckCircle className="status-icon" />}
                    {book.status === 'Cancelled' && <FiXCircle className="status-icon" />}
                    {book.status === 'Declined' && <FiAlertCircle className="status-icon" />}
    
                    {book.status==="Reviewed"?"Completed":book.status}
                  </span>
                  <p className="book-price">₹{book.budget}</p>
                </div>
    
                {/* 3. Action Buttons Section */}
                <div className="booking-actions">
                  {book.status === 'Completed' && (
                    <button className="complete-action-btn" onClick={() =>{setisReviewOpen(true); setTargetBooking(book);}}>
                      Review Service
                    </button>
                  )}
                  
                  <button className="icon-btn" title="View Details" onClick={() => setSelectedBooking(book)}>
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            ))}
    
          {/* Empty State Logic */}
          {myBookings.filter(b => ['Completed', 'Cancelled', 'Declined'].includes(b.status)).length === 0 && (
            <div className="empty-state">No past bookings found.</div>
          )}
        </div>
      </div>
  )
}

export default History
