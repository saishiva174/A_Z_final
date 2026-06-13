import { useState } from 'react';
import './AiSmartMatch.css';
import { FiStar, FiMapPin, FiCpu, FiAlertTriangle, FiSliders } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_AVATAR } from '../../utils/utils';
import { API_URL } from '../../apiConfig';

export const  AiSmartMatch = () => {
  const navigate = useNavigate();
  const [aiPros, setAiPros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, locating, ready, denied
  const [selectedService, setSelectedService] = useState('Plumber'); // Default filter

  const serviceCategories = ["AC Repair", "Appliance Repair", "Carpentry", "Cleaning & Sanitization", 
    "CCTV & Security", "Electrical Work", "Flooring & Tiling", "Gardening",
    "Home Automation", "Interior Design", "Masonry", "Painting", 
    "Packers & Movers", "Pest Control", "Plumbing", "Roofing", 
    "Solar Installation", "Wallpaper Decor", "Waterproofing", "Window Work"].sort();

  const activateSmartEngine = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus('locating');
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('ready');
        fetchRankedResults(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Customer location access denied:", error);
        setLocationStatus('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const fetchRankedResults = async (lat, lon) => {
    try {
      const token = localStorage.getItem('token');
      // POSTing selected service category along with customer live GPS vectors
      const res = await axios.post(
        `${API_URL}/api/pro/available-ai`, 
        { 
          service_type: selectedService,
          customer_lat: lat, 
          customer_lon: lon 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiPros(res.data);
    } catch (err) {
      console.error("AI Smart Match microservice error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-smart-match-view">
      {/* AI Feature Hero Banner */}
      <div className="ai-hero-banner">
        <div className="ai-icon-pulse"><FiCpu size={32} /></div>
        <h2>AI Smart Match Engine</h2>
        <p>Uses an optimized XGBoost ranking model and real-time spatial vectors to compute the absolute best matches.</p>
        
        {/* Category Filter Selector Built into AI Mode */}
        <div className="ai-filter-selector">
          <label><FiSliders /> Select Service Needed: </label>
          <select 
            value={selectedService} 
            onChange={(e) => {
              setSelectedService(e.target.value);
              if (locationStatus === 'ready') setAiPros([]); // Reset grid if they change category
            }}
            disabled={loading}
          >
            {serviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <button className="ai-activate-btn" onClick={activateSmartEngine} disabled={loading}>
          {loading ? "Computing Match Matrix..." : `Match Me With Best ${selectedService}s`}
        </button>
      </div>

      {locationStatus === 'denied' && (
        <div className="location-warning">
          <FiAlertTriangle /> Please enable location tracking to allow the AI to compute distance features.
        </div>
      )}

      {/* Grid displaying AI scored results */}
      {aiPros.length > 0 && (
        <div className="pro-grid">
          {aiPros.map((pro, index) => (
            <div key={pro.id} className={`pro-card ${index === 0 ? 'ultimate-match' : ''}`}>
              
              <div className="ai-percentage-badge">
                <FiCpu /> {pro.match_score}% Match Score
              </div>

              <div className="pro-card-image">
                <img src={pro.profile_pic_url || DEFAULT_AVATAR} alt={pro.name} />
                <span className="price-badge">{pro.rate}/hr</span>
              </div>
              
              <div className="pro-card-body">
                <span className="trade-label">{pro.service}</span>
                <h3>{pro.name}</h3>
                
                <div className="pro-meta">
                  <span className="rating"><FiStar /> {pro.rating || '5.0'} ({pro.total_reviews || 0})</span>
                  <span className="location"><FiMapPin /> {pro.location}</span>
                </div>

                {pro.ai_reason && (
                  <div className="shap-explanation-callout">
                    <span className="shap-pill">AI Determination</span>
                    <p>✨ {pro.ai_reason}</p>
                  </div>
                )}
                
                <button className="primary-btn full-width" onClick={() => navigate(`/pro-profile/${pro.id}`)}>
                  View Profile & Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

