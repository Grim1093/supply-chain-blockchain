import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaUserShield, FaExchangeAlt, FaSearch, FaSignOutAlt } from "react-icons/fa";
import "../styles/app.css";

const Navbar = ({ roleId, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? "nav-item active" : "nav-item";

  const handleLogout = () => {
    onLogout();       // Clear state in App.js
    navigate("/");    // Redirect to Home
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" style={{ fontWeight: "800", fontSize: "1.2rem", letterSpacing: "1px", color: "#f8fafc" }}>
        SupplyChain <span style={{ color: "#3b82f6" }}>V1</span>
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

        {/* 🔹 LOGOUT BUTTON */}
        <button 
          onClick={handleLogout} 
          className="nav-item" 
          style={{ 
            background: "transparent", 
            border: "none", 
            cursor: "pointer",
            marginLeft: "20px",
            borderLeft: "1px solid #334155",
            paddingLeft: "20px",
            borderRadius: "0",
            marginTop: "0",
            width: "auto"
          }}
        >
          <FaSignOutAlt style={{ color: "#ef4444" }} /> <span className="nav-text" style={{ color: "#ef4444" }}>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;