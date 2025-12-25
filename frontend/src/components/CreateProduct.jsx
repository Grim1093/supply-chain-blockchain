import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function CreateProduct() {
  const [name, setName] = useState("");

  async function create() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    );

    const tx = await contract.createProduct(name);
    await tx.wait();

    alert("Product created!");
    console.log(await provider.getCode(CONTRACT_ADDRESS));

    const id = await contract.productCount();
    alert(`Product created with ID: ${Number(id)}`);

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
    </div>
  );
}

export default CreateProduct;
