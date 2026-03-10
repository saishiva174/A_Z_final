import React from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin,FiUsers } from 'react-icons/fi'
import './Pros.css'
const Customers = ({activeTab,searchTerm,setSearchTerm,allCustomers,getFilteredData}) => {
  return (
        <>

<div className="search-container" style={{ marginBottom: '20px' }}>
  <div className="search-box">
    <input 
      type="text" 
      placeholder={`Search in ${activeTab}...`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="admin-search-input"
    />
  </div>
</div>
  <div className="grid-view">
    <h2>Registered Customers ({allCustomers.length})</h2>
    <div className="cards-wrapper">
      {getFilteredData(allCustomers).length > 0 ? (
        getFilteredData(allCustomers)
        .map(cust => (
          <Link to={`/cus-details/${cust.id}`} key={cust.id} className="info-card customer-card">
            <div className="card-top">
              <div className="avatar-circle customer-bg">
                {cust.profile_pic_url? 
                  (<img src={cust.profile_pic_url} alt="cust"/>) :( 
                  cust.name.charAt(0))
                }
              </div>
              <div className="name-meta">
                <h4>{cust.name}</h4>
                <p>Joined: {new Date(cust.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="card-mid">
              <p><FiMapPin /> {cust.location || 'Location Not Set'}</p>
              <p><FiUsers color="#6366f1" /> Verified Account</p>
            </div>
            <div className="card-foot">View Booking History →</div>
          </Link>
        ))
      ) : (
        <p>No customers found.</p>
      )}
    </div>
  </div>
  </>
  )
}

export default Customers
