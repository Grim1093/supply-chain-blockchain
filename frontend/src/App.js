import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import CreateProduct from "./components/CreateProduct";
import TransferProduct from "./components/TransferProduct";
import ProductHistory from "./components/ProductHistory";
import "./styles/app.css";

function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="container">
      <h1>Supply Chain Tracker</h1>

      {!account ? (
        <WalletConnect setAccount={setAccount} />
      ) : (
        <>
          <p>Connected: {account}</p>
          <CreateProduct />
          <TransferProduct />
          <ProductHistory />
        </>
      )}
    </div>
  );
}

export default App;
