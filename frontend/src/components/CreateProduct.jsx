import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function CreateProduct() {
  const [name, setName] = useState("");

  async function create() {
    console.log("--- START: Create Product Process ---");

    // 1. Validation
    if (!name.trim()) {
      console.error("Step 1 Failed: Name is empty");
      toast.error("Product name cannot be empty");
      return;
    }
    console.log("Step 1: Validation passed. Name:", name);

    // 2. Loading Toast
    const toastId = toast.loading("Creating product on blockchain...");

    try {
      // Setup Provider
      console.log("Step 2: Initializing Provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get Signer
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("Step 3: Signer obtained:", userAddress);

      // Initialize Contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      console.log("Step 4: Contract initialized at:", CONTRACT_ADDRESS);

      // DEBUG: Check Role before sending transaction
      // Role enum: 0=None, 1=Manufacturer, 2=Distributor, 3=Retailer
      console.log("Step 5: Verifying User Role...");
      const userRole = await contract.roles(userAddress);
      console.log("Step 5 Result: User Role ID is:", userRole.toString());

      if (userRole.toString() !== "1") {
        console.warn("FAILURE RISK: User is NOT a Manufacturer (Role 1). Transaction will likely revert.");
        toast.error(`Error: You are not a Manufacturer. Your role ID: ${userRole}`);
        // We let it proceed to fail naturally, or you could return here.
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
      
      // Success Message
      toast.success(`Product created! ID: ${id.toString()}`, { 
        id: toastId,
        duration: 5000 
      });

      setName("");
      console.log("--- END: Success ---");

    } catch (err) {
      console.error("--- FAILURE POINT ---");
      console.error("Error Details:", err);

      // Attempt to extract internal reason if possible
      if (err.info && err.info.error && err.info.error.message) {
         console.error("Smart Contract Revert Reason:", err.info.error.message);
      }

      toast.error("Transaction failed. Check console logs.", { id: toastId });
    }
  }

  return (
    <div>
      <h3>Create Product</h3>
      <input
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={create}>Create</button>
    </div>
  );
}

export default CreateProduct;