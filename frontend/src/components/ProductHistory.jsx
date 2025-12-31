import { useState, useRef, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSearchParams } from "react-router-dom"; // 🔹 1. Import Router Hook
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";
import { FaSearch, FaMapMarkerAlt, FaClock, FaUser, FaCheckCircle, FaTruck, FaBox } from "react-icons/fa";
import { CONTRACT_ADDRESS, ABI } from "../contract";

const roleText = ["None", "Manufacturer", "Distributor", "Retailer"];
const statusText = ["Created", "In Transit", "Delivered"];

const shortAddr = (addr) =>
  addr.slice(0, 6) + "..." + addr.slice(-4);

function ProductHistory() {
  const [productId, setProductId] = useState("");
  const [history, setHistory] = useState([]);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [currentOwnerRole, setCurrentOwnerRole] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🔹 2. Initialize URL Params
  const [searchParams] = useSearchParams();
  
  const containerRef = useRef();

  // 🔹 ANIMATION: Stagger Timeline & Cards
  useGSAP(() => {
    if (currentOwner) {
      gsap.fromTo(".owner-card", 
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
    
    if (history.length > 0) {
      gsap.fromTo(".timeline-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.15, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [history, currentOwner] });

  // 🔹 3. Refactored Fetch Function (Wrapped in useCallback)
  // Accepts 'customId' to allow immediate search from URL
  const fetchHistory = useCallback(async (customId = null) => {
    // If customId is passed (from URL), use it. Otherwise use state.
    const targetId = customId || productId;

    console.log("--- START: Fetch Product History ---");

    // 1. Reset & Validation
    setHistory([]);
    setCurrentOwner(null);

    if (!targetId) {
      console.error("Step 1 Failed: No Product ID");
      toast.error("Please enter a Product ID");
      return;
    }

    if (isNaN(targetId) || Number(targetId) <= 0) {
      console.error("Step 1 Failed: Invalid ID:", targetId);
      toast.error("Product ID must be a valid number");
      return;
    }
    console.log("Step 1: Validation passed. Searching for ID:", targetId);

    setLoading(true);
    const toastId = toast.loading("Tracing product on blockchain...");

    try {
      console.log("Step 2: Initializing Provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // 1️⃣ Fetch product details
      console.log("Step 3: Fetching product struct...");
      const product = await contract.products(targetId);
      console.log("Step 3 Data:", product);

      if (product.id.toString() === "0") { 
         throw new Error("Product does not exist");
      }

      // 2️⃣ Fetch current owner role
      console.log("Step 4: Fetching owner role for:", product.currentOwner);
      const roleId = await contract.roles(product.currentOwner);
      
      setCurrentOwner(product.currentOwner);
      setCurrentOwnerRole(roleText[Number(roleId)]);
      console.log("Step 4 Data: Owner Role:", roleText[Number(roleId)]);

      // 3️⃣ Fetch history array
      console.log("Step 5: Fetching history array...");
      const data = await contract.getProductHistory(targetId);
      console.log(`Step 5 Success: Found ${data.length} history records.`);

      if (data.length === 0) {
        toast.error("No history records found (Fresh Product?)", { id: toastId });
      } else {
        const formattedHistory = data.map((item) => ({
            ...item,
            // Convert BigInts to Strings/Numbers for easier handling if needed
            status: item.status,
            role: item.role,
            timestamp: item.timestamp,
            handler: item.handler
        }));
        setHistory(formattedHistory);
        toast.success("Tracking Data Received", { id: toastId });
      }
      
      console.log("--- END: Success ---");

    } catch (err) {
      console.error("--- FAILURE POINT ---");
      console.error(err);
      
      if (err.message.includes("Product does not exist")) {
          toast.error(`Product #${targetId} not found on chain`, { id: toastId });
      } else {
          toast.error("Failed to fetch details.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  }, [productId]); // End of fetchHistory

  // 🔹 4. AUTO-TRIGGER: Runs on Page Load if URL has ?id=X
  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      console.log("🔗 Deep Link Detected:", urlId);
      setProductId(urlId); // Fill the input box visually
      fetchHistory(urlId); // Run the search immediately
    }
  }, [searchParams, fetchHistory]);

  // Helper for Icons based on status
  const getStatusIcon = (status) => {
    if (status === 0n) return <FaBox />; // Created
    if (status === 1n) return <FaTruck />; // Transit
    if (status === 2n) return <FaCheckCircle />; // Delivered
    return <FaClock />;
  };

  return (
    <div ref={containerRef}>
      <div className="section-header verify-header" style={{ marginBottom: "20px" }}>
        <FaSearch /> Global Tracking Hub
      </div>

      {/* 🔹 SEARCH BAR */}
      <div className="input-group">
        <input
          placeholder="Enter Product ID to Trace..."
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          disabled={loading}
          style={{ marginBottom: 0 }}
          type="number"
        />
        <button 
          onClick={() => fetchHistory()} 
          disabled={loading}
          style={{ width: "auto", minWidth: "100px", background: loading ? "#475569" : "#22c55e", marginBottom: 0 }}
        >
          {loading ? "Tracing..." : "Track"}
        </button>
      </div>

      {/* 🟢 CURRENT OWNER CARD */}
      {currentOwner && (
        <div 
          className="card owner-card" 
          style={{ 
            marginTop: "24px", 
            border: "1px solid #22c55e", 
            background: "linear-gradient(145deg, #064e3b 0%, #065f46 100%)" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <FaMapMarkerAlt style={{ color: "#4ade80", fontSize: "1.2rem" }} />
            <h4 style={{ color: "#fff", margin: 0, fontSize: "1.1rem" }}>Current Location</h4>
          </div>
          
          <div className="timeline-meta" style={{ color: "#e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Held By: <strong style={{ color: "#86efac" }}>{currentOwnerRole}</strong></span>
            <span style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px", fontFamily: "monospace" }}>
              {shortAddr(currentOwner)}
            </span>
          </div>
        </div>
      )}

      {/* 🟦 TIMELINE */}
      {history.length > 0 && (
        <div className="timeline">
          {history.map((h, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#38bdf8" }}>{getStatusIcon(h.status)}</span>
                {statusText[Number(h.status)]}
              </div>
              
              <div className="timeline-meta">
                <FaUser style={{ fontSize: "0.7rem", marginRight: "6px" }} />
                Handler: {roleText[Number(h.role)]}
              </div>
              
              <div className="timeline-meta">
                <FaClock style={{ fontSize: "0.7rem", marginRight: "6px" }} />
                {new Date(Number(h.timestamp) * 1000).toLocaleString()}
              </div>
              
              <div className="timeline-meta" style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "4px" }}>
                {shortAddr(h.handler)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductHistory;