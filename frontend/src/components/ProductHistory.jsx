import { useState } from "react";
import { ethers } from "ethers";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchHistory() {
    setError("");
    setSuccess("");
    setHistory([]);
    setCurrentOwner(null);

    if (!productId) {
      setError("Please enter a Product ID");
      return;
    }

    if (isNaN(productId) || Number(productId) <= 0) {
      setError("Product ID must be a valid number");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        provider
      );

      // 1️⃣ Fetch product
      const product = await contract.products(productId);

      // 2️⃣ Fetch current owner role
      const roleId = await contract.roles(product.currentOwner);

      setCurrentOwner(product.currentOwner);
      setCurrentOwnerRole(roleText[Number(roleId)]);

      // 3️⃣ Fetch history
      const data = await contract.getProductHistory(productId);

      if (data.length === 0) {
        setError("No history found for this Product ID");
        return;
      }

      setHistory(data);
      setSuccess("Product details loaded");
    } catch {
      setError("Invalid Product ID or product does not exist");
    }
  }

  return (
    <div className="card">
      <h3>Product Timeline</h3>

      <input
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />

      <button onClick={fetchHistory}>View Timeline</button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* 🟢 CURRENT OWNER CARD */}
      {currentOwner && (
        <div className="card" style={{ marginTop: "15px" }}>
          <h4>📦 Current Owner</h4>
          <div className="timeline-meta">
            <strong>Role:</strong> {currentOwnerRole}
          </div>
          <div className="timeline-meta">
            <strong>Address:</strong> {shortAddr(currentOwner)}
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
                {new Date(
                  Number(h.timestamp) * 1000
                ).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductHistory;
