import React from "react";
import Tilt from "react-parallax-tilt";
import { FaUserShield } from "react-icons/fa";
import AssignRole from "../components/AssignRole";

const Admin = () => {
  // Log for debugging
  React.useEffect(() => {
    console.log("📍 Admin Page Loaded");
  }, []);

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
      <div className="section section-card">
        <div className="section-header admin-header">
          <FaUserShield /> Admin Panel
        </div>
        <Tilt {...tiltOptions} glareColor="#ef4444">
          <div className="card hover-card border-admin">
            <AssignRole />
          </div>
        </Tilt>
      </div>
    </div>
  );
};

export default Admin;