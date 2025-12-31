import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom"; // 🔹 Critical Import
import { ethers } from "ethers";
import { FaSearch, FaBox, FaUserTie } from "react-icons/fa";
import { CONTRACT_ADDRESS, ABI } from "../contract";
import "../styles/app.css";

function Tracking() {
  const [searchId, setSearchId] = useState("");
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🔹 Hook to read the URL (e.g. ?id=1)
  const [searchParams] = useSearchParams();

  // Debug Log to prove new file is active
  useEffect(() => {
    console.log("🚀 TRACKING V2 LOADED");
  }, []);

  const handleTrack = useCallback(async (idToTrack) => {
    if (!idToTrack) return;
    
    console.log("🔎 Starting Search for ID:", idToTrack);
    setLoading(true);
    setProduct(null);
    setHistory([]);

    try {
      if (!window.ethereum) {
        alert("MetaMask not found!");
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // Fetch Product
      const p = await contract.products(idToTrack);
      
      if (p.id.toString() === "0") {
        console.warn("❌ Product ID not found on chain.");
        alert("Product ID not found!");
        setLoading(false);
        return;
      }

      setProduct({
        id: p.id.toString(),
        name: p.name,
        price: ethers.formatEther(p.price),
        isSold: p.isSold
      });

      // Fetch History
      const rawHistory = await contract.getProductHistory(idToTrack);
      const formattedHistory = rawHistory.map((h) => ({
        timestamp: new Date(Number(h.timestamp) * 1000).toLocaleString(),
        handler: h.handler,
        action: h.status.toString() 
      }));

      setHistory(formattedHistory);
      console.log("✅ Data Loaded Successfully");

    } catch (err) {
      console.error("🚨 Tracking Error:", err);
    }
    setLoading(false);
  }, []);

  // 🔹 AUTO-TRIGGER: Runs immediately if URL has ?id=X
  useEffect(() => {
    const urlId = searchParams.get("id");
    
    if (urlId) {
      console.log("🔗 URL Parameter Detected:", urlId);
      setSearchId(urlId); // Fill the input box visually
      handleTrack(urlId); // Run the search
    } else {
      console.log("ℹ️ No ID in URL");
    }
  }, [searchParams, handleTrack]);

  return (
    <div className="page-container">
      <h1 className="page-title">Global Shipment Tracking</h1>

      <div className="search-bar-container">
        <input 
          type="number" 
          placeholder="Enter Product ID..." 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="search-input"
        />
        <button className="cyber-btn" onClick={() => handleTrack(searchId)} disabled={loading}>
          {loading ? "Scanning..." : <><FaSearch /> Trace Asset</>}
        </button>
      </div>

      {product && (
        <div className="tracking-results">
          {/* Product Card */}
          <div className="product-card">
            <div className="card-icon"><FaBox /></div>
            <div>
              <h3>{product.name}</h3>
              <p>ID: #{product.id}</p>
              <p className="price-tag">{product.price} ETH</p>
            </div>
            <div className={`status-badge ${product.isSold ? "sold" : "active"}`}>
              {product.isSold ? "DELIVERED" : "IN TRANSIT"}
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline">
            {history.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>
                    {event.action === "0" && "📦 Manufactured"}
                    {event.action === "1" && "🚚 In Transit"}
                    {event.action === "2" && "✅ Delivered"}
                  </h4>
                  <p><FaUserTie /> {event.handler}</p>
                  <span className="time-stamp">{event.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracking;