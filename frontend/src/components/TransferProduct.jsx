import { useState, useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function TransferProduct() {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const containerRef = useRef();

  useGSAP(() => {
    if (error) {
      gsap.fromTo(".error-shake", { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
    }
    if (error || success) {
      gsap.fromTo(".status-message",
        { height: 0, opacity: 0, marginTop: 0 },
        { height: "auto", opacity: 1, marginTop: 10, duration: 0.4, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [error, success] });

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
    <div ref={containerRef}>
      <h3>Transfer Product</h3>

      <input
        className={error ? "error-shake" : ""}
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />

      <input
        className={error ? "error-shake" : ""}
        placeholder="Receiver address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <button onClick={transfer}>Transfer</button>

      {error && <div className="error status-message">{error}</div>}
      {success && <div className="success status-message">{success}</div>}
    </div>
  );
}

export default TransferProduct;