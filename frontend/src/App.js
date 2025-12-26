import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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

  // 🔹 ANIMATION: Entrance
  useGSAP(() => {
    gsap.from(".app-title", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
    
    if (!account) {
      gsap.from(".login-container", { scale: 0.8, opacity: 0, duration: 0.8, ease: "back.out(1.7)" });
    } else {
      // Cascade: Top Section -> Columns
      const tl = gsap.timeline();
      
      tl.fromTo(".top-section", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );

      tl.fromTo(".bento-column", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
        "-=0.4" // Start overlapping slightly with previous animation
      );
    }
  }, { scope: appRef, dependencies: [account] });

  return (
    <div className="container" ref={appRef}>
      <h1 className="app-title">Supply Chain Tracker</h1>

      {!account ? (
        <div className="login-container">
          <WalletConnect setAccount={setAccount} />
        </div>
      ) : (
        <>
          {/* 🔹 TOP SECTION: User Info (Full Width) */}
          <div className="section section-card top-section">
            <div className="section-header">
              <FaUserCircle /> User Information
            </div>
            <div className="card hover-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ margin: 0 }}><strong>Wallet:</strong> <span className="wallet-address">{account}</span></p>
                <UserRole account={account} />
              </div>
            </div>
          </div>

          {/* 🔹 BENTO GRID LAYOUT (Two separate linear stacks below) */}
          <div className="bento-container">
            
            {/* 👈 LEFT COLUMN: Admin & Actions */}
            <div className="bento-column">
              
              {/* Admin Panel */}
              {roleId === 1 && (
                <div className="section section-card">
                  <div className="section-header admin-header">
                    <FaUserShield /> Admin Panel
                  </div>
                  <div className="card hover-card border-admin">
                    <AssignRole />
                  </div>
                </div>
              )}

              {/* Supply Chain Actions */}
              {(roleId === 1 || roleId === 2) && (
                <div className="section section-card">
                  <div className="section-header action-header">
                    <FaExchangeAlt /> Actions
                  </div>
                  <div className="card hover-card border-action">
                    {roleId === 1 && <CreateProduct />}
                    <TransferProduct />
                  </div>
                </div>
              )}
            </div>

            {/* 👉 RIGHT COLUMN: Verification & History */}
            <div className="bento-column">
              <div className="section section-card">
                <div className="section-header verify-header">
                  <FaSearch /> Product Verification
                </div>
                <div className="card hover-card" style={{ minHeight: "100%" }}>
                  <ProductHistory />
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default App;