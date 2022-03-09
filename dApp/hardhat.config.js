require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
const tasks = require("./tasks/tasks")
tasks()

const INFURA_URL= "https://rinkeby.infura.io/v3/8a6882d75d704fce8ee952980ae91a81"
const PRIVATE_KEY = "6916c90732eba234e46302ca5d0f28e919de3e540256ec08ba87c8dd635f811b"

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
    },
    rinkeby: {
      url: INFURA_URL,
      accounts: [`0x${PRIVATE_KEY}`]
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

