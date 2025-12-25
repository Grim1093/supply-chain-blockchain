# Sample Hardhat 3 Beta Project (minimal)

This project has a minimal setup of Hardhat 3 Beta, without any plugins.

## What's included?

The project includes native support for TypeScript, Hardhat scripts, tasks, and support for Solidity compilation and tests.

## Testing
This project was manually tested using Hardhat local network by:
- Creating products
- Transferring ownership
- Verifying product history

Automated tests will be added in future versions.

## start
1
```
npx hardhat node
```
2 in another terminal
    ```
    npx hardhat ignition deploy ignition/modules/SupplyChain.ts --network localhost 
    ```
3 copy the address and insert in contract js of src 

4 
```
npm start
 ```

