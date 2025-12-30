import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Tilt from "react-parallax-tilt"; 
import { FaUserCircle, FaCube } from "react-icons/fa"; // Added FaCube
import WalletConnect from "../components/WalletConnect";
import UserRole from "../components/UserRole";

gsap.registerPlugin(useGSAP);

const Home = ({ account, setAccount }) => {
  const containerRef = useRef();
  const heroRef = useRef();

  useGSAP(() => {
    // 1. Hero Animation (Only runs if NOT logged in)
    if (!account) {
      // Float the cube
      gsap.to(".hero-icon", {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Fade in elements
      const tl = gsap.timeline();
      tl.from(".hero-title", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
        .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
        .from(".connect-btn-wrapper", { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.3");
    } 
    
    // 2. Profile Animation (Only runs if LOGGED IN)
    else {
      gsap.fromTo(".info-card", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [account] });

  // Tilt settings for cards
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
    <div className="page-container" ref={containerRef}>
      
      {!account ? (
        /* 🔵 NOT CONNECTED: HERO SECTION */
        <div className="hero-wrapper" ref={heroRef}>
          <div className="hero-glow"></div>
          
          <div className="hero-icon">
            <FaCube />
          </div>

          <h1 className="hero-title">Supply Chain <br /> Protocol</h1>
          <p className="hero-subtitle">
            Immutable. Transparent. Secure.<br />
            Connect your wallet to access the decentralized ledger.
          </p>

          <div className="connect-btn-wrapper">
            <WalletConnect setAccount={setAccount} />
          </div>

          {/* Decorative Grid Lines */}
          <div className="grid-line" style={{ top: '10%', left: 0, width: '100%', height: '1px' }}></div>
          <div className="grid-line" style={{ bottom: '10%', left: 0, width: '100%', height: '1px' }}></div>
        </div>
      ) : (
        /* 🟢 CONNECTED: PROFILE SECTION */
        <div className="center-content">
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Dashboard Access Granted</h2>
          
          <div className="section-header" style={{ justifyContent: 'center' }}>
            <FaUserCircle /> Identity Verified
          </div>
          
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Tilt {...tiltOptions}> 
              <div className="card hover-card info-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                    <h4 style={{ color: '#94a3b8' }}>Connected Wallet</h4>
                    <span className="wallet-address" style={{ fontSize: '1.2em' }}>{account}</span>
                  </div>

                  <div>
                     <h4 style={{ color: '#94a3b8' }}>System Role</h4>
                     <UserRole account={account} />
                  </div>

                </div>
              </div>
            </Tilt>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;