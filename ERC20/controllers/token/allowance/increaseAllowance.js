const token = require('../../../repositories/token/token.js')
const tokenContract = require('../../../build/token/Token.json')
const ethers = require('../../../utils/ether').ethers

module.exports = async ({spender, addedValue}) => {
    const signers = await ethers.getSigners()
    const contract = new ethers.Contract(tokenContract.address, tokenContract.abi, signers[1])
    const tokenFunctions = await token({contract})
    
    try{
        const increaseAllowanceReceipt = await tokenFunctions.increaseAllowance(spender, addedValue)
        console.log("Increase Allowance Receipt:",
                    increaseAllowanceReceipt)
    }catch(err)
    {
        console.log(err.message)
    }
}