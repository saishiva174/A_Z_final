
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../assets/logo.svg';
const Home = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="A-Z Services Logo" className="navbar-logo" />
          <span className="logo-text">A-Z SERVICES</span>
        </div>
        
        <div className="nav-actions">
          <Link to="/admin-login" className="login-link">Login</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-badge">Verified Local Professionals</div>
        <h1>Your home, <br/><span>perfectly managed.</span></h1>
        <p>Book trusted experts for repairs and maintenance, or grow your own service business today.</p>

        <div className="card-grid"> 
          <Link to="/customer-signup" className="action-card">
            <div className="card-icon">🏠</div>
            <h3>I need a Service</h3>
            <p>Find vetted experts for plumbing, electrical, cleaning, and more.</p>
            <span className="card-link">Browse Services →</span>
          </Link>

          <Link to="/pro-signup" className="action-card">
            <div className="card-icon">🛠️</div>
            <h3>Join as a Professional</h3>
            <p>Verify your identity, list your skills, and start earning today.</p>
            <span className="card-link">Apply Now →</span>
          </Link>
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