import { useEffect, useState } from "react";
import { ethers } from "ethers";

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
          <p>Connected: {account}</p>
          <UserRole account={account} />

          {/* Manufacturer Only */}
          {roleId === 1 && <AssignRole />}
          {roleId === 1 && <CreateProduct />}

          {/* Manufacturer & Distributor */}
          {(roleId === 1 || roleId === 2) && <TransferProduct />}

          {/* Everyone */}
          <ProductHistory />
        </>
      )}
    </div>
  );
}

export default App;
