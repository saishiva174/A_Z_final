import { useNavigate, Link } from 'react-router-dom';
import './Home.css';
import logo from '../assets/logo.svg';

const Home = () => {
  const navigate = useNavigate();

  const handleActionClick = (targetRole) => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');

    // If token exists and matches the role, bypass login
    if (token && savedRole === targetRole) {
      navigate(`/${targetRole}-dashboard`);
    } else {
      // If no token or role mismatch, proceed to specific login
      // Clear storage if there was a mismatched role to avoid conflicts
      if (token && savedRole !== targetRole) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
      navigate(`/${targetRole}-login`);
    }
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="A-Z Services Logo" className="navbar-logo" />
          <span className="logo-text">A-Z SERVICES</span>
        </div>
        
        <div className="nav-actions">
          {/* Admin link stays standard or you can apply the same logic */}
          <Link to="/admin-login" className="login-link">Login</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-badge">Verified Local Professionals</div>
        <h1>Your home, <br/><span>perfectly managed.</span></h1>
        <p>Book trusted experts for repairs and maintenance, or grow your own service business today.</p>

        <div className="card-grid"> 
          {/* CUSTOMER CARD */}
          <div 
            onClick={() => handleActionClick('customer')} 
            className="action-card"
            role="button"
            style={{ cursor: 'pointer' }}
          >
            <div className="card-icon">🏠</div>
            <h3>I need a Service</h3>
            <p>Find vetted experts for plumbing, electrical, cleaning, and more.</p>
            <span className="card-link">Browse Services →</span>
          </div>

          {/* PROFESSIONAL CARD */}
          <div 
            onClick={() => handleActionClick('pro')} 
            className="action-card"
            role="button"
            style={{ cursor: 'pointer' }}
          >
            <div className="card-icon">🛠️</div>
            <h3>Join as a Professional</h3>
            <p>Verify your identity, list your skills, and start earning today.</p>
            <span className="card-link">Apply Now →</span>
          </div>
        </div>
      </main>

      <footer className="footer">
        <Link to="/" className="admin-portal-link">
          System Administration Console
        </Link>
      </footer>
    </div>
  );
};

export default Home;