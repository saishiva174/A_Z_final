import { useState, useEffect } from 'react'; // Added useEffect
import { FiCamera } from 'react-icons/fi';
import { DEFAULT_AVATAR } from '../../utils/utils';
import '../professional/Profile.css';

const Profile = ({ profile, editData, setEditData, setProfilePicFile, handleUpdate }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Clean up the memory when the component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
    }
  };

  // Helper to handle the reset more cleanly
  const handleReset = () => {
    setEditData(profile);
    setPreviewUrl(null); // Clear the preview on reset
    setProfilePicFile(null); // Clear the file state
  };

  return (
    <div className="tab-view">
      <header className="view-header">
        <h1>Account Settings</h1>
      </header>
      <div className="profile-settings-card">
        <div className="avatar-edit">
          <div className="large-avatar">
            {/* Priority: Preview -> Current Profile Pic -> Default */}
            <img 
              src={previewUrl || profile.profile_pic_url || DEFAULT_AVATAR} 
              alt="Profile avatar" 
            />
            <label className="avatar-overlay">
              <FiCamera />
              <input 
                type="file" 
                hidden 
                accept="image/*" // Changed to image only
                onChange={handleFileSelection} 
              />
            </label>
          </div>
          <h3>{profile.name}</h3>
          <p>Personalize your public profile</p>
        </div>

        <div className="settings-form">
          <div className="input-grid">
            <div className="form-input">
              <label>Full Name</label>
              <input 
                type="text" 
                value={editData.name || ""} 
                onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
              />
            </div>

            <div className="form-input">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter 10-digit number"
                maxLength={10}
                value={editData.phone_number || ""} 
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  setEditData({ ...editData, phone_number: onlyNums });
                }} 
              />
              {editData.phone_number?.length > 0 && editData.phone_number?.length < 10 && (
                <small style={{ color: '#e11d48', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Must be 10 digits
                </small>
              )}
            </div>

            <div className="form-input full">
              <label>Email Address</label>
              <input type="email" value={profile.email || ""} disabled />
              <small style={{ color: '#64748b' }}>Email cannot be changed.</small>
            </div>

            <div className="form-input full">
              <label>Address</label>
              <input 
                type="text" 
                placeholder="Enter your full address"
                value={editData.location || ""} 
                onChange={(e) => setEditData({ ...editData, location: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
            <button 
              className="primary-btn" 
              onClick={() => handleUpdate(profile.id)}
              disabled={editData.phone_number?.length > 0 && editData.phone_number?.length < 10}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;