import {useState}from 'react'
import { FiCamera } from 'react-icons/fi';
import { DEFAULT_AVATAR } from '../../utils/utils';
import '../professional/Profile.css'
const Profile = ({profile,editData,setEditData,setProfilePicFile,handleUpdate}) => {


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
    <div className="tab-view">
            <header className="view-header">
              <h1>Account Settings</h1>
            </header>
            <div className="profile-settings-card">
              <div className="avatar-edit">
                <div className="large-avatar">
                  <img src={previewUrl ? previewUrl:profile.profile_pic_url?profile.profile_pic_url:DEFAULT_AVATAR} alt="Profile" />
                  <label className="avatar-overlay">
                    <FiCamera />
                    <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" required className="file-input-custom"
                     onChange={handleFileSelection} />
                  </label>
                </div>
                <h3>{profile.name}</h3>
                <p>Personalize your public profile</p>
              </div>

              <div className="settings-form">
                <div className="input-grid">
                  <div className="form-input">
                    <label>Full Name</label>
                    <input type="text" value={editData.name} onChange={(e)=>setEditData({...editData, name: e.target.value})} />
                  </div>
                  <div className="form-input">
                    <label>Phone Number</label>
                      <input 
    type="tel" 
    placeholder="Enter 10-digit number"
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
                  <div className="form-input full">
                    <label>Email Address</label>
                    <input type="email" value={profile.email} disabled />
                  </div>
                  <div className="form-input full">
                    <label>Address</label>
                    <input type="text" value={editData.location || ""} onChange={(e)=>setEditData({...editData, location: e.target.value})} />
                  </div>
                </div>
                <button className="secondary-btn" onClick={() => setEditData(profile)}>Reset</button>
                <button className="primary-btn" onClick={()=>handleUpdate(profile.id)}>Save Changes</button>
              </div>
            </div>
          </div>
  )
}

export default Profile
