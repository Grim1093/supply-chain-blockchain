import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaUserShield, FaExchangeAlt, FaSearch, FaSignOutAlt, FaCube } from "react-icons/fa";
import "../styles/app.css";

const Navbar = ({ roleId, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? "nav-item active" : "nav-item";

  const handleLogout = () => {
    onLogout();       
    navigate("/");    
  };

  return (
    <nav className="navbar">
      {/* 🔹 LOGO SECTION (Cleaned Up) */}
      <div 
        className="nav-logo-wrapper" 
        onClick={() => navigate("/")} 
        // REMOVED: title="Go to Profile"
      >
        <div className="logo-icon">
          <FaCube />
        </div>
        <span className="logo-text">SCP</span>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={isActive("/")}>
          <FaUserCircle /> <span className="nav-text">Profile</span>
        </Link>

        {roleId === 1 && (
          <Link to="/admin" className={isActive("/admin")}>
            <FaUserShield /> <span className="nav-text">Admin</span>
          </Link>
        )}

        {(roleId === 1 || roleId === 2) && (
          <Link to="/dashboard" className={isActive("/dashboard")}>
            <FaExchangeAlt /> <span className="nav-text">Actions</span>
          </Link>
        )}

        <Link to="/track" className={isActive("/track")}>
          <FaSearch /> <span className="nav-text">Track</span>
        </Link>

        <button 
          onClick={handleLogout} 
          className="nav-item logout-btn"
        >
          <FaSignOutAlt /> <span className="nav-text">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;