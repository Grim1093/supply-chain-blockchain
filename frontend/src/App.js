import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Tilt from "react-parallax-tilt"; // <--- 1. Import Tilt
import {
  FaUserCircle,
  FaUserShield,
  FaExchangeAlt,
  FaSearch
} from "react-icons/fa";
import WalletConnect from "./components/WalletConnect";
import AssignRole from "./components/AssignRole";
import CreateProduct from "./components/CreateProduct";
import TransferProduct from "./components/TransferProduct";
import ProductHistory from "./components/ProductHistory";
import UserRole from "./components/UserRole";

import { CONTRACT_ADDRESS, ABI } from "./contract";
import "./styles/app.css";

gsap.registerPlugin(useGSAP);

function App() {
  const [account, setAccount] = useState(null);
  const [roleId, setRoleId] = useState(0);
  const appRef = useRef();

  useEffect(() => {
    async function fetchRole() {
      if (!account) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      try {
        const id = await contract.roles(account);
        setRoleId(Number(id));
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    }
    fetchRole();
  }, [account]);

  // 隼 ANIMATION: Entrance
  useGSAP(() => {
    gsap.from(".app-title", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
    
    if (!account) {
      gsap.from(".login-container", { scale: 0.8, opacity: 0, duration: 0.8, ease: "back.out(1.7)" });
    } else {
      const tl = gsap.timeline();
      tl.fromTo(".top-section", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
      tl.fromTo(".bento-column", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, { scope: appRef, dependencies: [account] });

  // Common configuration for the tilt effect
  const tiltOptions = {
    tiltMaxAngleX: 10,
    tiltMaxAngleY: 10,
    scale: 1.02,
    transitionSpeed: 2500, // Smooth return
    glareEnable: true,
    glareMaxOpacity: 0.3,
    glarePosition: "bottom",
    glareBorderRadius: "20px" // Matches your CSS border-radius
  };

  return (

    
    <div className="container" ref={appRef}>
      
      <h1 className="app-title">Supply Chain Tracker</h1>

      {!account ? (
        <div className="login-container">
          <WalletConnect setAccount={setAccount} />
        </div>
      ) : (
        <>
          {/* 隼 TOP SECTION: User Info */}
          <div className="section section-card top-section">
            <div className="section-header">
              <FaUserCircle /> User Information
            </div>
            {/* Wrap the card with Tilt */}
            <Tilt {...tiltOptions}> 
              <div className="card hover-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <p style={{ margin: 0 }}><strong>Wallet:</strong> <span className="wallet-address">{account}</span></p>
                  <UserRole account={account} />
                </div>
              </div>
            </Tilt>
          </div>

          <div className="bento-container">
            
            {/* 争 LEFT COLUMN */}
            <div className="bento-column">
              
              {roleId === 1 && (
                <div className="section section-card">
                  <div className="section-header admin-header">
                    <FaUserShield /> Admin Panel
                  </div>
                  <Tilt {...tiltOptions} glareColor="#d32f2f">
                    <div className="card hover-card border-admin">
                      <AssignRole />
                    </div>
                  </Tilt>
                </div>
              )}

              {(roleId === 1 || roleId === 2) && (
                <div className="section section-card">
                  <div className="section-header action-header">
                    <FaExchangeAlt /> Actions
                  </div>
                  <Tilt {...tiltOptions} glareColor="#1976d2">
                    <div className="card hover-card border-action">
                      {roleId === 1 && <CreateProduct />}
                      <TransferProduct />
                    </div>
                  </Tilt>
                </div>
              )}
            </div>

            {/* 痩 RIGHT COLUMN */}
            <div className="bento-column">
              <div className="section section-card">
                <div className="section-header verify-header">
                  <FaSearch /> Product Verification
                </div>
                {/* For long content like history, we might disable scale to prevent blurriness */}
                <Tilt {...tiltOptions} scale={1.0} glareColor="#2e7d32">
                  <div className="card hover-card" style={{ minHeight: "100%" }}>
                    <ProductHistory />
                  </div>
                </Tilt>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default App;