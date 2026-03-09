import React from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin,FiUsers } from 'react-icons/fi'

import './Pros.css'
const Pros = ({allPros,getFilteredData,searchTerm,setSearchTerm,activeTab}) => {
  return (
    <div>
        
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
        <h2>Registered Professionals({allPros.length})</h2>
        <h2>{activeTab === 'Professional Network'}</h2>
        <div className="cards-wrapper">
          {getFilteredData(allPros).length>0 ?(getFilteredData(allPros).map(user => (
            <Link to={`/pro-details/${user.id}`} key={user.id} className="info-card">
              <div className="card-top">
                <div className="avatar-circle customer-bg">
                {user.profile_pic_url? 
                  (<img src={user.profile_pic_url} alt="cust"/>) :( 
                  user.name.charAt(0))
                }
              </div>
                <div className="name-meta">
                  <h4>{user.name}</h4>
                  <p>{user.service}</p>
                </div>
              </div>
              <div className="card-mid">
                <p><FiMapPin /> {user.location}</p>
                <p><FiUsers color="#6366f1" /> Verified Account</p>
                
              </div>
              <div className="card-foot">View Full History →</div>
            </Link>
          ))):(
            <p>No Professional found.</p>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default Pros
