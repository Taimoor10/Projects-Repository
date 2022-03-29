const token = require('../../../repositories/token/token.js')
const tokenContract = require('../../../build/token/Token.json')
const ethers = require('../../../utils/ether').ethers

module.exports = async ({address, amount}) => {
    const signers = await ethers.getSigners()
    const contract = new ethers.Contract(tokenContract.address, tokenContract.abi, signers[0])
    const tokenFunctions = await token({contract})
    
    try{
        const transferReceipt = await tokenFunctions.transfer(address, amount)
        console.log("Transfer Receipt:",
                    transferReceipt)
    }catch(err)
    {
        console.log(err.message)
    }
}