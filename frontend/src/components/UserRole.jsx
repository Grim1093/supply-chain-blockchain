import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contract";

const roleText = ["None", "Manufacturer", "Distributor", "Retailer"];

function UserRole({ account }) {
  const [role, setRole] = useState("");

  useEffect(() => {
    async function fetchRole() {
      if (!account) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          ABI,
          provider
        );

        const roleId = await contract.roles(account);
        setRole(roleText[Number(roleId)]);
      } catch (err) {
        setRole("Unknown");
      }
    }

    fetchRole();
  }, [account]);

  return (
    <div className="card">
      <strong>Your Role:</strong> {role}
    </div>
  );
}

export default UserRole;
