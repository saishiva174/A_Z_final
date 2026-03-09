import React from 'react'
import { FiMapPin,FiEye } from 'react-icons/fi'
import './Pending.css'
const Pending = ({pendingPros,handleVerification,openDoc}) => {

  
  return (
    <div className="table-container">
        <h2>Pending Approvals({pendingPros.length})</h2>
        {pendingPros.length>0?(
          <table className="custom-table">
          <thead>
            <tr>
              <th>Professional</th>
              <th>Trade</th>
              <th>Location</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPros.map(pro => (
              <tr key={pro.id}>
                <td><b>{pro.name}</b></td>
                <td>{pro.service}</td>
                <td><FiMapPin /> {pro.location}</td>
                <td>
                <button onClick={() => openDoc(pro.id_document_url)} className="view-doc-btn">
                <FiEye /> View ID
                </button>
                </td>
                <td>
                  <button className="approve-btn" onClick={()=>handleVerification(pro.id,"approve")}>Approve</button>
                  <button className="reject-btn" onClick={()=>handleVerification(pro.id,"reject")}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ):(
           <p>No pending approvals.</p>
        )}
        
      </div>
  )
}

export default Pending
