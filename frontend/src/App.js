import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Tracking from "./pages/Tracking";

import { CONTRACT_ADDRESS, ABI } from "./contract";
import "./styles/app.css";

function App() {
  const [account, setAccount] = useState(null);
  const [roleId, setRoleId] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Blocks rendering until ready

  // 🔹 UNIFIED INITIALIZATION (Fixes the Refresh Bug)
  useEffect(() => {
    const init = async () => {
      // 1. Check if MetaMask is installed
      if (window.ethereum) {
        try {
          // 2. Check if user is already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);

            // 3. ⚡ FETCH ROLE IMMEDIATELY (Before rendering)
            // We do this here so roleId is ready exactly when isLoading becomes false
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            const id = await contract.roles(currentAccount);
            setRoleId(Number(id));
            console.log("✅ Session Restored. Role:", Number(id));
          }
        } catch (error) {
          console.error("Initialization error:", error);
        }
      }
      
      // 4. Finish Loading (Only now do we render the Routes)
      setIsLoading(false);
    };

    init();
    
    // Optional: Listen for account changes in MetaMask (e.g. user switches wallet)
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        window.location.reload(); // Simplest way to handle account switch is reload
      });
    }
  }, []);

  const logout = () => {
    setAccount(null);
    setRoleId(0);
  };

  // 🔹 LOADING SCREEN (Prevents "Access Denied" redirects while checking)
  if (isLoading) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        background: "#0f172a", 
        color: "#38bdf8",
        fontFamily: '"Rajdhani", sans-serif',
        fontSize: "1.5rem",
        letterSpacing: "0.1em"
      }}>
        INITIALIZING SECURE LINK...
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: '"Rajdhani", sans-serif',
            },
          }}
        />

        {account && <Navbar roleId={roleId} onLogout={logout} />}

        <div className="main-content">
          <Routes>
            {/* Home Route */}
            <Route 
              path="/" 
              element={<Home account={account} setAccount={setAccount} />} 
            />

            {/* Admin Route - Protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute roleId={roleId} allowedRoles={[1]}>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Dashboard Route - Protected */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute roleId={roleId} allowedRoles={[1, 2]}>
                  <Dashboard roleId={roleId} />
                </ProtectedRoute>
              } 
            />

            {/* Tracking Route */}
            <Route path="/track" element={<Tracking />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;