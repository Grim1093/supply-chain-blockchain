import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast"; // <--- Import Toast
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
    if (role === "2") return "Distributor";
    if (role === "3") return "Retailer";
    return "Select Role";
  };

  async function assign() {
    // 1. Validation
    if (!address || !role) {
      toast.error("All fields are required"); // <--- Toast Error
      return;
    }
    if (!ethers.isAddress(address)) {
      toast.error("Invalid wallet address");
      return;
    }

    // 2. Loading Toast
    const toastId = toast.loading("Assigning role on blockchain...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.assignRole(address, role);
      await tx.wait();

      // 3. Success Toast (updates the loading toast)
      toast.success("Role assigned successfully!", { id: toastId });
      
      setAddress("");
      setRole("");
    } catch (err) {
      console.error(err);
      // 4. Error Toast (updates the loading toast)
      toast.error("Transaction failed or rejected", { id: toastId });
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      <h3>Assign Role (Admin)</h3>

      <input
        placeholder="Wallet address"
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
      
      {/* REMOVED: Old error/success divs */}
    </div>
  );
}

export default AssignRole;