const ethers = require('../utils/ether').ethers
const tokenContract = require('../build/token/Token.json')

const provider = new ethers.providers.WebSocketProvider("ws://localhost:8545");
const tokenContractInstance = new ethers.Contract(tokenContract.address, tokenContract.abi, provider)

module.exports = { tokenContractInstance }
