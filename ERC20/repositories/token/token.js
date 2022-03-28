module.exports = async({contract}) => {
    return Object.freeze({
        transfer: async(to, amount) => {
            let transferReceipt = await contract.transfer(to, amount)
            return transferReceipt
        },

        transferFrom: async(from, to, value) => {
            let tranfserFromReceipt = await contract.transferFrom(from, to, value)
            return tranfserFromReceipt
        },

        approve: async(spender, value) => {
            let approveReceipt = await contract.approve(spender, value)
            return approveReceipt
        },

        increaseAllowance: async(spender, addedValue) => {
            let increaseAllowanceReceipt = await contract.increaseAllowance(spender, addedValue)
            return increaseAllowanceReceipt
        },

        decreaseAllowance: async(spender, decreasedValue) => {
            let decreaseAllowanceReceipt = await contract.decreaseAllowance(spender, decreasedValue)
            return decreaseAllowanceReceipt
        },

        allowance: async(owner, spender) => {
            return await contract.allowance(owner, spender)
        },

        balanceOf: async(account) => {
            return await contract.balanceOf(account)
        }
    })
}