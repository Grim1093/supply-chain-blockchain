import { useState, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { FaBox, FaSync, FaShippingFast, FaCheckCircle, FaHashtag } from "react-icons/fa";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function MyInventory({ roleId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchInventory() {
    console.log("--- START: Fetching Inventory ---");
    setLoading(true);
    
    // 🔹 FIX: Use a fixed ID so it doesn't pop up twice
    const toastId = "inventory-fetch"; 
    toast.loading("Scanning blockchain for your products...", { id: toastId });
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // 1. Get Total Count
      const count = await contract.productCount();
      console.log("Total products on chain:", count.toString());

      const myItems = [];

      // 2. Loop and Filter
      for (let i = 1; i <= count; i++) {
        const p = await contract.products(i);
        
        // Check ownership
        if (p.currentOwner.toLowerCase() === userAddress.toLowerCase()) {
           myItems.push({
             id: p.id.toString(),
             name: p.name,
             status: p.status.toString()
           });
        }
      }

      setProducts(myItems);
      console.log("Found items:", myItems.length);
      
      // Update the existing toast
      toast.success(`Found ${myItems.length} items`, { id: toastId });

    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  // Auto-load on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    if (status === "0") return <span className="badge badge-created"><FaBox /> Created</span>;
    if (status === "1") return <span className="badge badge-transit"><FaShippingFast /> In Transit</span>;
    if (status === "2") return <span className="badge badge-delivered"><FaCheckCircle /> Delivered</span>;
    return <span className="badge">Unknown</span>;
  };

  return (
    <div className="section section-card" style={{ marginTop: "24px" }}>
      <div className="section-header" style={{ justifyContent: "space-between" }}>
        <span><FaBox /> My Inventory</span>
        <button 
          onClick={fetchInventory} 
          disabled={loading}
          style={{ width: "auto", padding: "8px 12px", fontSize: "0.8rem", marginTop: 0 }}
        >
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="inventory-grid">
        {products.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
            No products found in your wallet.
          </div>
        ) : (
          products.map((item) => (
            <div key={item.id} className="inventory-item">
              <div className="item-header">
                <span className="item-id"><FaHashtag /> {item.id}</span>
                {getStatusBadge(item.status)}
              </div>
              <div className="item-name">{item.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyInventory;