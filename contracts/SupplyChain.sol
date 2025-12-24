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

    uint256 public productCount;

    mapping(uint256 => Product) public products;
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
        products[productId].status = Status.InTransit;
    }
}
