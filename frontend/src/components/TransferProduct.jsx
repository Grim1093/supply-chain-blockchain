import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast"; // <--- Import Toast
import { CONTRACT_ADDRESS, ABI } from "../contract";

function TransferProduct() {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState("");

  async function transfer() {
    // 1. Validation
    if (!productId || !to) {
      toast.error("All fields are required");
      return;
    }

    if (isNaN(productId) || Number(productId) <= 0) {
      toast.error("Product ID must be a valid number");
      return;
    }

    if (!ethers.isAddress(to)) {
      toast.error("Invalid receiver address");
      return;
    }

    // 2. Loading Toast
    const toastId = toast.loading("Transferring product...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.transferProduct(productId, to);
      await tx.wait(); // Wait for blockchain confirmation

      // 3. Success (Updates the loading toast)
      toast.success("Product transferred successfully!", { id: toastId });
      
      // Clear inputs
      setProductId("");
      setTo("");
    } catch (err) {
      console.error(err);
      // 4. Error (Updates the loading toast)
      toast.error("Transfer failed. Check role or ownership.", { id: toastId });
    }
  }

  return (
    <div>
      <h3>Transfer Product</h3>

      <input
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />

      <input
        placeholder="Receiver address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <button onClick={transfer}>Transfer</button>
      
      {/* Old error/success divs removed (handled by Toast now) */}
    </div>
  );
}

export default TransferProduct;