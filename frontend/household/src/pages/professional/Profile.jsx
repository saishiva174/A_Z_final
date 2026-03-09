import React from 'react'
import { useState } from 'react';
import { FiCamera ,FiMapPin} from 'react-icons/fi';
import { DEFAULT_AVATAR } from '../../utils/utils';
import './Profile.css';
const Profile = ({profile,editData,setEditData,handleUpdate,setProfilePicFile}) => {

   const [previewUrl,setPreviewUrl]=useState(null);
  const handleFileSelection = (e) => {
  const file = e.target.files[0];
  if (file) {
    // This "sets" the file into your state variable
    setProfilePicFile(file); 
   const tempUrl = URL.createObjectURL(file);
    
    setPreviewUrl(tempUrl);
  }
};
  return (
     <div className="tab-view animate-fade">
    <header className="view-header">
      <h1>Business Profile</h1>
      <p>Keep your contact details up to date for customers</p>
    </header>

   <div className="profile-settings-card">
  {/* Profile Picture Section */}
  <div className="avatar-edit-section">
    <div className="large-avatar">
      <img 
        src={previewUrl || (profile.profile_pic_url ? profile.profile_pic_url : `${DEFAULT_AVATAR}${editData.name}`)} 
        alt="Pro" 
      />
      <label className="avatar-overlay" title="Change Profile Picture">
        <FiCamera />
        <input type="file" hidden accept=".jpg,.jpeg,.png" onChange={handleFileSelection} />
      </label>
    </div>
    <div className="avatar-text">
      <h3>Profile Photo</h3>
      <p>Click the camera icon to update your picture</p>
    </div>
  </div>

  <hr className="form-divider" />

  {/* Form Fields */} 
  <div className="settings-form">
    <div className="input-grid">
      <div className="form-input">
        <label>Full Name</label>
        <input 
          type="text" 
          placeholder={editData.name}
          value={editData.name || ""} 
          onChange={(e) => setEditData({...editData, name: e.target.value})} 
        />
      </div>

      <div className="form-input">
  <label>Phone Number</label>
  <input 
    type="tel" 
    placeholder={editData.phone_number}
    maxLength={10} // Prevents typing more than 10 digits
    value={editData.phone_number || ""} 
    onChange={(e) => {
      // Regex: Replace anything that is NOT a digit with an empty string
      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
      setEditData({...editData, phone_number: onlyNums});
    }} 
  />
  {/* Optional: Show error if incomplete */}
  {editData.phone_number?.length > 0 && editData.phone_number?.length < 10 && (
    <small style={{ color: 'red' }}>Must be 10 digits</small>
  )}
</div>

      {/* --- NEW RATE SECTION --- */}
      <div className="form-input">
        <label>Hourly Rate / Service Fee (₹)</label>
        <div className="input-with-icon">
          <span className="currency-prefix">₹</span>
          <input 
            type="number" 
            placeholder={editData.rate}
            value={editData.rate || ""} 
            onChange={(e) => setEditData({...editData, rate: e.target.value})} 
          />
        </div>
      </div>

      <div className="form-input">
        <label>Service Location / Area</label>
        <div className="input-with-icon">
          <FiMapPin className="input-icon" />
          <input 
            type="text" 
            placeholder={editData.location}
            value={editData.location || ""} 
            onChange={(e) => setEditData({...editData, location: e.target.value})} 
          />
        </div>
      </div>

      {/* --- NEW BIO SECTION --- */}
      <div className="form-input full">
        <label>Professional Bio</label>
        <textarea 
          placeholder={editData.bio}
          value={editData.bio || ""} 
          rows="5"
          onChange={(e) => setEditData({...editData, bio: e.target.value})}
          className="bio-textarea"
        />
      </div>
    </div>

    <div className="form-actions">
      <button className="secondary-btn" onClick={() => setEditData(profile)}>Reset</button>
      <button className="primary-btn" onClick={() => handleUpdate(profile.id)}>
        Save Profile Changes
      </button>
    </div>
  </div>
</div>
  </div>
  )
}

export default Profile
