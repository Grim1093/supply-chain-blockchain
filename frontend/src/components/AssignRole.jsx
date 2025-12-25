import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function AssignRole() {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function assign() {
    setError("");
    setSuccess("");

    if (!address || !role) {
      setError("All fields are required");
      return;
    }

    if (!ethers.isAddress(address)) {
      setError("Invalid wallet address");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        signer
      );

      const tx = await contract.assignRole(address, role);
      await tx.wait();

      setSuccess("Role assigned successfully!");
      setAddress("");
      setRole("");
    } catch (err) {
      setError("Transaction failed or rejected");
    }
  }

  return (
    <div className="card">
      <h3>Assign Role (Admin)</h3>

      <input
        placeholder="Wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select role</option>
        <option value="2">Distributor</option>
        <option value="3">Retailer</option>
      </select>

      <button onClick={assign}>Assign Role</button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
}

export default AssignRole;
