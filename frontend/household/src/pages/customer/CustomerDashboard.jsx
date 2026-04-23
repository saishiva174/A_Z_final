import  { useState,useEffect } from 'react';
import axios from 'axios';
import { FiSettings, FiCalendar,FiSearch, FiLogOut,FiClock} from 'react-icons/fi';
import './CustomerDashboard.css';
import ViewProfessional from './ViewProfessional';
import BookingDetails from './BookingDetails';
import TabView from './TabView';
import Bookings from './Bookings';
import History from './History';
import Profile from './Profile';
import { ReviewPage } from './ReviewPage.jsx';
import { DEFAULT_AVATAR } from '../../utils/utils';
import { API_URL } from '../../apiConfig';
import { useSearchParams } from 'react-router-dom';
const CustomerDashboard = () => {

const [searchParams, setSearchParams] = useSearchParams();
 
 const [profile, setProfile] = useState({});
 const [loading, setLoading] = useState(true);
 const [editData, setEditData] = useState({});
 const[isreviewOpen,setisReviewOpen]=useState(false);
 const [selectedBooking,setSelectedBooking]=useState(null);
 const[profilePicFile,setProfilePicFile]=useState(null);
 const [myBookings, setMyBookings] = useState({});
 const [selectedProId, setSelectedProId] = useState(null);
 const[targetBooking,setTargetBooking]=useState(null);

 const activeTab = searchParams.get('tab') || 'browse';
useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchUserProfile(userId);
      fetchBookingDetails();
    }
  }, [activeTab]);

  useEffect(()=>{

  fetchBookingDetails();
},[isreviewOpen,selectedBooking])

  const fetchUserProfile = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile/${id}`);
     
      setProfile(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  
  const handleUpdate = async (id) => {
    try {
      if (editData.phone_number.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
      }
      const formData = new FormData();
      formData.append('id',id)
      formData.append('name', editData.name);
      formData.append('phone_number', editData.phone_number);
      formData.append('location', editData.location);
      formData.append('bio',"");
      formData.append('rate',0.00);
      if (profilePicFile) formData.append('profilePic', profilePicFile);
  
       const token = localStorage.getItem('token');

await axios.put(`${API_URL}/api/admin/update-full-profile`, formData, {
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
  
      alert("profile updated Successfully");
      fetchUserProfile(id);
     
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookingDetails = async () => {
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/users/bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Prove who you are
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch');
     const data = await response.json();
   
    setMyBookings(data);
    setLoading(false);
  
    
  
  } catch (error) {
    console.error("Error loading details:", error);
  }
};


  const handleLogout=async()=>{
    localStorage.clear();
    
    window.location.href = '/';

   }
   
 const goToTab = (tabName) => {
  setSearchParams({ tab: tabName });
};
   
  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loader"></div> 
        <p>Loading details...</p>
      </div>
    );
  }

  if(isreviewOpen){
    return(<ReviewPage 
         booking={targetBooking}
         onBack={()=>setisReviewOpen(false)}
         />)
        }

  
  if (selectedProId) {
    return (
      <ViewProfessional 
        proId={selectedProId} 
        onBack={() => setSelectedProId(null)} 
      />
    );
  }

  if(selectedBooking){
    return(
     <BookingDetails
     booking={selectedBooking}
     onClose={()=>setSelectedBooking(null)}
     review={()=>{
      setisReviewOpen(true);
      setTargetBooking(selectedBooking);
      setSelectedBooking(null);
     }}
     />
    )
  }
  return (
    <div className="customer-container">
      {/* --- SIDEBAR --- */}
      <aside className="customer-sidebar">
        <div className="sidebar-brand">AZ SERVICES</div>
        
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            <img src={profile.profile_pic_url 
      ? `${profile.profile_pic_url}?t=${new Date().getTime()}` 
      : DEFAULT_AVATAR} alt="User" />
          </div>
          <h4>{profile.name}</h4>
          <p>Verified Customer</p>
        </div>

        <nav className="sidebar-nav">
  <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => goToTab('browse')}>
    <FiSearch /> <span>Browse Professionals</span>
  </button>
  <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => goToTab('bookings')}>
    <FiCalendar /> <span>Active Bookings</span>
  </button>
  {/* NEW: History Tab */}
  <button className={activeTab === 'history' ? 'active' : ''} onClick={() => goToTab('history')}>
    <FiClock /> <span>Booking History</span>
  </button>
  <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => goToTab('profile')}>
    <FiSettings /><span>Account Settings</span> 
  </button>
</nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut /> <span>Logout</span>
        </button>
      </aside>

      <main className="customer-main-content">
        
      
        {activeTab === 'browse' && (
          <TabView />  
        )}

        {activeTab === 'bookings' && (
        <Bookings 
        myBookings={myBookings} 
        setSelectedBooking={setSelectedBooking}
        setMyBookings={setMyBookings}
        />
        )}

        {activeTab === 'history' && (
          <History 
          myBookings={myBookings}
          setSelectedBooking={setSelectedBooking}
          setisReviewOpen={setisReviewOpen}
          setTargetBooking={setTargetBooking}
          />
        )}
        

        {activeTab === 'profile' && (
          <Profile
          profile={profile}
          editData={editData}
          setEditData={setEditData}
          setProfilePicFile={setProfilePicFile}
          handleUpdate={handleUpdate}/>
        )}

        
      </main>
    </div>
  );
};

export default CustomerDashboard;