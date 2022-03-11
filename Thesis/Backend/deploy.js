const userContract = require('./build/contracts/User.json')
const ERC725 = require('./build/contracts/ERC725.json')
const ERC735 = require('./build/contracts/ERC735.json')
const identityContract = require('./build/contracts/Identity.json')
const fs = require('fs')
const ethUtils = require('./config/utils')
const files = require('fs-extra')
const web3 = require('./config/web3')
let transactionObj = require('./config/utils.js')

//Deplying User Smart Contract
async function deploy() {

    try{
    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    
    //Identity Contract deploy
    let identityConractReceipt =  await ethUtils.deploy(devKey, "", "",identityContract.contractName)
    console.log('Identity Contract Receipt:', identityConractReceipt)
    files.emptyDirSync('../Thesis/Claims')
    files.emptyDirSync('../Thesis/public/images/claims')
    files.unlinkSync('/Users/'+process.env.USER+'/Library/Application Support/io.parity.ethereum/keys/DevelopmentChain/issuer')

    let signerAccount = web3.eth.accounts.create("issuer")
    let keyStore = web3.eth.accounts.encrypt(signerAccount.privateKey, "issuer")
    
    fs.writeFile('/Users/'+process.env.USER+'/Library/Application Support/io.parity.ethereum/keys/DevelopmentChain/issuer',
    JSON.stringify(keyStore), function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log("Claim Signer Account created")
        }
    })
    
    fs.writeFile('../Thesis/Keys/issuer',
    JSON.stringify(keyStore), async function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            claimSignerAddress = fs.readFileSync('./Keys/issuer', 'utf-8')
            claimSignerAddress = JSON.parse(claimSignerAddress)
            claimSignerAddress =  claimSignerAddress.address

            let params = {
                issuer : claimSignerAddress
            }
    
            let decryptedAccount = await transactionObj.decryptAccount(devKey, "")
            let poster = decryptedAccount.address
            web3.eth.personal.unlockAccount(decryptedAccount.address, "")
            web3.eth.personal.unlockAccount(claimSignerAddress, "issuer")
            let transaction = await transactionObj.createTransactionObject("identity",poster)
            let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
                "addIssuer", params, decryptedAccount.privateKey, decryptedAccount.address)

            console.log("Claim Signer file created in keys folder with file issuer")
            process.exit()
        }
    })
    }catch(exception){
        console.log(exception)
        process.exit()
    }
}

deploy()
