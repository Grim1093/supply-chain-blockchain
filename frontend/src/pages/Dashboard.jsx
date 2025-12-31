import React, { useState } from "react";
import Tilt from "react-parallax-tilt";
import { FaExchangeAlt, FaQrcode, FaBoxOpen } from "react-icons/fa";
import QRCode from "react-qr-code"; // 🔹 Import QR Library

// Components
import CreateProduct from "../components/CreateProduct";
import TransferProduct from "../components/TransferProduct";
import MyInventory from "../components/MyInventory";

import "../styles/app.css";

const Dashboard = ({ roleId }) => {
  // 🔹 State for QR Generator
  const [qrId, setQrId] = useState("");

  React.useEffect(() => {
    console.log("📍 Dashboard Page Loaded. Current Role ID:", roleId);
  }, [roleId]);

  const tiltOptions = {
    tiltMaxAngleX: 3, // Reduced slightly for better usability with forms
    tiltMaxAngleY: 3,
    scale: 1.01,
    transitionSpeed: 2500,
    glareEnable: true,
    glareMaxOpacity: 0.1,
    glarePosition: "bottom",
    glareBorderRadius: "12px"
  };

  return (
    <div className="page-container">
      <h1 className="page-title">
        {roleId === 1 ? "Manufacturer Console" : "Logistics Hub"}
      </h1>

      {/* 🔹 GRID LAYOUT: Actions (Left) | QR Tool (Right) */}
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: ACTIONS */}
        <div className="action-section">
          <div className="section-header action-header" style={{ marginBottom: "10px", color: "#38bdf8" }}>
            <FaExchangeAlt /> Actions
          </div>

          <Tilt {...tiltOptions} glareColor="#3b82f6">
            <div className="card hover-card border-action" style={{ height: "100%" }}>
              {roleId === 1 && <CreateProduct />}
              
              {/* Divider if both exist (Manufacturer view) */}
              {roleId === 1 && <div className="section-divider"></div>}
              
              <TransferProduct />
            </div>
          </Tilt>
        </div>

        {/* RIGHT COLUMN: QR GENERATOR (Manufacturer Only) */}
        {roleId === 1 && (
          <div className="tools-section">
            <div className="section-header" style={{ marginBottom: "10px", color: "#f472b6" }}>
              <FaQrcode /> Label Generator
            </div>

            <Tilt {...tiltOptions} glareColor="#f472b6">
              <div className="cyber-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "15px" }}>
                  Generate physical labels for shipment boxes.
                </p>
                
                <input 
                  type="number" 
                  placeholder="Enter Product ID (e.g. 1)" 
                  value={qrId}
                  onChange={(e) => setQrId(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: "20px" }}
                />

                {/* QR Display Area */}
                {qrId ? (
                  <div style={{ 
                    background: "white", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    width: "fit-content", 
                    margin: "0 auto",
                    border: "4px solid #fff" 
                  }}>
                    <QRCode 
                      value={`${window.location.origin}/track?id=${qrId}`} 
                      size={140} 
                    />
                  </div>
                ) : (
                  <div style={{ 
                    height: "140px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    border: "2px dashed #334155", 
                    borderRadius: "8px",
                    color: "#475569"
                  }}>
                    <span>Enter ID to Generate</span>
                  </div>
                )}
                
                {qrId && (
                  <p style={{ textAlign: "center", marginTop: "15px", fontSize: "0.8rem", color: "#64748b" }}>
                    Scan with phone to track
                  </p>
                )}
              </div>
            </Tilt>
          </div>
        )}
      </div>

      {/* 🔹 BOTTOM SECTION: MY INVENTORY */}
      <div style={{ marginTop: "40px" }}>
        <div className="section-header" style={{ marginBottom: "10px", color: "#22c55e" }}>
          <FaBoxOpen /> Live Inventory
        </div>
        
        <Tilt {...tiltOptions} glareColor="#22c55e">
          <div className="card hover-card" style={{ border: "1px solid rgba(34, 197, 94, 0.3)" }}>
             <MyInventory roleId={roleId} />
          </div>
        </Tilt>
      </div>

    </div>
  );
};

export default Dashboard;