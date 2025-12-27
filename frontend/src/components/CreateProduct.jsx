import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast"; // <--- Import Toast
import { CONTRACT_ADDRESS, ABI } from "../contract";

function CreateProduct() {
  const [name, setName] = useState("");

  async function create() {
    // 1. Validation
    if (!name.trim()) {
      toast.error("Product name cannot be empty");
      return;
    }

    // 2. Loading Toast
    const toastId = toast.loading("Creating product on blockchain...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.createProduct(name);
      await tx.wait(); // Wait for transaction to be mined

      // Fetch the new ID to show the user
      const id = await contract.productCount();
      
      // 3. Success (Updates loading toast)
      toast.success(`Product created! ID: ${id.toString()}`, { 
        id: toastId,
        duration: 5000 // Keep visible longer so they can read the ID
      });

      setName("");
    } catch (err) {
      console.error(err);
      // 4. Error (Updates loading toast)
      toast.error("Transaction failed or rejected", { id: toastId });
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
      
      {/* Old status messages removed */}
    </div>
  );
}

export default CreateProduct;