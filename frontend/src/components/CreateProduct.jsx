import { useState, useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function CreateProduct() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const containerRef = useRef();

  useGSAP(() => {
    if (error) {
      // Shake animation on error
      gsap.fromTo("input", { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
    }
    if (error || success) {
      // Slide in message
      gsap.fromTo(".status-message",
        { height: 0, opacity: 0, marginTop: 0 },
        { height: "auto", opacity: 1, marginTop: 10, duration: 0.4, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [error, success] });

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
    <div ref={containerRef}>
      <h3>Create Product</h3>

      <input
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={create}>Create</button>

      {error && <div className="error status-message">{error}</div>}
      {success && <div className="success status-message">{success}</div>}
    </div>
  );
}

export default CreateProduct;