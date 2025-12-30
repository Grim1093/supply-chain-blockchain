// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {

    enum Role { None, Manufacturer, Distributor, Retailer }
    enum Status { Created, InTransit, Delivered }

    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        Status status;
        bool exists;
    }

    struct History {
        address handler;
        Role role;
        Status status;
        uint256 timestamp;
    }

    uint256 public productCount;

    mapping(uint256 => Product) public products;
    mapping(uint256 => History[]) private productHistory;
    mapping(address => Role) public roles;

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized role");
        _;
    }

    modifier productExists(uint256 productId) {
        require(products[productId].exists, "Product does not exist");
        _;
    }

    modifier onlyOwner(uint256 productId) {
        require(
            products[productId].currentOwner == msg.sender,
            "Not product owner"
        );
        _;
    }

    constructor() {
        roles[msg.sender] = Role.Manufacturer;
    }

    // ---------------- ROLE MANAGEMENT ----------------

    function assignRole(address user, Role role) external {
        roles[user] = role;
    }

    // ---------------- PRODUCT CREATION ----------------

    function createProduct(string memory name)
        external
        onlyRole(Role.Manufacturer)
    {
        productCount++;

        products[productCount] = Product({
            id: productCount,
            name: name,
            currentOwner: msg.sender,
            status: Status.Created,
            exists: true
        });

        productHistory[productCount].push(
            History({
                handler: msg.sender,
                role: Role.Manufacturer,
                status: Status.Created,
                timestamp: block.timestamp
            })
        );
    }

    // ---------------- PRODUCT TRANSFER ----------------

    function transferProduct(
        uint256 productId,
        address to
    )
        external
        productExists(productId)
        onlyOwner(productId)
    {
        Role senderRole = roles[msg.sender];
        Role receiverRole = roles[to];

        require(
            (senderRole == Role.Manufacturer && receiverRole == Role.Distributor) ||
            (senderRole == Role.Distributor && receiverRole == Role.Retailer),
            "Invalid supply chain transfer"
        );

        products[productId].currentOwner = to;

        // 🔹 FIX: Determine status based on who is receiving it
        Status newStatus = Status.InTransit; 
        if (receiverRole == Role.Retailer) {
            newStatus = Status.Delivered; // Mark as Delivered if reaching Retailer
        }

        products[productId].status = newStatus;

        productHistory[productId].push(
            History({
                handler: to,
                role: receiverRole,
                status: newStatus, // Use the dynamic status here
                timestamp: block.timestamp
            })
        );
    }

    // ---------------- VIEW PRODUCT HISTORY ----------------

    function getProductHistory(uint256 productId)
        external
        view
        productExists(productId)
        returns (History[] memory)
    {
        return productHistory[productId];
    }
}
