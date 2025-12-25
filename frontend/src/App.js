import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  FaUserCircle,
  FaUserShield,
  FaExchangeAlt,
  FaSearch
} from "react-icons/fa";

import WalletConnect from "./components/WalletConnect";
import AssignRole from "./components/AssignRole";
import CreateProduct from "./components/CreateProduct";
import TransferProduct from "./components/TransferProduct";
import ProductHistory from "./components/ProductHistory";
import UserRole from "./components/UserRole";

import { CONTRACT_ADDRESS, ABI } from "./contract";
import "./styles/app.css";

const roleText = ["None", "Manufacturer", "Distributor", "Retailer"];

function App() {
  const [account, setAccount] = useState(null);
  const [roleId, setRoleId] = useState(0);

  useEffect(() => {
    async function fetchRole() {
      if (!account) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        provider
      );

      const id = await contract.roles(account);
      setRoleId(Number(id));
    }

    fetchRole();
  }, [account]);

  return (
    <div className="container">
      <h1>Supply Chain Tracker</h1>

      {!account ? (
        <WalletConnect setAccount={setAccount} />
      ) : (
        <>
          <div className="section">
          <div className="section-header">
            <FaUserCircle />User Information</div>

          <div className="card">
          <p><strong>Wallet:</strong> {account}</p>
          </div>

        <UserRole account={account} />
      </div>

      <div className="section-divider" />

      {/* 🔹 ADMIN SECTION */}
      {roleId === 1 && (
        <div className="section">
        <div className="section-header">
          <FaUserShield />Admin Panel</div>
        <AssignRole />
      </div>
  )}

    {roleId === 1 && <div className="section-divider" />}

  {/* 🔹 ACTIONS SECTION */}
  {(roleId === 1 || roleId === 2) && (
    <div className="section">
      <div className="section-header">
        <FaExchangeAlt />Supply Chain Actions</div>

      {roleId === 1 && <CreateProduct />}
      <TransferProduct />
    </div>
  )}

  {(roleId === 1 || roleId === 2) && <div className="section-divider" />}

  {/* 🔹 VERIFICATION SECTION */}
  <div className="section">
    <div className="section-header">
      <FaSearch />Product Verification</div>
    <ProductHistory />
  </div>
        </>
      )}
    </div>
  );
}

export default App;
