import { ethers } from "ethers";

function WalletConnect({ setAccount }) {
  async function connect() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  return <button onClick={connect}>Connect Wallet</button>;
}

export default WalletConnect;
