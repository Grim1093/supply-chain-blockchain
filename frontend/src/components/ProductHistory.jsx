import { useState, useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast"; // <--- Import Toast
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

  async function fetchHistory() {
    // 1. Reset & Validation
    setHistory([]);
    setCurrentOwner(null);

    if (!productId) {
      toast.error("Please enter a Product ID");
      return;
    }

    if (isNaN(productId) || Number(productId) <= 0) {
      toast.error("Product ID must be a valid number");
      return;
    }

    // 2. Loading Toast
    const toastId = toast.loading("Fetching product details...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // 1️⃣ Fetch product
      const product = await contract.products(productId);

      // 2️⃣ Fetch current owner role
      const roleId = await contract.roles(product.currentOwner);

      setCurrentOwner(product.currentOwner);
      setCurrentOwnerRole(roleText[Number(roleId)]);

      // 3️⃣ Fetch history
      const data = await contract.getProductHistory(productId);

      if (data.length === 0) {
        toast.error("No history found for this Product ID", { id: toastId });
        return;
      }

      setHistory(data);
      // 3. Success Toast
      toast.success("Product details loaded", { id: toastId });

    } catch (err) {
      console.error(err);
      // 4. Error Toast
      toast.error("Invalid Product ID or product does not exist", { id: toastId });
    }
  }

  return (
    <div ref={containerRef}>
      <h3>Product Timeline</h3>

      <div className="input-group">
        <input
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <button onClick={fetchHistory}>View Timeline</button>
      </div>

      {/* 🟢 CURRENT OWNER CARD (Dark Mode Optimized) */}
      {currentOwner && (
        <div 
          className="card owner-card" 
          style={{ 
            marginTop: "24px", 
            border: "1px solid #3b82f6", 
            background: "linear-gradient(145deg, #1e293b, #0f172a)" 
          }}
        >
          <h4 style={{ color: "#60a5fa", marginTop: 0 }}>📦 Current Owner</h4>
          <div className="timeline-meta" style={{ color: "#e2e8f0" }}>
            <strong style={{ color: "#94a3b8" }}>Role:</strong> {currentOwnerRole}
          </div>
          <div className="timeline-meta" style={{ color: "#e2e8f0" }}>
            <strong style={{ color: "#94a3b8" }}>Address:</strong> {shortAddr(currentOwner)}
          </div>
        </div>
      )}

      {/* 🟦 TIMELINE */}
      {history.length > 0 && (
        <div className="timeline">
          {history.map((h, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-title">
                Step {i + 1}: {statusText[Number(h.status)]} by{" "}
                {roleText[Number(h.role)]}
              </div>
              <div className="timeline-meta">
                Address: {shortAddr(h.handler)}
              </div>
              <div className="timeline-meta">
                Time:{" "}
                {new Date(Number(h.timestamp) * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductHistory;