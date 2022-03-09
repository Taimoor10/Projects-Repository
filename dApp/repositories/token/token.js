module.exports = async({contract}) => {
    return Object.freeze({
        transfer: async(to, amount) => {
            let transferReceipt = await contract.transfer(to, amount)
            return transferReceipt
        },

        balanceOf: async(account) => {
            return await contract.balanceOf(account)
        }
    })
}