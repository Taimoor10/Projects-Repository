require("@nomiclabs/hardhat-waffle");

extendEnvironment((hre) => {
  const Web3 = require("web3");
  hre.web3 = new Web3("http://localhost:8545")
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
      chainId: 17
    }
  },
    solidity: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts"
    },
    mocha: {
      timeout: 40000
    }
}
