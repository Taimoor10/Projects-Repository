var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.urlencoded({extended:true}))

var Tx = require('ethereumjs-tx')
const Web3 = require('web3')
const web3 = new Web3('ws://localhost:8546')


const privateKey1 = Buffer.from('4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7', 'hex')
const privateKey2 = Buffer.from('88748d4551fbb0a1e1ef83eaab01eb20ec6392c5a6999b6c8a135ae6ed3c7d04', 'hex')

const contractABI = [{"constant":true,"inputs":[{"name":"resourceId","type":"int256"},{"name":"user","type":"address"}],"name":"RevokeResourceAccess","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"resourceId","type":"int256"},{"name":"user","type":"address"}],"name":"GrantResourceAccess","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"resourceId","type":"int256"},{"name":"buyer","type":"address"}],"name":"ApprovePurchaseRights","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"resourceId","type":"int256"},{"name":"user","type":"address"}],"name":"ApproveResourceAccess","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"resourceId","type":"int256"},{"name":"buyer","type":"address"}],"name":"GrantPurchaseRights","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"resourceId","type":"int256"}],"name":"PurchaseResource","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"buyer","type":"address"},{"indexed":false,"name":"resourceid","type":"int256"},{"indexed":false,"name":"value","type":"int256"}],"name":"ConfirmPurchase","type":"event"}]
const contractAddress = '0xF55CC28D2bdaB325Fd9F2A41e98f4078f929BA74'
var mycontract = new web3.eth.Contract(contractABI, contractAddress)


//Grant Resource Access
app.post('/GrantResourceAccess', function(req,res) {
	console.log("----------------------------------------")
	var fromAddress = req.body.fromaddress
	console.log("From:", fromAddress)
	var toAddress = req.body.toaddress
	console.log("TO:", toAddress)
	var resourceId = req.body.resourceid
	console.log("Resource ID:", resourceId)
	var buyeraddress = req.body.buyeraddress
	console.log("Buyer Address:", buyeraddress)
	var etherValue = req.body.ethervalue
	console.log("Ether Value:", etherValue)
	var gasLimit = req.body.gaslimit
	console.log("Gas Limit:", gasLimit)
	var gasPrice = req.body.gasprice
	console.log("Gas Price:", gasPrice)

	GrantResourceAccess(fromAddress, toAddress, resourceId, buyeraddress, etherValue, gasLimit, gasPrice, privateKey1)
	
});


function GrantResourceAccess(fromAddress, toAddress, resourceid, buyeraddress, etherValue, gasLimit, gasPrice, privateKey)
{

web3.eth.getTransactionCount(fromAddress, (err,txCount) =>
{
	const txObject = {
	nonce: web3.utils.toHex(txCount),
	from: fromAddress,
	to: toAddress,
	value: web3.utils.toHex(web3.utils.toWei(etherValue, 'ether')),
	data: mycontract.methods.GrantResourceAccess(resourceid, buyeraddress).encodeABI(),
	gasLimit: web3.utils.toHex(web3.utils.toWei(gasLimit, 'ether')),
	gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, 'ether'))
}

const tx = new Tx(txObject)
tx.sign(privateKey)

const serializedTransaction = tx.serialize()
const raw = '0x' + serializedTransaction.toString('hex')

return sendSignedTransaction(raw)

});
}

//Grant Purchase Rights
app.post('/GrantPurchaseRights', function(req,res) {
	var fromAddress = req.body.fromaddress
	console.log("From Address:", fromAddress)
	var toAddress = req.body.toaddress
	console.log("TO:", toAddress)
	var resourceId = req.body.resourceid
	console.log("Resource ID:", resourceId)
	var buyerAddress = req.body.buyeraddress
	console.log("Buyer Address:", buyerAddress)
	var etherValue = req.body.ethervalue
	console.log("Ether Value:", etherValue)
	var gasLimit = req.body.gaslimit
	console.log("Gas Limit:", gasLimit)
	var gasPrice = req.body.gasprice
	console.log("Gas Price:", gasPrice)

	GrantPurchaseRights(fromAddress, toAddress, resourceId, buyerAddress, etherValue, gasLimit, gasPrice, privateKey1)		
});

function GrantPurchaseRights(fromAddress, toAddress, resourceId, buyerAddress, etherValue, gasLimit, gasPrice, privatekey)
{
	web3.eth.getTransactionCount(fromAddress, (err, txCount)=>
	{
		const txObject = {
		nonce: web3.utils.toHex(txCount),
		from: fromAddress,
		to: toAddress,
		value: web3.utils.toHex(web3.utils.toWei(etherValue, 'ether')),
		data: mycontract.methods.GrantPurchaseRights(resourceId, buyerAddress).encodeABI(),
		gasLimit: web3.utils.toHex(web3.utils.toWei(gasLimit, 'ether')),
		gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, 'ether'))
	}

const tx = new Tx(txObject)
tx.sign(privatekey)

const serializedTransaction = tx.serialize()
const raw = '0x' + serializedTransaction.toString('hex')

return sendSignedTransaction(raw)

});
}

//Purchase Resource
app.post('/PurchaseResource', function(req,res) {
	var fromAddress = req.body.fromaddress
	console.log(fromAddress)
	var toAddress = req.body.toaddress
	console.log(toAddress)
	var resourceId = req.body.resourceid
	console.log(resourceId)
	var etherValue = req.body.ethervalue
	console.log(etherValue)
	var gasLimit = req.body.gaslimit
	console.log(gasLimit)
	var gasPrice = req.body.gasprice
	console.log(gasPrice)

	PurchaseResource(fromAddress, toAddress, resourceId, etherValue, gasLimit, gasPrice, privateKey2)

});

function PurchaseResource(fromAddress, toAddress, resourceId, etherValue, gasLimit, gasPrice, privatekey)
{
	web3.eth.getTransactionCount(fromAddress, (err, txCount)=>
	{
		const txObject = {
		nonce: web3.utils.toHex(txCount),
		from: fromAddress,
		to: toAddress,
		value: web3.utils.toHex(web3.utils.toWei(etherValue, 'ether')),
		data: mycontract.methods.PurchaseResource(resourceId).encodeABI(),
		gasLimit: web3.utils.toHex(web3.utils.toWei(gasLimit, 'ether')),
		gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, 'ether'))
	}

	const tx = new Tx(txObject)
	tx.sign(privatekey)

	const serializedTransaction = tx.serialize()
	const raw = '0x' + serializedTransaction.toString('hex')

	return sendSignedTransaction(raw)
	
	});
}

//Send signed Transaction function
function sendSignedTransaction(rawTransaction)
{
	web3.eth.sendSignedTransaction(rawTransaction, (err,txHash)=>{
		console.log("Transaction Hash:", txHash)
		console.log("----------------------------------------")
	});
}

//Approve Resource Access
app.post('/ApproveResourceAccess', function(req,res) {
	var fromAddress = req.body.fromaddress
	console.log(fromAddress)
	var ResourceId = req.body.resourceid
	console.log(ResourceId)
	var userAddress = req.body.useraddress
	console.log(userAddress)

	ApproveResourceAccess(fromAddress, ResourceId, userAddress)
})

function ApproveResourceAccess(fromaddress, resourceId, useraddress)
{
	mycontract.methods.ApproveResourceAccess(resourceId, useraddress).call({from:fromaddress}).then((result) => {
		console.log(result)
		return result
	})
}

//Approve purchase Rights
app.post('/ApprovePurchaseRights', function(req,res) {
	var fromAddress = req.body.fromaddress
	console.log(fromAddress)
	var ResourceId = req.body.resourceid
	console.log(ResourceId)
	var userAddress = req.body.useraddress
	console.log(userAddress)

	ApprovePurchaseRights(fromAddress, ResourceId, userAddress)
})

function ApprovePurchaseRights(fromaddress, resourceId, useraddress)
{
	mycontract.methods.ApprovePurchaseRights(resourceId, useraddress).call({from:fromaddress}).then((result) => {
		console.log(result)
		return result
	})
}

//View Smart Contract Balance
app.get('/viewbalance', function(req,res) {
		web3.eth.getBalance(contractAddress, (err, balance)=>{
			var contractBalance = balance
			console.log(contractBalance)
			res.send(contractBalance)
		})
	
	/*mycontract.methods.viewBalance().call().then((result)=> {
		console.log(result.toNumber())
		res.send(result)
	})*/
})

app.listen(8080, function() {
	console.log('Server Running')
})


