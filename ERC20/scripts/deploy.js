// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  await hre.run("compile")
  const accounts = await hre.ethers.getSigners()
  console.log(`Deploying Address: ${accounts[0].address}`)

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(1000000);
  await token.deployed();

  console.log(`Token Contract Address : ${token.address}`);
  
  fs.writeFileSync('./build/token/Token.json', JSON.stringify(
    {
      address: token.address,
      abi: JSON.parse(token.interface.format('json'))
    }
  ))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
