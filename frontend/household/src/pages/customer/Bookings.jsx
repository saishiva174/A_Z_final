
import axios from 'axios'
import { FiMessageSquare,FiCalendar,FiXCircle,FiClock ,FiChevronRight} from 'react-icons/fi'
import { formatDateTime,handleUpdateStatus } from '../../utils/utils';
import './Bookings.css'
const Bookings = ({myBookings,setSelectedBooking,setMyBookings}) => {

  
  const handleUpdateBooking=async(bookingId,newStatus)=>{

  try
  {
    const response= await handleUpdateStatus(bookingId,newStatus);
    if (response.status === 200) {
      alert("hello");
      setMyBookings(prevBookings => 
        prevBookings.map(book => 
          book.id === bookingId ? { ...book, status: newStatus } : book
        )
      );
   
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update booking status. Please try again.");
  }

}

  const handlePriceUpdate = async (bookingId, newPrice) => {
    try {
      // 1. Backend API Call
      await axios.put(`api/users/update-price/${bookingId}`, { 
        cost: newPrice 
      })
  
      // 2. Update Local State
      setMyBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, cost: newPrice } : b
      ));
  
     
    } catch (err) {
      alert("Failed to update price. Please try again.");
    }
  };

  return (
    <div className="tab-view">
        <header className="view-header">
          <h1>Active Bookings</h1> {/* Changed title since Completed are hidden */}
        </header>
        <div className="bookings-container">
          {myBookings
            .filter(book => !['Completed', 'Cancelled', 'Declined','Reviewed'].includes(book.status))
            .map(book => (
              <div key={book.id} className="booking-row">
                <div className="book-info">
                  {/* 2. PRO PIC: Added profile image with fallback */}
                  <div className="pro-avatar-wrapper">
                    <img 
                      src={book.pro_avatar ? book.pro_avatar:`https://ui-avatars.com/api/?name=${book.pro_name}&background=random`} 
                      alt={book.pro_name} 
                      className="pro-row-img" 
                    />
                    <div className="book-icon-badge"><FiCalendar /></div>
                  </div>
                  
                  <div>
                    <h4>{book.service_type}</h4>
                    <p>With <strong>{book.pro_name}</strong> • {formatDateTime(book.preferred_time)}</p>
                  </div>
                </div>
    
                <div className="book-status">
                  <span className={`status-tag ${book.status.toLowerCase()}`}>
                    {book.status === 'Accepted' && <FiMessageSquare />}
                    {book.status === 'Pending' && <FiClock />}
                    {book.status === 'Cancelled' && <FiXCircle />}
                    {book.status}
                  </span>
                  
                  {book.status === 'Pending' ? (
                    <div className="price-edit-box">
                      <span>₹</span>
                      <input 
                        type="number" 
                        placeholder={book.budget}
                        defaultValue={book.budget}
                        onBlur={(e) => handlePriceUpdate(book.id, e.target.value)}
                        className="inline-price-input"
                      />
                    </div>
                  ) : (
                    <p className="book-price">₹{book.budget}</p>
                  )}
                </div>
    
                <div className="booking-actions">
                  {book.status !== 'Cancelled' && (
                    <button className="chat-btn" title="Chat" onClick={() => handleChat(book)}>
                      <FiMessageSquare />
                    </button>
                  )}
    
                  {book.status === 'Pending' && (
                    <button className="cancel-btn-outline" onClick={() => handleUpdateBooking(book.id, 'Cancelled')}>
                      Cancel Request
                    </button>
                  )}
    
                  {book.status === 'Accepted' && (
                    <button className="complete-action-btn" onClick={() => handleUpdateBooking(book.id, 'Completed')}>
                      Mark Completed
                    </button>
                  )}
    
                  <button className="icon-btn" onClick={() => setSelectedBooking(book)}>
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            ))}
            
          {/* Optional: Show message if no active bookings exist */}
          {myBookings.filter(b => b.status !== 'Completed').length === 0 && (
            <div className="empty-state">No active bookings found.</div>
          )}
        </div>
      </div>
  )
}

export default Bookings
