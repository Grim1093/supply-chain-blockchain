import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function AssignRole() {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setRole(value);
    setIsOpen(false);
  };

  const getRoleLabel = () => {
    if (role === "1") return "Manufacturer";
    if (role === "2") return "Distributor";
    if (role === "3") return "Retailer";
    return "Select Role";
  };

  async function assign() {
    console.log("--- START: Assign Role Process ---");

    // 1. Validation
    if (!address || !role) {
      console.error("Step 1 Failed: Missing fields. Address:", address, "Role:", role);
      toast.error("All fields are required");
      return;
    }
    if (!ethers.isAddress(address)) {
      console.error("Step 1 Failed: Invalid address:", address);
      toast.error("Invalid wallet address");
      return;
    }
    console.log("Step 1: Validation passed.");

    // 2. Loading Toast
    const toastId = toast.loading("Assigning role on blockchain...");

    try {
      // Setup Provider
      console.log("Step 2: Initializing Provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get Signer
      const signer = await provider.getSigner();
      const adminAddress = await signer.getAddress();
      console.log("Step 3: Signer obtained:", adminAddress);

      // Initialize Contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      console.log("Step 4: Contract initialized.");

      // Security Check (Optional but good for debugging)
      const callerRole = await contract.roles(adminAddress);
      console.log("Step 5: Verifying Admin permissions. Caller Role ID:", callerRole.toString());
      
      if (callerRole.toString() !== "1") {
         console.warn("⚠️ WARNING: Caller is not Role 1 (Admin). Transaction might revert.");
      }

      // Send Transaction
      console.log(`Step 6: Sending transaction. Assigning Role ${role} to ${address}...`);
      const tx = await contract.assignRole(address, role);
      console.log("Step 6 Success: Transaction Hash:", tx.hash);

      // Wait for confirmation
      console.log("Step 7: Waiting for block confirmation...");
      await tx.wait();
      console.log("Step 7 Success: Transaction mined.");

      // 3. Success Toast
      toast.success("Role assigned successfully!", { id: toastId });
      
      setAddress("");
      setRole("");
      console.log("--- END: Success ---");

    } catch (err) {
      console.error("--- FAILURE POINT ---");
      console.error(err);
      
      // Extract revert reason if available
      if (err.reason) console.error("Revert Reason:", err.reason);
      
      // 4. Error Toast
      toast.error("Transaction failed. Check console.", { id: toastId });
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      <h3>Assign Role (Admin)</h3>

      <input
        placeholder="Wallet address (0x...)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <div className="custom-dropdown" ref={dropdownRef}>
        <div 
          className={`dropdown-header ${isOpen ? "open" : ""}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{getRoleLabel()}</span>
          <FaChevronDown className={`arrow ${isOpen ? "rotate" : ""}`} />
        </div>

        {isOpen && (
          <div className="dropdown-options">
             <div 
              className={`dropdown-item ${role === "1" ? "selected" : ""}`} 
              onClick={() => handleSelect("1")}
            >
              Manufacturer (Admin)
              {role === "1" && <FaCheck className="check-icon" />}
            </div>
            <div 
              className={`dropdown-item ${role === "2" ? "selected" : ""}`} 
              onClick={() => handleSelect("2")}
            >
              Distributor
              {role === "2" && <FaCheck className="check-icon" />}
            </div>
            <div 
              className={`dropdown-item ${role === "3" ? "selected" : ""}`} 
              onClick={() => handleSelect("3")}
            >
              Retailer
              {role === "3" && <FaCheck className="check-icon" />}
            </div>
          </div>
        )}
      </div>

      <button onClick={assign} style={{ marginTop: "16px" }}>Assign Role</button>
    </div>
  );
}

export default AssignRole;