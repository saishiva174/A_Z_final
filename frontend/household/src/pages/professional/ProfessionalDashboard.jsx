import { useState, useEffect } from 'react';
import { 
  FiSettings, FiCalendar, FiBriefcase,FiLogOut,FiActivity} from 'react-icons/fi';
import './ProfessionalDashboard.css';
import axios from 'axios';
import Overview from './Overview';
import TabView from './TabView';
import History from './History';
import Profile from './Profile';


const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=`;

const ProfessionalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState({});
  const[profilePicFile,setProfilePicFile]=useState(null);
  const [editData, setEditData] = useState({});
  const [loading,setLoading]=useState(true);
  const [jobs, setJobs] = useState({});


 const [stats, setStats] = useState({ total_earnings: 0, completed_jobs: 0, rating: 0 });
 const [history, setHistory] = useState([]);



useEffect(() => {
        fetchRequests();    
}, [activeTab]);

  useEffect(() => {
    const id=localStorage.getItem("proId");
    if(id){
   fetchProProfile(id);
    }
     
    }, []);


  useEffect(() => {
    setEditData(profile);
   }, [profile]);


  const fetchProProfile = async (id) => {
     try {
      
        

        const response = await axios.get(`api/pro/profile/${id}`)
        
        const data = response.data;
       
        const updatedProfile = {
            id: data.id,
            name: data.name,
            service_category: data.service || "Service Professional",
            location: data.location || "Location not set",
            phone_number: data.phone_number || "", // Map phone_number to phone
            profile_pic_url: data.profile_pic_url,
            bio:data.bio,
            rate:data.rate,
           
            total_earnings: "0", 
            completed_jobs: "0",
            rating: "5.0"
        };

        setProfile(updatedProfile);
        setEditData(updatedProfile); // Important for the update tab
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
    formData.append('bio',editData.bio);
    formData.append('rate',editData.rate);
    if (profilePicFile) formData.append('profilePic', profilePicFile);


    const token = localStorage.getItem('token');

await axios.put(`/api/admin/update-full-profile`, formData, {
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
    fetchProProfile(id);
    alert("profile updated Successfully");
   
  } catch (err) {
    console.error(err);
  }
};
 

  const fetchDashboardData = async () => {
    try {
         const token = localStorage.getItem('token'); // Use the token instead
       
        const res = await axios.get(`api/pro/overview`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
       
        setStats(res.data.profile);
        setHistory(res.data.history || []); // Fallback to empty array
    } catch (err) {
        console.error("Failed to load dashboard:", err);
        setHistory([]); // Set empty array on error to prevent .filter() crash
    }
  };



const fetchRequests = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token'); // Use the token instead
       
        const res = await axios.get(`api/pro/all-jobs`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
       
      
        setJobs(res.data);
        setLoading(false); 
    } catch (err) {
        console.error("Failed to load requests: " + err);
        setLoading(false);
    }
};
 



 if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loader"></div> 
        <p>Loading Detials......</p>
      </div>
    );
  }
  return (
    <div className="pro-container">
    
      <aside className="pro-sidebar">
        <div className="sidebar-brand">AZ PRO</div>
        
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            <img src={profile.profile_pic_url?`${profile.profile_pic_url}?t=${new Date().getTime()}`:`${DEFAULT_AVATAR}${profile.name}`}alt="Pro" />
          </div>
          <h4>{profile.name}</h4>
          <span className="pro-badge">{profile.service_category}</span>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <FiActivity /> <span>Overview</span>
          </button>
          <button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>
            <FiBriefcase /><span>Requests</span> <span className="job-count-badge">{jobs.filter(job=>job.status==="Pending").length}</span>
          </button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
            <FiCalendar /><span>Schedule</span> 
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            <FiSettings /><span> Business Profile</span>
          </button>
        </nav>

        <button className="sidebar-logout" onClick={() => { localStorage.clear();window.location.href = '/'}}>
          <FiLogOut /> <span>Logout</span>
        </button>
      </aside>

      
      <main className="pro-main-content">
        
        
        {activeTab === 'overview' && (
          <Overview
          stats={stats}
          history={history}
          fetchDashboardData={fetchDashboardData}
          />
        )}

       
       {activeTab === 'jobs' && (
      <TabView
      jobs={jobs}
      setJobs={setJobs}/>
       )}

      {activeTab === 'history' && (
        <History
        jobs={jobs}/>
      )}


      {activeTab === 'profile' && (
        <Profile
        profile={profile}
        handleUpdate={handleUpdate}
        editData={editData}
        setEditData={setEditData}
        setProfilePicFile={setProfilePicFile}
        />
      
      )}
     </main>

  
      
    </div>
  );
};

export default ProfessionalDashboard;