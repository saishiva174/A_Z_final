import  { useEffect,useState } from 'react'
import './TabView.css'
import { FiSearch ,FiStar,FiMapPin} from 'react-icons/fi'
import axios from 'axios'
const DEFAULT_AVATAR = `/uploads/defaults/default_avatar.jpg`;
import ViewProfessional from './ViewProfessional';
const TabView = () => {
 
  useEffect(()=>{
   fetchPros();
  },[])

  const [availablePros,setavailablePros] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading,setLoading]=useState(true);
  const [selectedProId, setSelectedProId] = useState(null);
  const fetchPros = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token'); // Get user token

        const res = await axios.get('/api/pro/available', {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
        
        setavailablePros(res.data);
      
        
    } catch (err) {
        console.error("Error loading professionals", err);
    } finally {
        setLoading(false);
    }
};
    
   const filteredPros = availablePros.filter(pro => 
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pro.service.toLowerCase().includes(searchQuery.toLowerCase())||
    pro.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

   if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loader"></div> 
        <p>Loading details...</p>
      </div>
    );
  }
   if (selectedProId) {
    return (
      <ViewProfessional 
        proId={selectedProId} 
        onBack={() => setSelectedProId(null)} 
      />
    );
  }
  return (
    <div className="tab-view">
                <header className="view-header">
                  <div>
                    <h1>Find a Professional</h1>
                    <p>Book top-rated experts for your home needs</p>
                  </div>
                  <div className="header-search">
                    <FiSearch />
                    <input 
                      type="text" 
                      placeholder="Search service or name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </header>
                {loading && <div className="loader">Searching for experts...</div>}
    
                <div className="pro-grid">
                  {filteredPros.length > 0 ? filteredPros.map(pro => (
                    <div key={pro.id} className="pro-card">
                      <div className="pro-card-image">
                        <img src={pro.profile_pic_url?pro.profile_pic_url:DEFAULT_AVATAR} alt={pro.name} />
                        <span className="price-badge">{pro.rate}</span>
                      </div>
                      <div className="pro-card-body">
                        <span className="trade-label">{pro.service}</span>
                        <h3>{pro.name}</h3>
                        <div className="pro-meta">
                          <span className="rating"><FiStar /> {pro.rating} ({pro.review_count})</span>
                          <span className="location"><FiMapPin /> {pro.location}</span>
                        </div>
                        <button className="primary-btn full-width" onClick={()=>setSelectedProId(pro.id)}>View Profile & Book</button>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">No professionals match your search.</div>
                  )}
                </div>
              </div>
  )
}

export default TabView
