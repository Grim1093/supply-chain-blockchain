import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CONTRACT_ADDRESS, ABI } from "../contract";

const roleText = ["None", "Manufacturer", "Distributor", "Retailer"];

function UserRole({ account }) {
  const [role, setRole] = useState("");
  const textRef = useRef();
  const containerRef = useRef();

  useGSAP(() => {
    if (role) {
      // Animate the text popping in
      gsap.fromTo(textRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, { scope: containerRef, dependencies: [role] });

  useEffect(() => {
    async function fetchRole() {
      if (!account) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const roleId = await contract.roles(account);
        setRole(roleText[Number(roleId)]);
      } catch (err) {
        setRole("Unknown");
      }
    }

    fetchRole();
  }, [account]);

  return (
    <div ref={containerRef} style={{ marginTop: "10px" }}>
      <strong>🔑 Your Role: </strong> 
      <span 
        ref={textRef} 
        style={{ 
          display: "inline-block", 
          color: "#1976d2", 
          fontWeight: "bold" 
        }}
      >
        {role}
      </span>
    </div>
  );
}

export default UserRole;