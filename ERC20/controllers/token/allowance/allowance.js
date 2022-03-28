const token = require('../../../repositories/token/token')
const tokenContract = require('../../../build/token/Token.json')
const ethers = require('../../../utils/ether').ethers

module.exports = async ({owner, spender}) => {
    const signers = await ethers.getSigners()
    const contract = new ethers.Contract(tokenContract.address, tokenContract.abi, signers[0])
    const tokenFunctions = await token({contract})
    let balance = await tokenFunctions.allowance(owner, spender)
    return balance.toString()
}