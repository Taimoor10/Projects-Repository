/*
This file povides the layer to communicate and send transactions to Identity.sol contract
It also provide routes for claims fetching and claims issuance to users
It also defines the route to verify user credentials
*/

let transactionObj = require('../config/utils.js')
const socketConnect = require('../socketConnection')
const fs = require('fs')
let qrCode = require('./createClaimsQR')
const express = require('express')
const web3 = require('../config/web3')
const files = require('fs-extra')
var router = express.Router()
var cors = require('cors')

/*
Allows administrator to add key for an entity in smart contract
*/

router.post('/addKey', async(req, res)=>{
    let address = req.body.address;
    let purpose = req.body.purpose;

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(devKey, "")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "")

    let params = {
        param1 : address,
        param2 : purpose, 
        poster : poster
    }
    let transaction = await transactionObj.createTransactionObject("identity", params)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject, 
        'addKey', params, decryptedAccount.privateKey, decryptedAccount.address)
    
    res.sendStatus(200)
})

/*
Returns a key object from Smart Contract against the provided address
*/

router.post('/getKey', async(req,res)=>{
    let address = req.body.address

    let params = {
        address: address
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getKey", params, "", "")
    console.log("Key:", result)

    res.sendStatus(200)
})

/*
Returns a key from Smart Contract against the provided purpose
*/

router.post('/getKeysByPurpose', async(req,res)=>{
    let purpose = req.body.purpose

    let params = {
        purpose : purpose
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getKeysByPurpose", params,"","")
    console.log("Keys:", result)

    res.sendStatus(200)
})

/*
Returns the purpose of a key against the provided address as key
*/

router.post('/getKeyPurpose', async(req,res)=>{
    let key = req.body.key

    let params = {
        key : key
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getKeyPurpose", params,"","")
    console.log("Purpose:", result)

    res.sendStatus(200)  
})

/*
Returns the key from Smart Contract
*/

router.post('/removeKey', async(req,res)=>{
    let key = req.body.key

    let params = {
        key : key
    }

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(devKey, "")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "")

    let transaction = await transactionObj.createTransactionObject("identity",poster)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "removeKey", params, decryptedAccount.privateKey, decryptedAccount.address)
    
    res.sendStatus(200)
})

/*
Allows Administrator to add claim issuers in smart contract
*/

router.post('/addIssuer', async(req,res)=>{
    let address = req.body.address
    console.log(req.body.address)
    let params = {
        issuer : address
    }

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(devKey, "")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "")

    let transaction = await transactionObj.createTransactionObject("identity",poster)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "addIssuer", params, decryptedAccount.privateKey, decryptedAccount.address)
    
    res.sendStatus(200)
})

/*
Remove Claim Issuers priveleges
*/

router.post('/removeIssuer', async(req,res)=>{
    let address = req.body.address
    console.log(req.body.address)
    let params = {
        issuer : address
    }

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(devKey, "")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "")

    let transaction = await transactionObj.createTransactionObject("identity",poster)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "removeIssuer", params, decryptedAccount.privateKey, decryptedAccount.address)
    
    res.sendStatus(200)
})

/*
Returns the claim issuer status of the provided entity
*/

router.post('/isIssuer', async(req,res)=>{
    let address = req.body.address

    let params = {
        issuer : address
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "isIssuer", params,"","")
    console.log("Is Issuer:", result)

    res.sendStatus(200) 
})

/*
Allow claim issuers to add claims in smart contract
*/

router.post('/addClaim', async(req,res)=>{
    let claimName = web3.utils.asciiToHex(req.body.claimName)
    let claimType = req.body.claimType
    let scheme = req.body.scheme
    let issuer = req.body.issuer
    let claimData = web3.utils.asciiToHex(JSON.stringify(req.body.data))
    let uri = req.body.uri;
    let issuerName = req.body.issuerName

    const issuerAccount = fs.readFileSync('./Keys/issuer', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(issuerAccount, "issuer")
    let poster = decryptedAccount.address
    console.log(poster)

        let issuerObject = {
            issuer : issuer
        }

        let issuertransaction = await transactionObj.createTransactionObject("identity", "")
        let result = await transactionObj.transaction(issuertransaction.contract, issuertransaction.transactionObject,
                                "isIssuer", issuerObject,"","")
        console.log("Is Issuer:", result)
        if(result==false)
        {
            console.log("Issuer is not registered")
            res.send("Unauthorized Issuer Request, Register first")
            return
        }

    
        web3.eth.personal.unlockAccount(decryptedAccount.address, "issuer")
        const hashedDatatoSign = web3.utils.soliditySha3(issuer,claimType,claimData)
        const signature = await web3.eth.sign(hashedDatatoSign,decryptedAccount.address)

        let params = {
            claimName : claimName,
            claimType : claimType,
            scheme : scheme,
            issuer : issuer,
            signature : signature,
            data : claimData,
            uri : uri,
            issuerName : issuerName
        }

        web3.eth.personal.unlockAccount(decryptedAccount.address, "issuer")
        let transaction = await transactionObj.createTransactionObject("identity",poster)

        transaction.transactionObject.nonce = await web3.eth.getTransactionCount(poster)
        transaction.transactionObject.data =  await transaction.contract.methods.addClaim(params.claimName,params.claimType,params.scheme,
                                        params.issuer,params.signature,params.data,params.uri,params.issuerName).encodeABI()
        transaction.transactionObject.gas = await transaction.contract.methods.addClaim(params.claimName,params.claimType,params.scheme,
                                        params.issuer,params.signature,params.data,params.uri,params.issuerName).estimateGas({from : poster})

        let signedTransaction = await web3.eth.accounts.signTransaction(transaction.transactionObject, decryptedAccount.privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){
        }).then(()=>{
            let claimId = transaction.contract.methods.getClaimIdByName(claimName).call()
            Promise.resolve(claimId).then((value)=>{
                let claimData = transaction.contract.methods.getClaim(value).call()
                claimData.then(async(claimInformation)=>{
                    const info = {
                        type : "ClaimAdded",
                        claimId : value,
                        claimName : req.body.claimName,
                        issuer : claimInformation.issuer,
                        data : web3.utils.toAscii(claimInformation.data),
                        uri : claimInformation.uri,
                        issuerName: claimInformation.issuerName
                    }

                await qrCode.generatesQRcode(info)
                console.log("Claim Added Successfully")
                res.sendStatus(200)
                })
            })
           
        }).catch(()=>{
            console.log("Error while Adding claims")
        })
    //}
})

/*
Returns the claim object against the provided claim ID
*/

router.post('/getClaim', async(req,res)=>{
    let claimId = req.body.claimId

    let params = {
        claimId : claimId
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getClaim", params,"","")
    console.log("Claim:", result)

    res.sendStatus(200) 
})

/*
Returns all Claim IDs of the provided type
*/

router.post('/getClaimIdsByType', async(req,res)=>{
    let claimType = req.body.claimType

    let params = {
        claimType : claimType
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getClaimIdsByType", params,"","")
    console.log("Claim Ids:", result)

    res.sendStatus(200) 
})

/*
Removes the claim from smart contract
*/

router.post('/removeClaim', async(req,res)=>{
    let claimId = req.body.claimId
    let claimName = req.body.claimName

    let params = {
        claimId : claimId
    }

    const issuerAccount = fs.readFileSync('./Keys/issuer', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(issuerAccount, "issuer")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "issuer")

    let transaction = await transactionObj.createTransactionObject("identity",poster)
    
    transaction.transactionObject.nonce = await web3.eth.getTransactionCount(poster)
    transaction.transactionObject.data =  await transaction.contract.methods.removeClaim(params.claimId).encodeABI()
    transaction.transactionObject.gas = await transaction.contract.methods.removeClaim(params.claimId).estimateGas({from : poster})

    let signedTransaction = await web3.eth.accounts.signTransaction(transaction.transactionObject, decryptedAccount.privateKey)
    await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){
    }).then(()=>{
            
            files.unlinkSync("../Thesis/Claims/"+claimName+"")
            console.log("Claim Removed:",claimName)
            res.sendStatus(200)
                    
    }).catch((err)=>{
        console.log("Error:",err.message)
    })
})

/*
Allow claim issuers to issue claims
Claim data is provided as a callback from user after scanning a QR code
*/

router.post('/issueClaim', async(req,res)=>{

    const issuerAccount = fs.readFileSync('./Keys/issuer', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(issuerAccount, "issuer")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "issuer")

    let transaction = await transactionObj.createTransactionObject("identity",poster)

    let claim = await JSON.parse(req.body.qr)
    
    if(claim.claimName == "Claim City")
    {
        let country = req.body.country
        let email = req.body.email
        let name = req.body.name
        let phone = req.body.phone
        let username = web3.utils.asciiToHex(req.body.username)
        let claimer = req.body.claimer

        console.log("Username,claimer:",username,claimer)
        if(country==undefined || email==undefined|| name==undefined ||  phone==undefined )
        {
            console.log("Incomplete Details")
        }
        else
        {
            let params = {
                claimId : claim.claimId,
                email : username,
                claimer : claimer
            }

            transaction.transactionObject.nonce = await web3.eth.getTransactionCount(poster)
            transaction.transactionObject.data =  await transaction.contract.methods.issueClaim(params.claimId,params.email,params.claimer).encodeABI()
            transaction.transactionObject.gas = await transaction.contract.methods.issueClaim(params.claimId,params.email,params.claimer).estimateGas({from : poster})
            transaction.transactionObject.from = poster
            let signedTransaction = await web3.eth.accounts.signTransaction(transaction.transactionObject, decryptedAccount.privateKey)

            await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){
            }).then(() => {
                let claimData = transaction.contract.methods.getClaim(params.claimId).call()
                Promise.resolve(claimData).then((data)=>{
                    const sendClaimData = {
                            claimId : claim.claimId,
                            claimName : web3.utils.toAscii(data.claimName),
                            issuer : data.issuer,
                            data :JSON.stringify({
                                name : name,
                                email: email,
                                country: country,
                                phone: phone
                            }),
                            uri : data.uri,
                            issuerName : data.issuerName
                        }
                    console.log("City Claim Issued",sendClaimData)
                    res.send(sendClaimData)
                })
            }).catch(()=>{
                console.log("Error while issuing City Claim")
            }) 
        }
    }
    else
    {
        claimId = await claim.claimId
        console.log("Claim Id:",claimId)
        let email = web3.utils.asciiToHex(req.body.email)
        let claimer = req.body.claimer

        let params = {
            claimId : claimId,
            email : email,
            claimer : claimer
        }
            
        transaction.transactionObject.nonce = await web3.eth.getTransactionCount(poster)
        transaction.transactionObject.data =  await transaction.contract.methods.issueClaim(params.claimId,params.email,params.claimer).encodeABI()
        transaction.transactionObject.gas = await transaction.contract.methods.issueClaim(params.claimId,params.email,params.claimer).estimateGas({from : poster})
        transaction.transactionObject.from = poster
        let signedTransaction = await web3.eth.accounts.signTransaction(transaction.transactionObject, decryptedAccount.privateKey)

        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){
        }).then(() => {
            let claimData = transaction.contract.methods.getClaim(params.claimId).call()
            Promise.resolve(claimData).then((data)=>{
                const sendClaimData = {
                        claimId : claimId,
                        claimName : web3.utils.toAscii(data.claimName),
                        issuer : data.issuer,
                        data : web3.utils.toAscii(data.data),
                        uri : data.uri,
                        issuerName : data.issuerName
                    }
                console.log("Claim Issued",sendClaimData)
                res.send(sendClaimData)
            })
        }).catch(()=>{
            console.log("Error while issuing claim")
        })
    }                     
})

/*
Return all addresses assigned a particular claim provided as claim ID
*/

router.post('/getClaimHolders', async(req,res)=>{
    let claimId = req.body.claimId

    let params = {
        claimId : claimId
    }

    const issuerAccount = fs.readFileSync('./Keys/issuer', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(issuerAccount, "issuer")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "issuer")

    let transaction = await transactionObj.createTransactionObject("identity",poster)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getClaimHolders", params, decryptedAccount.privateKey, decryptedAccount.address)
    console.log("Claim Holders:", result)
    res.sendStatus(200)
})

/*
Returns the validity status of a claim
Third party verifiers send claim ID and claim holder's address to this function
*/

router.post('/verifyClaim', async(req,res)=>{
    let data = req.body
    console.log("Data:",data)
    
    let claimId = data.claimId
    let claimer = data.claimer

    let params = {
        claimId : claimId,
        claimer : claimer
    }

    let transaction = await transactionObj.createTransactionObject("identity","")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "verifyClaim", params, "", "")
    console.log("Result:", result)
    
    res.send(result)

})

/*
Allow claim issuer entity to add pre-requisite claims for a certain claim
*/

router.post('/addPreRequisite', async(req,res)=>{
    let claimId = req.body.claimId
    let preReqId = req.body.preReqId
    
    let params = {
        claimId : claimId,
        preReqId : preReqId
    }

    const issuerAccount = fs.readFileSync('./Keys/issuer', 'utf8')
    let decryptedAccount = await transactionObj.decryptAccount(issuerAccount, "issuer")
    let poster = decryptedAccount.address
    web3.eth.personal.unlockAccount(decryptedAccount.address, "issuer")

    let transaction = await transactionObj.createTransactionObject("identity",poster)
    transaction.transactionObject.from = poster
    transaction.transactionObject.nonce = await web3.eth.getTransactionCount(poster)
    transaction.transactionObject.data =  await transaction.contract.methods.addPreRequistesClaim(params.claimId,params.preReqId).encodeABI()
    transaction.transactionObject.gas = await transaction.contract.methods.addPreRequistesClaim(params.claimId,params.preReqId).estimateGas({from : poster})
    let signedTransaction = await web3.eth.accounts.signTransaction(transaction.transactionObject, decryptedAccount.privateKey)

    await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).on('receipt', function(result){

    }).then(()=>{
        let claimData = transaction.contract.methods.getClaim(claimId).call()
        Promise.resolve(claimData).then((value)=>{

            console.log("ClaimData:",value)
            let claimName = value.claimName
            let issuerName = value.issuerName
            claimName = claimName.substring(2,claimName.Length)
            claimName = web3.utils.toAscii('0x'+claimName.replace(/^0+|0+$/g, ""))
            console.log("Claim Name:",claimName)

            let preReqIds = transaction.contract.methods.getPreRequisiteIds(claimId).call()
            preReqIds.then(async(result)=>{
            console.log("Pre Req Ids:",result)

                const info = {
                    type : "PreReqAdded",
                    claimId : claimId,
                    claimName : claimName,
                    data : web3.utils.toAscii(value.data),
                    issuerName : issuerName,
                    preReqs : result
                }

            await qrCode.generatesQRcode(info)
            console.log("Pre Reqs Added Successfully")
            res.sendStatus(200)
            })
        })
    }).catch(()=>{
        console.log("Error while Adding claims")
    })
})

/*
Returns all pre-requisite claims ID for a particular claim
*/

router.post("/getPreRequisites", async(req, res)=>{
    let claimId = req.body.claimId

    let params = {
        claimId : claimId,
    }

    let transaction = await transactionObj.createTransactionObject("identity","")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "getPreRequisites", params, "", "")
    console.log("Result:", result)
    
    res.sendStatus(200)

})


/*
Returns the status of claim to have pre-requisite claims as boolean
*/

router.post("/claimHasPreReq", async(req,res)=>{
    let claimId = req.body.claimId

    let params = {
        claimId : claimId,
    }

    let transaction = await transactionObj.createTransactionObject("identity","")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "claimHasPreRequisite", params, "", "")
    console.log("Result:", result)
    
    res.sendStatus(200)
})


router.post("/gtx", async(req,res)=>{
    console.log(req.body)
    res.sendStatus(200)
})

/*
Default route
*/

router.get('/', function(req,res){
    res.send("No other Route found")
})

module.exports = router
