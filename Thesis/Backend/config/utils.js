/*
This file provides all relevant utility functions used in the development of infrastructure
*/

const web3 = require('./web3')
const nacl = require('tweetnacl')
const path = require('path')
nacl.util = require('tweetnacl-util')
const fs = require('fs')
const keyGenerator = require('../keyGeneration')
const router = require('../routes/UserManagement')
let key = new keyGenerator(web3, nacl, fs)
var querystring = require('querystring')
var http = require('http')

/*
Creates a signature for authentication
The function uses tweetnacl box functionality to encrypt information
*/

exports.createSignature = async() => {

    let account = this.generateNewAccount()

    let signature = await nacl.util.decodeUTF8(JSON.stringify(account.sign(account.address, account.secretKey)))
    signature = Uint8Array.from(signature)
    console.log("Signature:",signature)

    let serverPubKey =  Uint8Array.from([
        1,  15, 187, 188, 181, 158, 112,  91,
      194,  48,  25,  39,  61, 165, 191, 231,
      211, 136, 140, 131,   0, 171,  34, 144,
       23, 200,  86, 103,  83,  24,  58,  13
    ])
   
    let box = nacl.box(signature, nonce, serverPubKey, decryptedAccount.secretKey)

    let token = publicKey + web3.utils.bytesToHex(box)
    
    this.verifySignture(token,nonce)
}

/*
Verifies a signature from user
The function uses tweetnacl box functionality to decrypt information
*/

exports.verifySignture = async(token,nonce) => {
    
    let key = token.slice(0,66)
    key = Uint8Array.from(web3.utils.hexToBytes(key))

    let box = token.slice(66,token.length)
    box = Uint8Array.from(web3.utils.hexToBytes(box))

    let signature = nacl.box.open(box, nonce, key, Uint8Array.from(web3.utils.hexToBytes(decryptedAccount.privateKey)))
    signature = nacl.util.encodeUTF8(signature)
    console.log("Signature:",signature)

    console.log(web3.eth.accounts.recover(JSON.parse(signature)))
}

/*
Genrates an Ethereum account for user
*/

exports.generateNewAccount = async() => {

    let keyPair = nacl.box.keyPair(nacl.randomBytes(24))

    let nonce = nacl.randomBytes(24)
    let publicKey = web3.utils.bytesToHex(keyPair.publicKey)
    
    let account = web3.eth.accounts.privateKeyToAccount(web3.utils.randomHex(32))
    account.publicKey = publicKey

    let message = Uint8Array.from(nacl.util.decodeUTF8(JSON.stringify(account)))

    return {account, message, nonce}
} 

/*
Encrypts information from administrative account
The function uses tweetnacl box functionality to encrypt information
*/

exports.encryptAccount = async(message, nonce, senderPubKey, decryptedAccount) => {

    senderPubKey = Uint8Array.from(Object.values(senderPubKey))

    let encryptedAccount = nacl.box(Uint8Array.from(message), nonce,
                                Uint8Array.from(senderPubKey), 
                                Uint8Array.from(web3.utils.hexToBytes(decryptedAccount.privateKey)))
    return {encryptedAccount, nonce}
}

/*
Decrypts any Ethereum account
The function uses web3.js library to decrypt account
Ethereum account's address and private key is used to decrypt account
*/

exports.decryptAccount = async(account, password) => {
    let decryptedAccount = web3.eth.accounts.decrypt(account, password)
    let publicKey = await key.getPublicKey(decryptedAccount.privateKey)
    decryptedAccount.publicKey = publicKey
    return decryptedAccount
}

/*
Encrypts a message with tweetnacl box functionality
*/

exports.encryptMessage = async(message, publicKey, privateKey) => {
    let nonce = nacl.randomBytes(24)
    message = nacl.util.decodeUTF8(JSON.stringify(message))
    publicKey = Object.values(publicKey)
    let encryptedMessage = nacl.box(Uint8Array.from(message), nonce,
                                Uint8Array.from(publicKey), 
                                Uint8Array.from(web3.utils.hexToBytes(privateKey)))

    return {encryptedMessage , nonce}
}

/*
Decrypts a message with tweetnacl box functionality
*/

exports.decryptMessage = async(encryptedMessage, nonce, publicKey, privateKey) => {
    encryptedMessage = Object.values(encryptedMessage)
    nonce = Object.values(nonce)
    publicKey = Object.values(publicKey)
    let decryptedMessage = nacl.box.open(Uint8Array.from(encryptedMessage), Uint8Array.from(nonce), 
                                          Uint8Array.from(publicKey), 
                                          Uint8Array.from(web3.utils.hexToBytes(privateKey)))
    decryptedMessage = nacl.util.encodeUTF8(decryptedMessage)
    return decryptedMessage
}

/*
Creates an Ethereum account with wallet file
This functionality is not utilised for thesis
*/

exports.createAccount = async(entropy) => {

    let Account = web3.eth.accounts.create(entropy)
    Account.publicKey = key.getPublicKey(Account.privateKey)
    keyStoreFileName = Account.address+"_WalletFile"
    Account.keyStoreFileName = keyStoreFileName
    let keyStore = web3.eth.accounts.encrypt(Account.privateKey, entropy)
    return{Account: Account, keyStore: keyStore, keyStoreFileName: keyStoreFileName}
}

/*
Generates a wallet file from Ethereum account
This functionality is not utilised for thesis
*/

exports.generatKeyStore = async(fileName, key) => {

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAccount = await this.decryptAccount(devKey, "")
    let nonce = nacl.randomBytes(24)
    key = nacl.util.decodeUTF8(JSON.stringify(key))
    let encryptionKey = Buffer.from(web3.utils.hexToBytes(decryptedAccount.privateKey))
    let encrypted = nacl.secretbox(key, nonce, encryptionKey)
    encrypted = nacl.util.encodeBase64(encrypted)

    fs.writeFile('../Thesis/Keys/'+fileName+'',
    encrypted, 'ascii', function (err) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log("File Saved")
        }
    })

    fs.writeFile('../Thesis/Nonces/'+fileName+'',
    nonce, 'ascii', function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log("Nonce Saved")
        }
    })
}

/*
Stores a wallet file to register an Ethereum account
This functionality is not utilised for thesis
*/

exports.addAccountToParity = async(fileName, key) => {
    fs.writeFile('/Users/'+process.env.USER+'/Library/Application Support/io.parity.ethereum/keys/DevelopmentChain/'+fileName+'',
    JSON.stringify(key), function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log("Account Saved")
        }
    })
}

/*
Creates a transaction object to be signed
The function uses Identity.sol contract's information to create a transaction object
*/

exports.createTransactionObject = async(name, params) => {
    
    if(name=="identity")
    {
        const contractABI = require('../build/contracts/Identity.json')
        const contractAddress = require('../contractAddresses/IdentityAddress.json').address
        const contract = new web3.eth.Contract(contractABI.abi, contractAddress)

        let transactionObject = {
            from : params.poster,
            to : contractAddress,  
        }

        return {transactionObject, contract}
    }
    else if(name=="signUp")
    {   
        const contractABI = require('../build/contracts/Identity.json')
        const contractAddress = require('../contractAddresses/IdentityAddress.json').address
        const contract = new web3.eth.Contract(contractABI.abi, contractAddress) 

        console.log("Poster:",params.poster)
        let transactionObject = {
            from : params.poster,
            to : contractAddress,  
        }

        return {transactionObject, contract}
    }
}

/*
Certain reusable Smart contracts functions are matched and called
The function sends the transaction to blockchain network matched with a method name
*/

exports.transaction = async (contract, transactionObject, methodName, params, privateKey, accountAddress) => { 

try{
    if(methodName=='signUp')
    {
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.gas = await contract.methods.signUp(params.email,params.pubKey,params.address,params.status).estimateGas()
        transactionObject.data =  await contract.methods.signUp(params.email,params.pubKey,params.address,params.status).encodeABI()

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        let receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){
        }).on('error', function(err){
            console.log("Error:", err)
        })
        return receipt
    }
    else if(methodName=='isUser')
    {
        return await contract.methods.isUser(params.username).call()

    }
    else if(methodName=='getPublicKey')
    {   
        let result = await contract.methods.getPublicKey(params.param1).call()
        return result
    }
    else if(methodName=='changeStatus')
    {
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.data =  await contract.methods.changeStatus(params.param1, params.param4).encodeABI()
        transactionObject.gas = await contract.methods.changeStatus(params.param1, params.param4).estimateGas({from : accountAddress})

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        console.log('Signed Transaction:', signedTransaction)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

             console.log('Receipt:', result)
        })
    }
    else if(methodName=='getUser')
    {
        return await contract.methods.getUser(params.param1).call()
    }
    else if(methodName=='addKey')
    {   
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.data =  await contract.methods.addKey(params.param1, params.param2).encodeABI()
        transactionObject.gas = await contract.methods.addKey(params.param1, params.param2).estimateGas({from : accountAddress})

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

             console.log('Receipt:', result)
        })
    }
    else if(methodName=="getKey")
    {
        return await contract.methods.getKey(params.address).call()
    }
    else if(methodName=="getKeysByPurpose")
    {
        return await contract.methods.getKeysByPurpose(params.purpose).call()
    }
    else if(methodName=="getKeyPurpose")
    {
        return await contract.methods.getKeyPurpose(params.key).call()
    }
    else if(methodName=="removeKey")
    {
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.data =  await contract.methods.removeKey(params.key).encodeABI()
        transactionObject.gas = await contract.methods.removeKey(params.key).estimateGas({from : accountAddress})

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

             console.log('Receipt:', result)
        })
    }
    else if(methodName=="addIssuer")
    {
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.data =  await contract.methods.addIssuer(params.issuer).encodeABI()
        transactionObject.gas = await contract.methods.addIssuer(params.issuer).estimateGas({from : accountAddress})

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

             console.log('Receipt:', result)
        })
    }
    else if(methodName=="removeIssuer")
    {
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.data =  await contract.methods.removeIssuer(params.issuer).encodeABI()
        transactionObject.gas = await contract.methods.removeIssuer(params.issuer).estimateGas({from : accountAddress})

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

             console.log('Receipt:', result)
        })
    }
    else if(methodName=="isIssuer")
    {
        return await contract.methods.isIssuer(params.issuer).call()
    }
    else if(methodName=="getPreRequisites")
    {
        return await contract.methods.getPreRequisiteIds(params.claimId).call()
    }
    else if(methodName=="claimHasPreRequisite")
    {
        return await contract.methods.claimHasPreReq(params.claimId).call()
    }
    else if(methodName=="getClaim")
    {
        return await contract.methods.getClaim(params.claimId).call()
    }
    else if(methodName=="getClaimIdsByType")
    {
        return await contract.methods.getClaimIdsByType(params.claimType).call()
    }
    else if(methodName=="removeClaim")
    {
        transactionObject.nonce = await web3.eth.getTransactionCount(accountAddress)
        transactionObject.data =  await contract.methods.removeClaim(params.claimId).encodeABI()
        transactionObject.gas = await contract.methods.removeClaim(params.claimId).estimateGas({from : accountAddress})

        let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

             console.log('Receipt:', result)
        })
    }
    else if(methodName=="getClaimHolders")
    {
        return await contract.methods.getClaimHolders(params.claimId).call({from:accountAddress})
    }
    else if(methodName="verifyClaim")
    {
        return await contract.methods.claimIsValid(params.claimId,params.claimer).call({from:accountAddress})
    }

    }catch(exception)
    {
        console.log("Error:", exception)
    }
}

/*
The function deploy Smart Contracts on blockchain network
*/

exports.deploy = async(fromAccount, name, password, contractName, constructorArgs) =>{

    let decryptedAccount
    if(name=="dev" && password=="")
    {
        decryptedAccount = web3.eth.accounts.decrypt(fromAccount, '')
    }
    else
    {
        decryptedAccount = web3.eth.accounts.decrypt(fromAccount, password)
    }
    
    const contractABIpath = path.join('../build/contracts', contractName +'.json')
    const contractABI =  require(contractABIpath)
    const contract = new web3.eth.Contract(contractABI.abi)

    let deployedContract

    //Verifier
    if(constructorArgs)
    {
        console.log("Verifier")
        deployedContract = contract.deploy({
            data:contractABI.bytecode,
            arguments: constructorArgs
        })
    }
    else
    {
        deployedContract = contract.deploy({
            data : contractABI.bytecode
        })
    }

    let estimatedGas = await deployedContract.estimateGas({from: decryptedAccount.address})

    let transactionObject = {
        from : decryptedAccount.address,
        data: deployedContract.encodeABI(),
        gas : estimatedGas
    }

    let signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, decryptedAccount.privateKey).then((result)=>{
        return result
    })

    let receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function (receipt) {
    
        try{
            
        if(name=="dev" && password=="")
        {
            fs.writeFile('../Thesis/contractABI/'+'dev'+contractName+'.json', 
            JSON.stringify(contractABI.abi), function (err) {
                if(err)
                {
                    console.log(err)
                }  
            })
    
            fs.writeFile('../Thesis/contractAddresses/'+contractName+'Address'+'.json', 
            JSON.stringify({
                address : receipt.contractAddress
            }), function(err) {
              if(err)
              {
                  console.log(err)
              }  
            })
        }else
        {
            console.log("Name:", name)
            fs.writeFile('../Thesis/contractABI/'+name+contractName+'.json', 
            JSON.stringify(contractABI.abi), function (err) {
                if(err)
                {
                    console.log(err)
                }  
            })
    
            fs.writeFile('../Thesis/contractAddresses/'+name+contractName+'Address'+'.json', 
            JSON.stringify({
                address : receipt.contractAddress
            }), function(err) {
              if(err)
              {
                  console.log(err)
              }  
            })
        }
        }
        catch(err)
        {
            console.log(err)
        }
    })
    return receipt
}