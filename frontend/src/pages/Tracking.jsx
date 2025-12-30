import React from "react";
import Tilt from "react-parallax-tilt";
import { FaSearch } from "react-icons/fa";
import ProductHistory from "../components/ProductHistory";

const Tracking = () => {
  React.useEffect(() => {
    console.log("📍 Tracking Page Loaded");
  }, []);

  const tiltOptions = {
    tiltMaxAngleX: 5,
    tiltMaxAngleY: 5,
    scale: 1.0,
    transitionSpeed: 2500,
    glareEnable: true,
    glareColor: "#22c55e",
    glareMaxOpacity: 0.1,
    glarePosition: "bottom",
    glareBorderRadius: "12px"
  };

  return (
    <div className="page-container">
      <div className="section section-card">
        <div className="section-header verify-header">
          <FaSearch /> Product Verification
        </div>
        <Tilt {...tiltOptions}>
          <div className="card hover-card border-verify" style={{ minHeight: "100%" }}>
            <ProductHistory />
          </div>
        </Tilt>
      </div>
    </div>
  );
};

export default Tracking;
