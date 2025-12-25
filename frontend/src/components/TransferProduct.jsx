import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function TransferProduct() {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState("");

  async function transfer() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    );

    const tx = await contract.transferProduct(productId, to);
    await tx.wait();

    alert("Product transferred!");
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
    </div>
  );
}

export default TransferProduct;
