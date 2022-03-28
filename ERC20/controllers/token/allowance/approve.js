const token = require('../../../repositories/token/token.js')
const tokenContract = require('../../../build/token/Token.json')
const ethers = require('../../../utils/ether').ethers

module.exports = async ({spender, value}) => {
    const signers = await ethers.getSigners()
    const contract = new ethers.Contract(tokenContract.address, tokenContract.abi, signers[1])
    const tokenFunctions = await token({contract})
    
    try{
        const approveReceipt = await tokenFunctions.approve(spender, value)
        console.log("Approve Receipt:",
                    approveReceipt)
    }catch(err)
    {
        console.log(err.message)
    }
}