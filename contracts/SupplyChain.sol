// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {

    enum Role { None, Manufacturer, Distributor, Retailer }

    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        bool exists;
    }

    uint256 public productCount;
    mapping(uint256 => Product) public products;
    mapping(address => Role) public roles;

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized");
        _;
    }

    constructor() {
        roles[msg.sender] = Role.Manufacturer;
    }

    function assignRole(address user, Role role) external {
        roles[user] = role;
    }

    function createProduct(string memory name)
        external
        onlyRole(Role.Manufacturer)
    {
        productCount++;
        products[productCount] = Product(
            productCount,
            name,
            msg.sender,
            true
        );
    }
}
