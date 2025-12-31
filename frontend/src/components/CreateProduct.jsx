import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { FaBoxOpen, FaPlus, FaFingerprint, FaClipboardCheck } from "react-icons/fa"; 
import { CONTRACT_ADDRESS, ABI } from "../contract";
import { playSuccess, playError } from "../utils/audio";

function CreateProduct() {
  const [name, setName] = useState("");
  const [lastCreated, setLastCreated] = useState(null); // 🔹 Stores the new product details
  const [isCreating, setIsCreating] = useState(false);

  async function create() {
    console.log("--- START: Create Product Process ---");

    // 1. Validation
    if (!name.trim()) {
      console.error("Step 1 Failed: Name is empty");
      toast.error("Product name cannot be empty");
      return;
    }
    console.log("Step 1: Validation passed. Name:", name);

    setIsCreating(true);
    // 2. Loading Toast
    const toastId = toast.loading("Creating product on blockchain...");

    try {
      // Setup Provider
      console.log("Step 2: Initializing Provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("Step 3: Signer obtained:", userAddress);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      console.log("Step 4: Contract initialized.");

      // Check Role
      const userRole = await contract.roles(userAddress);
      if (userRole.toString() !== "1") {
        console.warn("FAILURE RISK: User is NOT a Manufacturer.");
      }

      // Send Transaction
      console.log("Step 6: Sending createProduct transaction...");
      const tx = await contract.createProduct(name);
      console.log("Step 6 Success: Transaction sent. Hash:", tx.hash);

      // Wait for Receipt
      console.log("Step 7: Waiting for confirmation...");
      const receipt = await tx.wait(); 
      console.log("Step 7 Result: Transaction mined in block:", receipt.blockNumber);
      

      // Fetch new ID
      const id = await contract.productCount();
      console.log("Step 8: Fetched new Product ID:", id.toString());
      playSuccess(); 
      
      // Success Message
      toast.success(`Product Created! ID: ${id.toString()}`, { id: toastId });

      // 🔹 UPDATE DASHBOARD STATE
      setLastCreated({
        id: id.toString(),
        name: name,
        hash: tx.hash
      });

      setName("");
      console.log("--- END: Success ---");

    } catch (err) {
      console.error("--- FAILURE POINT ---");
      console.error(err);
      playError();
      toast.error("Transaction failed. Check console.", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: "20px" }}>
         <FaBoxOpen /> Manufacturer Console
      </div>

      {/* 🔹 INPUT AREA */}
      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
        <h4 style={{ color: "#94a3b8", marginTop: 0 }}>New Production Run</h4>
        
        <div className="input-group">
          <input
            placeholder="Enter Product Name (e.g. Nike Air Jordan)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
          />
          <button 
            onClick={create} 
            disabled={isCreating}
            style={{ minWidth: "120px", background: isCreating ? "#475569" : "#2563eb" }}
          >
            {isCreating ? "Minting..." : <><FaPlus style={{ marginRight: "8px"}}/> Create</>}
          </button>
        </div>
      </div>

      {/* 🔹 RECENT ACTIVITY "TICKET" (Only shows after creation) */}
      {lastCreated && (
        <div style={{ marginTop: "20px", animation: "fadeIn 0.5s ease-out" }}>
          <div className="section-header" style={{ color: "#22c55e", fontSize: "0.9rem" }}>
            <FaClipboardCheck /> Recent Output
          </div>
          
          <div style={{ 
            background: "linear-gradient(145deg, #064e3b 0%, #065f46 100%)", 
            border: "1px solid #10b981", 
            borderRadius: "12px", 
            padding: "16px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Background Decor */}
            <FaFingerprint style={{ position: "absolute", right: "-10px", bottom: "-20px", fontSize: "100px", opacity: "0.1", color: "#fff" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#a7f3d0", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Product ID</span>
              <span style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px", color: "#fff", fontFamily: "monospace" }}>#{lastCreated.id}</span>
            </div>
            
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
              {lastCreated.name}
            </div>

            <div style={{ fontSize: "0.8rem", color: "#6ee7b7", wordBreak: "break-all" }}>
              Tx: {lastCreated.hash.slice(0, 20)}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateProduct;