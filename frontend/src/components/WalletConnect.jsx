import { useRef } from "react";
import { ethers } from "ethers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function WalletConnect({ setAccount }) {
  const btnRef = useRef();

  useGSAP(() => {
    gsap.to(btnRef.current, {
      scale: 1.05,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  }, { scope: btnRef });

  async function connect() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  return (
    <div ref={btnRef} style={{ display: "inline-block", width: "100%" }}>
      <button onClick={connect} style={{ fontSize: "16px", padding: "14px" }}>
        Connect Wallet
      </button>
    </div>
  );
}

export default WalletConnect;