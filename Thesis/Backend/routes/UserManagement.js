let transactionObj = require('../config/utils.js')
const socketConnect = require('../socketConnection')
const fs = require('fs')
var Jimp = require("jimp")
var QrCode = require('qrcode-reader')
const express = require('express')
const web3 = require('../config/web3')
const { shadow } = require('jimp')
const { claim } = require('../eventListener.js')
var router = express.Router()

//Sign Up anonymous
router.post('/createAccount', async(req, res) => {
    console.log("I am here")
    let nonceValue = req.body.nonceValue
    let encryptedMessage = req.body.encryptedMessage
    let publicKey = req.body.publicKey

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAdminAccount = await transactionObj.decryptAccount(devKey, "")

    let decryptedMessage = await transactionObj.decryptMessage(encryptedMessage, nonceValue, publicKey, decryptedAdminAccount.privateKey)

    console.log(decryptedMessage)
    if(decryptedMessage != undefined)
    {
        let createdAccount = await transactionObj.generateNewAccount()

        params = {
            email : web3.utils.asciiToHex(decryptedMessage),
            pubKey : createdAccount.account.publicKey,
            address : createdAccount.account.address,
            status : true,
            poster : createdAccount.account.address
        }

        let transaction = await transactionObj.createTransactionObject("signUp",params)
        let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject, 
                        'signUp', params, createdAccount.account.privateKey, createdAccount.account.address)
        console.log("Receipt:", result)
    
        if(result==undefined)
        {
            res.sendStatus(500)
        }
        else
        {
            let encryptedAccount = await transactionObj.encryptAccount(createdAccount.message, createdAccount.nonce, publicKey, decryptedAdminAccount)
            res.send(encryptedAccount)
        }
    }
    else
    {
        console.log("Cannot Decrypt Account. Check public key again")
        res.send("Error")
    }
})


//signUp route
router.post('/signUp', async(req, res) => {
    // let email = req.body.email
    // let entropy = req.body.password
    
    let email = req.body.email
    let nonceValue = req.body.nonceValue
    let encryptedMessage = req.body.encryptedMessage
    let publicKey = req.body.publicKey

    const devKey = fs.readFileSync('./Keys/devKey', 'utf8')
    let decryptedAdminAccount = await transactionObj.decryptAccount(devKey, "")

    let decryptedMessage = await transactionObj.decryptMessage(encryptedMessage,nonceValue, publicKey, decryptedAdminAccount.privateKey)

    console.log("Email:",email)
    if(decryptedMessage != undefined)
    {
        let createdAccount = await transactionObj.createAccount(decryptedMessage)
        console.log("Account:", createdAccount.Account)

        let decryptedAccount = await transactionObj.decryptAccount(createdAccount.keyStore, decryptedMessage)
        let poster = decryptedAccount.address

        params = {
            email : web3.utils.asciiToHex(email),
            pubKey : createdAccount.Account.publicKey,
            address : createdAccount.Account.address,
            status : true,
            poster : poster
        }

        let transaction = await transactionObj.createTransactionObject("signUp",params)
        let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject, 
                        'signUp', params, createdAccount.Account.privateKey, createdAccount.Account.address)
        console.log("Receipt:", result)
        if(result)
        {
             transactionObj.generatKeyStore(createdAccount.keyStoreFileName, createdAccount.keyStore)
             transactionObj.addAccountToParity(createdAccount.keyStoreFileName, createdAccount.keyStore)
        }
    
    let decryptedCreatedAccount = await transactionObj.encryptMessage(createdAccount.Account, publicKey, decryptedAdminAccount.privateKey)
    res.send(decryptedCreatedAccount)
    }
    else
    {
        console.log("Cannot Decrypt Account. Check public key again")
        res.send("Error")
    }
})

//QR Code
router.get('/qrCode', async(req, res) => {
   
    let server = req.socket.server
    let sock = new socketConnect(server)
    sock.openSocketConnection()
    //let socket = sock.openSocketConnection()
    var buffer = fs.readFileSync('./public/images/image.png');

    let data = ''
    Jimp.read(buffer, function(err, image){
        if(err)
        {
            console.log(err)
        }
        var qr = new QrCode()
        qr.callback = async function(err, value) {
            if(err)
            {
                console.log(err)
            }
            data = JSON.stringify(value.result)
        };
        qr.decode(image.bitmap)

        if(data)
        {
            res.render('qrCode.html', {data:data})
        }
    });
})

//Claims Access Page
router.get('/claimsQR', async(req,res)=>{

    if (req.headers.referer != 'http://localhost:3000/user/qrCode')
    {
        res.redirect('http://localhost:3000/user/qrCode')
    }
    else
    {
        let data = []
        fs.readdirSync('./Claims/').forEach(file=>{
            //data.push(file)
            let content = fs.readFileSync('./Claims/'+file, 'utf8')
            content = JSON.parse(content)
            if(content.preReqs != undefined)
            {
                data.push({
                    claimName: file,
                    claimId: content.claimId,
                    preReqs : content.preReqs,
                })
            }
            else
            {
                data.push({
                    claimName:file,
                    claimId : content.claimId
                })
            }
        })   
        res.render('welcome.html', {data:data, dataLength:data.length})
    }
})

//Credentials Portal for Admin only
router.get('/credentialsQR', async(req,res)=>{

        let data = []
        fs.readdirSync('./Claims/').forEach(file=>{
            //data.push(file)
            let content = fs.readFileSync('./Claims/'+file, 'utf8')
            content = JSON.parse(content)
            if(content.preReqs != undefined)
            {
                data.push({
                    claimName: file,
                    claimId: content.claimId,
                    preReqs : content.preReqs,
                })
            }
            else
            {
                data.push({
                    claimName:file,
                    claimId : content.claimId
                })
            }
        })
        res.render('adminPortal.html', {data:data, dataLength:data.length})
})

//fetch QR data for Log in
router.post('/pushData', async(req,res)=>{
    let username = web3.utils.asciiToHex(req.body.username)
    let params = {
        username : username
    }
    let transaction = await transactionObj.createTransactionObject("identity", params)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject, 
                'isUser', params, "","")
    
    Promise.resolve(result).then(function(value){
        console.log("Is User Registered:", value)
        try{
            if(socketConnection.connected && value==true)
            {   
                socketConnection.emit('signed', {Ok : "Computer"});                
            }
            else if(socketConnection.connected && value==false)
            {
                socketConnection.emit('unsigned', "Unauthorized Request. Cannot find username. Create Ethereum Account to Login")
            }
            }catch(err)
            {
                console.log(err)
            }
        })
})

//Get User
router.post('/getUser', async(req,res)=>{
    let email = req.body.email
    let transaction = await transactionObj.createTransactionObject("signUp", email)
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject, 
                'getUser', transaction.params, transaction.Account.privateKey, transaction.Account.address)

    Promise.resolve(result).then(function(value){
        console.log("Value:", value)
        res.sendStatus(200)
    })
})

//isUser
router.post('/isUser', async(req,res)=>{
    let username = req.body.username

    let params = {
        username: web3.utils.asciiToHex(username)
    }

    let transaction = await transactionObj.createTransactionObject("identity", "")
    let result = await transactionObj.transaction(transaction.contract, transaction.transactionObject,
        "isUser", params, "", "")
    console.log("Result:", result)

    res.sendStatus(200)
})

//Get
router.get('/', function(req,res) {
     res.send("No other route found") 
 })

module.exports = router
