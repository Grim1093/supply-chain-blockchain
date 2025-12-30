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
  const [isLoading, setIsLoading] = useState(true); 

  // 1. INITIALIZATION (Handles Refresh & Persistence)
  useEffect(() => {
    const init = async () => {
      // 🔹 CHECK 1: Only auto-connect if the user didn't logout previously
      const shouldAutoConnect = localStorage.getItem("isConnected") === "true";

      if (window.ethereum && shouldAutoConnect) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);

            // Fetch role immediately
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            const id = await contract.roles(currentAccount);
            setRoleId(Number(id));
          }
        } catch (error) {
          console.error("Initialization error:", error);
        }
      }
      setIsLoading(false);
    };
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

  // 2. ROLE LISTENER (Handles New Logins)
  useEffect(() => {
    async function fetchRole() {
      if (!account) {
        setRoleId(0);
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const id = await contract.roles(account);
        console.log("👤 Account Changed. New Role ID:", Number(id)); 
        setRoleId(Number(id));
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    }
    if (!isLoading) { 
      fetchRole();
    }
  }, [account, isLoading]);

  // 3. LOGOUT FUNCTION
  const logout = () => {
    setAccount(null);
    setRoleId(0);
    // 🔹 NEW: Clear the storage flag so refresh doesn't auto-login
    localStorage.removeItem("isConnected");
  };

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