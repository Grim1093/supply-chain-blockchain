import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function ProductHistory() {
  const [productId, setProductId] = useState("");
  const [history, setHistory] = useState([]);

  async function fetchHistory() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );

    const data = await contract.getProductHistory(productId);
    setHistory(data);
  }

  return (
    <div className="card">
      <h3>Product History</h3>
      <input
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />
      <button onClick={fetchHistory}>View</button>

      <ul>
        {history.map((h, i) => (
          <li key={i}>
            {h.handler} | Role: {Number(h.role)} | Status: {Number(h.status)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductHistory;
