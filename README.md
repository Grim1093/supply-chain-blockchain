# **Supply Chain Blockchain**

## **🎯 Main Goal**

The primary objective of this project is to build a decentralized, transparent, and secure supply chain tracking application using blockchain technology (Ethereum/Hardhat) and a React frontend. It ensures the traceability of products from the manufacturer to the retailer, preventing counterfeiting, automating status updates, and strictly enforcing role-based access control.

## **✨ Capabilities & Features**

* **Role-Based Access Control (RBAC):** Strict permission system (Admin/Manufacturer, Distributor, Retailer) to ensure only authorized wallet addresses can perform specific actions on the smart contract.  
* **Product Minting:** Manufacturers (Role 1\) can create new products, logging their initial state securely on the blockchain.
* **Ownership Transfer & Auto-Status Updates:** Products can be transferred sequentially between supply chain entities (Manufacturer \-\> Distributor \-\> Retailer). The smart contract automatically updates the shipment status (e.g., Created \-\> InTransit \-\> Delivered) based on the receiver's defined role.  
* **Global Shipment Tracking:** A public-facing tracking portal allows anyone to search for a product using its ID to view its real-time status, current owner, and a complete chronological history of handlers and timestamps.  
* **QR Code Label Generator:** Built-in tool for Manufacturers to generate physical QR code labels for shipment boxes. Scanning these links directly to the public tracking portal for that specific product ID.  
* **Live Inventory Dashboard:** Logged-in users can view a list of assets currently under their ownership via the MyInventory component.  
* **Real-time Blockchain Terminal:** A UI overlay displaying active blockchain logs and transactions for better user feedback.

## **🗄️ Database Structure (Smart Contract)**

The Ethereum blockchain acts as the immutable database. State is managed in contracts/SupplyChain.sol via the following structures:

**Enums:**

* Role: None (0), Manufacturer (1), Distributor (2), Retailer (3).  
* Status: Created (0), InTransit (1), Delivered (2).

**Structs:**

* Product:  
  * id (uint256): Unique identifier.  
  * name (string): Product name.  
  * currentOwner (address): Wallet address of the current holder.  
  * status (Status): Current state.  
  * exists (bool): Validation flag.  
* History:  
  * handler (address): Wallet address that handled the product.  
  * role (Role): Role of the handler.  
  * status (Status): Status at the time of handling.  
  * timestamp (uint256): Block timestamp.

**Mappings (Tables):**

* products: mapping(uint256 \=\> Product) \- Retrieves a product by ID.  
* productHistory: mapping(uint256 \=\> History\[\]) \- Retrieves the lifecycle timeline by ID.  
* roles: mapping(address \=\> Role) \- Defines permissions for specific wallet addresses.

## **📂 Complete Project Structure & File Definitions**

### **Root Directory**

* **contracts/**: Contains the core Solidity smart contracts.  
  * SupplyChain.sol: The master smart contract. Handles all backend logic: RBAC, product creation, sequential ownership transfers, and appending historical logs.  
* **frontend/**: The React.js frontend application.  
  * **public/**: Static assets.  
    * favicon.ico, logo192.png, logo512.png: React standard icons.  
    * index.html: The root HTML template.  
    * manifest.json, robots.txt: PWA and SEO metadata.  
  * **src/**: Main React source code.  
    * **components/**: Reusable UI components.  
      * AssignRole.jsx: Admin tool to map wallet addresses to specific Roles on the blockchain.  
      * BlockchainTerminal.jsx: UI component overlaying real-time blockchain transaction logs.  
      * CreateProduct.jsx: Form allowing Role 1 (Manufacturer) to mint new products.  
      * MyInventory.jsx: Queries and displays all products currently owned by the connected wallet.  
      * Navbar.jsx: Top navigation; handles routing and dynamic display based on user role.  
      * ProductHistory.jsx: Component to map and display the History struct array of a product.  
      * ProtectedRoute.jsx: Security wrapper for React Router to block unauthorized roles from specific views.  
      * Tracking.jsx: Public interface to query a product ID and view its status and ProductHistory. Supports URL parameter querying (?id=X).  
      * TransferProduct.jsx: Form to execute transferProduct on the smart contract, moving ownership to the next entity.  
      * UserRole.jsx: Utility to fetch and display the human-readable role of the connected wallet.  
      * WalletConnect.jsx: Handles MetaMask integration and standard Web3 authentication.  
    * **pages/**: Top-level route views.  
      * Admin.jsx: Secure view housing the AssignRole component.  
      * Dashboard.jsx: The main control hub. Adapts UI based on role (Manufacturer sees Create \+ Transfer \+ QR Generator; Distributor/Retailer sees only Transfer).  
      * Home.jsx: Landing page.  
      * Tracking.jsx: Route wrapper for the public Tracking component.  
    * **styles/**: CSS styling.  
      * app.css: Custom component styling, cyber-themed layouts, and animations.  
      * index.css: Global resets and base styles.  
    * **utils/**: Helper functions.  
      * audio.js: Plays success/error sounds based on transaction outcomes.  
    * App.js: Root React component. Initializes Web3, manages account/role state persistence, and defines react-router-dom routes.  
    * App.test.js, setupTests.js: Testing setups.  
    * contract.js: Exports the CONTRACT\_ADDRESS and ABI necessary for ethers.js to communicate with SupplyChain.sol.  
    * index.js: Mounts App.js to the DOM.  
    * reportWebVitals.js: React performance measurement.  
  * package.json, package-lock.json: Frontend dependencies (ethers, react-router-dom, react-hot-toast, react-qr-code, react-parallax-tilt).  
  * .gitignore: Frontend ignore rules.  
* **ignition/**: Hardhat Ignition configuration for declarative deployments.  
  * **modules/**:  
    * SupplyChain.ts: Deployment script for SupplyChain.sol.  
  * **deployments/chain-31337/**: Auto-generated artifacts from local deployment.  
    * artifacts/SupplyChainModule\#SupplyChain.json: Contains the compiled ABI.  
    * deployed\_addresses.json: Stores the local contract address.  
    * journal.jsonl, build-info/: Deployment tracking files.  
* hardhat.config.ts: Hardhat configuration file.  
* package.json, package-lock.json: Root Node.js dependencies (Hardhat, TypeScript).  
* tsconfig.json: TypeScript configuration.  
* README.md: General project overview.  
* .gitignore: Root ignore rules.

## **🚀 Setup & Execution**

**1\. Start Local Blockchain**
```
npm install --save-dev hardhat
npx hardhat
npx hardhat node

```
**2\. Deploy Contract** *(In a new terminal)*
```

npx hardhat ignition deploy ignition/modules/SupplyChain.ts \--network localhost 

```
*Note: Copy the deployed contract address and update frontend/src/contract.js with the new address.*

**3\. Start Frontend Client**
```

cd frontend  
npm start

```
