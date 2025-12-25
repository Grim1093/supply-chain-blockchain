import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function TransferProduct() {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function transfer() {
    setError("");
    setSuccess("");

    if (!productId || !to) {
      setError("All fields are required");
      return;
    }

    if (isNaN(productId) || Number(productId) <= 0) {
      setError("Product ID must be a valid number");
      return;
    }

    if (!ethers.isAddress(to)) {
      setError("Invalid receiver address");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.transferProduct(productId, to);
      await tx.wait();

      setSuccess("Product transferred successfully!");
      setProductId("");
      setTo("");
    } catch (err) {
      setError("Transfer failed. Check role, ownership, or order.");
    }
  }

  return (
    <div className="card">
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

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
}

export default TransferProduct;
