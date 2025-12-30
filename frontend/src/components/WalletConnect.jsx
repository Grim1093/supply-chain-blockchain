import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

function WalletConnect({ setAccount }) {
  const [isConnecting, setIsConnecting] = useState(false);

  async function connect() {
    if (!window.ethereum) {
      toast.error("MetaMask not found. Please install it!");
      return;
    }

    setIsConnecting(true);
    const toastId = toast.loading("Connecting wallet...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      setAccount(accounts[0]);
      
      // 🔹 NEW: Save "Logged In" state to Local Storage
      localStorage.setItem("isConnected", "true");
      
      toast.success("Wallet connected!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Connection rejected", { id: toastId });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div style={{ display: "inline-block" }}>
      <button 
        className="cyber-btn"
        onClick={connect} 
        disabled={isConnecting}
        style={{ 
          opacity: isConnecting ? 0.7 : 1,
          cursor: isConnecting ? "not-allowed" : "pointer"
        }}
      >
        {isConnecting ? "Initializing Link..." : "Initialize Uplink"} 
      </button>
    </div>
  );
}

export default WalletConnect;