import { useState /*, useEffect */ } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added useNavigate
import axios from 'axios';
import { 
FiUsers, FiClock,FiSettings, FiBriefcase, FiTrendingUp, FiArrowLeft 
} from 'react-icons/fi';
import './AdminDashboard.css';
import { useEffect } from 'react';
import Pending from './Pending';
import Pros from './Pros';
import Customers from './Customers';
import OverView from './OverView';

const AdminDashboard = () => {
const [activeTab, setActiveTab] = useState('overview');
const navigate = useNavigate(); 


const [selectedDoc, setSelectedDoc] = useState(null); // Stores the URL of the PDF/Image
const [isModalOpen, setIsModalOpen] = useState(false);
const [allPros, setAllPros] = useState([]); 
const [allCustomers, setAllCustomers] = useState([]);
const [pendingPros,setPendingPros] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [stats, setStats] = useState({ total_bookings: 0, total_revenue: 0 });
// Update your existing useEffect to include this call
const openDoc = (url) => {
  setSelectedDoc(url);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedDoc(null);
};


useEffect(()=>{
  getAdminStats();
  fetchPending();
  fetchCustomers();
  fetchApprovedPros();
},[])


useEffect(()=>{
  if(activeTab=="overview")getAdminStats();
  if(activeTab=="pending")fetchPending();
  if(activeTab=="customers")fetchCustomers();
  if(activeTab=="pros") fetchApprovedPros();
},[activeTab])






const getAdminStats = async () => {
  try {
    const response = await axios.get(`/api/admin/earnings-summary`);
    setStats(response.data);
  } catch (error) {
    console.error("Failed to load admin stats", error);
  }
};
const getFilteredData = (dataList) => {
  if (!searchTerm) return dataList; // If nothing in search bar, show everyone

  return dataList.filter(person => 
    person.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    person.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.service && person.service.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

const fetchCustomers = async () => {
  try {
    const response = await axios.get('/api/admin/all-customers');
    setAllCustomers(response.data);
  } catch (error) { 
    console.error("Error loading customers:", error);
  }
};

// Function to fetch approved professionals
const fetchApprovedPros = async () => {
  try {
    const response = await axios.get('/api/admin/verified-pros');
    setAllPros(response.data); // Data is result.rows from backend
  } catch (error) {
    console.error("Error loading approved professionals:", error);
  }
};

const fetchPending = async () => {
try {
const response = await axios.get('/api/pro/pending');
setPendingPros(response.data);
} catch (err) {
console.error("Could not fetch pending professionals", err);
}
};


const handleVerification = async (proId, action) => {
  // Simple confirmation popup
  const confirmAction = window.confirm(`Are you sure you want to ${action} this professional?`);
  if (!confirmAction) return;

  try {
    // Call the backend
    await axios.put(`/api/admin/verify/${proId}`, { 
      status: action 
    });

    // Update the UI: Remove the pro from the pendingPros array locally
    fetchPending()
    fetchApprovedPros()
    
  } catch (err) {
    console.error("Verification failed", err);
    alert("Error updating status");
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('adminName');
  navigate('/', { replace: true });
};


return (
<div className="admin-container">
{/* --- SIDEBAR --- */}
<aside className="admin-sidebar">
  {/* --- ADDED BACK BUTTON --- */}
  <button className="back-to-site-btn" onClick={() => handleLogout()}>
    <FiArrowLeft /> Log out
  </button>

  <div className="admin-logo">
    <FiTrendingUp className="logo-icon" />
    <span>AZ ADMIN</span>
  </div>
  <nav className="admin-nav">
    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
      <FiSettings /><span>Dashboard</span> 
    </button>
    <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
      <FiClock /> <span>Approvals </span><span className="count-pill">{pendingPros.length}</span>
    </button>
    <button className={activeTab === 'pros' ? 'active' : ''} onClick={() => setActiveTab('pros')}>
      <FiBriefcase /> <span>Professionals</span>
    </button>
    <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
      <FiUsers /> <span>Customers</span>
    </button>
  </nav>
</aside>

{/* --- MAIN CONTENT --- */}
<main className="admin-main-content">
 


  <section className="data-section">
    {activeTab==='overview' &&(
      <OverView
      allCustomers={allCustomers}
      allPros={allPros}
      stats={stats}/>
      )}


    {activeTab === 'pending' && (
      <Pending 
      handleVerification={handleVerification}
      pendingPros={pendingPros}
      openDoc={openDoc}/>
    )}

    {(activeTab === 'pros') && (
     
    <Pros 
    allPros={allPros}
    getFilteredData={getFilteredData}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    activeTab={activeTab}
    />
    )}

    {activeTab === 'customers' && (
     <Customers
     getFilteredData={getFilteredData}
     searchTerm={searchTerm}
     setSearchTerm={setSearchTerm}
     activeTab={activeTab}
     allCustomers={allCustomers}/>
)}

  </section>
</main>


{isModalOpen && (
<div className="modal-overlay" onClick={closeModal}>
<div className="modal-content" onClick={(e) => e.stopPropagation()}>
<div className="modal-header">
  <h3>Document Preview</h3>
  <button className="close-btn" onClick={closeModal}>&times;</button>
</div>
<div className="modal-body">
  {/* This displays the PDF or Image inside the dashboard */}
  <iframe 
    src={selectedDoc} 
    width="100%" 
    height="500px" 
    title="Document Preview"
  ></iframe>
</div>
</div>
</div>
)}




</div>
);
};

export default AdminDashboard;