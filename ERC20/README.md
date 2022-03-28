# ERC20 implementation using Hardhat and Ether.js

Clone the project and run the following in terminal to start a node

```shell
 npx hardhat node
```

Then, run the deploy script using:

```shell
node scripts/deploy.js
```

Start the node server:

```shell
node app.js
```

For tests:
```shell
npx hardhat test
```

Either use the frontend application or postman to interact with the following routes:

transfer
```shell
http://localhost:3000/token/transfer?address=[address]&amount=[amount]
```

checkBalance
```shell
http://localhost:3000/token/balanceOf?address=[address]
```
