import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function CreateProduct() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function create() {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Product name cannot be empty");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.createProduct(name);
      await tx.wait();

      const id = await contract.productCount();
      setSuccess(`Product created with ID: ${id.toString()}`);
      setName("");
    } catch (err) {
      setError("Transaction failed or rejected");
    }
  }

  return (
    <div className="card">
      <h3>Create Product</h3>

      <input
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={create}>Create</button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
}

export default CreateProduct;
