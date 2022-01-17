
The project is a decentralized digital identity infrastructure which can be connected to any frontend application.
The infrastucture allows to deveop and deploy Smart Contract on private Ethereum blockchain network.
The infrastructure allow consumers to deploy contracts with their own address. However for the demonstration and
thesis purposes, addresses are fixed for respective entities.
The infrastucture allow third party entities to add and issue their services toward end Users.
The infrastructure also allow to catch events via event listener and show it as an output.


/* Description
1) This project is an Administrative entity monitoring the private Ethereum blockchain network

2) Admininstrator is allowed to perform various tasks

3) Admininstrator is also allowed to add claim Issuers into the network

4) Only single Ethereum address is assigned to Administrative entity

5) Administator is also the deployer of Smart Contracts

6) Administrator monitors the actitivity of blockchain without storing any sensitive information

7) Claim issuer address is also kept fixed for demonstration purposes

8) Claim Issuers can add and issue claims using this project

11) Users can create a decentralized digital identity tied with provided infrastructure

12) Users can access claim portal on a specified URL after authentication

13) Users can scan claims to store them in personal device after authentication
**/


/* Starting Instructions

1) Type "parity --config dev --jsonrpc-apis all --allow-ips private --jsonrpc-cors all --tracing on" in terminal 
   to start an Ethereum blockchain node

2) Type "truffle compile" in terminal from project's root directory to compile Smart Contracts

3) Type "node deploy" from project's root directory to deploy contracts on blockchain network

4) Type "node app.js" or "nodemon app.js" in terminal from project's root directory to start the server on port 3000
/*