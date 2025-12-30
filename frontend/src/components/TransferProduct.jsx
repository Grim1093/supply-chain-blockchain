import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast"; 
import { FaShippingFast, FaPaperPlane, FaReceipt, FaExchangeAlt, FaUserTag } from "react-icons/fa";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function TransferProduct() {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransfer, setLastTransfer] = useState(null); // 🔹 Stores receipt

  async function transfer() {
    console.log("--- START: Transfer Product Process ---");

    // 1. Validation
    if (!productId || !to) {
      console.error("Step 1 Failed: Missing fields.");
      toast.error("All fields are required");
      return;
    }

    if (isNaN(productId) || Number(productId) <= 0) {
      console.error("Step 1 Failed: Invalid Product ID:", productId);
      toast.error("Product ID must be a valid number");
      return;
    }

    if (!ethers.isAddress(to)) {
      console.error("Step 1 Failed: Invalid Receiver Address:", to);
      toast.error("Invalid receiver address");
      return;
    }
    console.log("Step 1: Validation passed. ID:", productId, "Receiver:", to);

    setIsTransferring(true);
    // 2. Loading Toast
    const toastId = toast.loading("Initiating Transfer...");

    try {
      // Setup Provider
      console.log("Step 2: Initializing Provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("Step 3: Signer obtained:", userAddress);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      console.log("Step 4: Contract initialized.");

      // 🛑 PRE-CHECK: Ownership
      console.log("Step 5: Verifying ownership...");
      try {
        const product = await contract.products(productId);
        const currentOwner = product.currentOwner;
        
        if (currentOwner.toLowerCase() !== userAddress.toLowerCase()) {
          console.warn("⚠️ FAILURE RISK: You are NOT the owner.");
          toast.error("You do not own this product!", { id: toastId });
          setIsTransferring(false);
          return;
        }
      } catch (e) {
        console.warn("Step 5 Warning: Could not fetch product details. Proceeding...");
      }

      // Send Transaction
      console.log("Step 6: Sending transferProduct transaction...");
      const tx = await contract.transferProduct(productId, to);
      console.log("Step 6 Success: Transaction sent. Hash:", tx.hash);

      // Wait for Receipt
      console.log("Step 7: Waiting for confirmation...");
      await tx.wait(); 
      console.log("Step 7 Success: Transfer confirmed.");

      // 3. Success
      toast.success("Transfer Successful!", { id: toastId });
      
      // 🔹 UPDATE DASHBOARD STATE
      setLastTransfer({
        id: productId,
        to: to,
        hash: tx.hash
      });

      setProductId("");
      setTo("");
      console.log("--- END: Success ---");

    } catch (err) {
      console.error("--- FAILURE POINT ---");
      console.error(err);
      toast.error("Transfer failed. See console.", { id: toastId });
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <div>
      <div className="section-header action-header" style={{ marginBottom: "20px" }}>
         <FaShippingFast /> Logistics Hub
      </div>

      {/* 🔹 INPUT AREA */}
      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
        <h4 style={{ color: "#94a3b8", marginTop: 0 }}>Transfer Ownership</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FaReceipt style={{ position: 'absolute', top: '12px', left: '12px', color: '#64748b' }} />
              <input
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={isTransferring}
                style={{ paddingLeft: '36px', marginBottom: 0 }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
             <div style={{ position: 'relative', flex: 1 }}>
              <FaUserTag style={{ position: 'absolute', top: '12px', left: '12px', color: '#64748b' }} />
              <input
                placeholder="Receiver Address (0x...)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={isTransferring}
                style={{ paddingLeft: '36px', marginBottom: 0 }}
              />
            </div>
          </div>

          <button 
            onClick={transfer} 
            disabled={isTransferring}
            style={{ 
              marginTop: '10px',
              background: isTransferring ? "#475569" : "#3b82f6",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
             {isTransferring ? "Processing..." : <><FaPaperPlane /> Transfer Asset</>}
          </button>
        </div>
      </div>

      {/* 🔹 SHIPPING MANIFEST (Only shows after success) */}
      {lastTransfer && (
        <div style={{ marginTop: "20px", animation: "fadeIn 0.5s ease-out" }}>
          <div className="section-header" style={{ color: "#3b82f6", fontSize: "0.9rem" }}>
            <FaExchangeAlt /> Transfer Receipt
          </div>
          
          <div style={{ 
            background: "linear-gradient(145deg, #1e3a8a 0%, #172554 100%)", 
            border: "1px solid #3b82f6", 
            borderRadius: "12px", 
            padding: "16px",
            position: "relative",
            overflow: "hidden"
          }}>
             {/* Background Decor */}
             <FaShippingFast style={{ position: "absolute", right: "-10px", bottom: "-20px", fontSize: "100px", opacity: "0.1", color: "#fff" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#93c5fd", fontSize: "0.9rem", textTransform: "uppercase" }}>Asset ID</span>
              <span style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px", color: "#fff", fontFamily: "monospace" }}>#{lastTransfer.id}</span>
            </div>

            <div style={{ marginBottom: "8px" }}>
               <span style={{ color: "#93c5fd", fontSize: "0.8rem" }}>Sent To:</span><br/>
               <span style={{ color: "#fff", fontFamily: "monospace", wordBreak: "break-all", fontSize: "0.9rem" }}>{lastTransfer.to}</span>
            </div>

            <div style={{ fontSize: "0.8rem", color: "#60a5fa", wordBreak: "break-all" }}>
              Tx: {lastTransfer.hash.slice(0, 20)}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferProduct;