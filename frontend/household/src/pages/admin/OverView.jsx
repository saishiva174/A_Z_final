import React from 'react'
import { FiClock,FiCheckCircle,FiUsers,FiDollarSign,FiTrendingUp } from 'react-icons/fi'
import './OverView.css'
const OverView = ({allCustomers,allPros,stats}) => {
  return (
     <>
       <header className="main-header">
    <h1>Welcome back, Admin</h1>
    <div className="admin-profile-trigger">
        <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" alt="Admin" />
        <span>Settings</span>
    </div>
  </header>
      <div className="stats-grid">
    <div className="stat-card purple">
      <FiUsers className="s-icon" />
      <div className="s-data"><h3>{allCustomers.length}</h3><p>Total Customers</p></div>
    </div>
    <div className="stat-card green">
      <FiCheckCircle className="s-icon" />
      <div className="s-data"><h3>{allPros.length}</h3><p>Verified Pros</p></div>
    </div>
    <div className="stat-card orange">
      <FiClock className="s-icon" />
      <div className="s-data"><h3>{stats.completed_bookings_count}</h3><p>Total Bookings</p></div>
    </div>
    <div className="stat-card blue">
      <FiDollarSign className="s-icon" />
      <div className="s-data"><h3>{stats.total_revenue.toLocaleString()}</h3><p>Earnings</p></div>
    </div>
  </div>
   <div className="placeholder-view">
          <FiTrendingUp size={40} color="#cbd5e1" />
          <p>Welcome to the AZ Services Management Console. Select a tab to manage your users.</p>
        </div>
   </>
  )
}

export default OverView
