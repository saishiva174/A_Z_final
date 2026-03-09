import React, { useEffect } from 'react'
import './Overview.css'
import { FiCheckCircle,FiDollarSign,FiStar } from 'react-icons/fi'
const Overview = ({stats,history,fetchDashboardData}) => {


  

  useEffect(()=>{
    fetchDashboardData();
  },[])
  return (
    <div className="tab-view">
                <header className="view-header">
                  <h1>Dashboard Overview</h1>
                  <p>Performance metrics and recent activity</p>
                </header>
    
                <div className="stats-grid">
                  <div className="stat-card gold">
                    <FiDollarSign className="stat-icon-bg" />
                    <div className="stat-content">
                      <p>Total Revenue</p>
                      <h3>₹{stats.total_earnings.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="stat-card blue">
                    <FiCheckCircle className="stat-icon-bg" />
                    <div className="stat-content">
                      <p>Jobs Done</p>
                      <h3>{stats.completed_jobs}</h3>
                    </div>
                  </div>
                  <div className="stat-card green">
                    <FiStar className="stat-icon-bg" />
                    <div className="stat-content">
                      <p>Rating</p>
                      <h3>{stats.rating} / 5.0</h3>
                    </div>
                  </div>
                </div>
    
                <h3 className="section-title">Recent History</h3>
                <div className="activity-list">
                  {history.map(item => (
                    <div key={item.id} className="history-row">
                      <div className="history-main">
                        <FiCheckCircle className="check-done" />
                        <div>
                          <h4>{item.service}</h4>
                          <p>{item.customer} • {item.date}</p>
                        </div>
                      </div>
                      <div className="history-meta">
                        <strong>₹{item.amount}</strong>
                        <span className="status-pill success">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

  )
}

export default Overview
