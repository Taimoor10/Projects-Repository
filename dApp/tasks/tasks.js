module.exports = () => {
    task("accounts", "Prints the list of accounts", async (_, hre) => {
        const accounts = await hre.ethers.getSigners();
        
        for (const account of accounts) {
            console.log(account.address)
        }
    }),

    task("balance", "Prints an account's balance")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs) => {
        const balance = await hre.ethers.provider.getBalance(taskArgs.account);
        console.log(hre.ethers.utils.formatEther(balance));
    }),

    task("getNetwork", "Network information", async(_, hre) => {
        const network = await hre.ethers.provider.getNetwork()
        console.log(network)
    })
}

    
