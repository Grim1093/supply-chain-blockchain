import React from "react";
import Tilt from "react-parallax-tilt";
import { FaExchangeAlt } from "react-icons/fa";
import CreateProduct from "../components/CreateProduct";
import TransferProduct from "../components/TransferProduct";
import MyInventory from "../components/MyInventory"; // <--- IMPORT THIS

const Dashboard = ({ roleId }) => {
  React.useEffect(() => {
    console.log("📍 Dashboard Page Loaded. Current Role ID:", roleId);
  }, [roleId]);

  const tiltOptions = {
    tiltMaxAngleX: 5,
    tiltMaxAngleY: 5,
    scale: 1.02,
    transitionSpeed: 2500,
    glareEnable: true,
    glareMaxOpacity: 0.1,
    glarePosition: "bottom",
    glareBorderRadius: "12px"
  };

  return (
    <div className="page-container">
      {/* SECTION 1: ACTIONS */}
      <div className="section section-card">
        <div className="section-header action-header">
          <FaExchangeAlt /> Actions
        </div>
        
        <Tilt {...tiltOptions} glareColor="#3b82f6">
          <div className="card hover-card border-action">
            {roleId === 1 && <CreateProduct />}
            
            {/* Divider if both exist */}
            {roleId === 1 && <div className="section-divider"></div>}
            
            <TransferProduct />
          </div>
        </Tilt>
      </div>

      {/* SECTION 2: MY INVENTORY (New!) */}
      <Tilt {...tiltOptions} glareColor="#22c55e">
        <div className="card hover-card" style={{ marginTop: "24px", border: "1px solid #10b981" }}>
           <MyInventory roleId={roleId} />
        </div>
      </Tilt>
    </div>
  );
};

export default Dashboard;