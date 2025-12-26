import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaChevronDown, FaCheck } from "react-icons/fa"; // Import icons
import { CONTRACT_ADDRESS, ABI } from "../contract";

function AssignRole() {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(""); // Stores "2" or "3"
  const [isOpen, setIsOpen] = useState(false); // Controls dropdown visibility
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const containerRef = useRef();
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

  useGSAP(() => {
    if (error || success) {
      gsap.fromTo(".status-message",
        { height: 0, opacity: 0, marginTop: 0 },
        { height: "auto", opacity: 1, marginTop: 10, duration: 0.4, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [error, success] });

  // Handle selection
  const handleSelect = (value) => {
    setRole(value);
    setIsOpen(false);
  };

  // Helper to get display text
  const getRoleLabel = () => {
    if (role === "2") return "Distributor";
    if (role === "3") return "Retailer";
    return "Select Role";
  };

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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

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
    <div ref={containerRef} style={{ position: 'relative', zIndex: 10 }}>
      <h3>Assign Role (Admin)</h3>

      <input
        placeholder="Wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* 隼 CUSTOM DROPDOWN */}
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

      {error && <div className="error status-message">{error}</div>}
      {success && <div className="success status-message">{success}</div>}
    </div>
  );
}

export default AssignRole;