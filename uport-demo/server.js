/**
 * app is deployed on heroku to enable it to accept requests from public IPs
 * different host providers can be used with some changes in code
 */
const express = require('express');
const bodyParser = require('body-parser');
const decodeJWT = require('did-jwt').decodeJWT;
const { Credentials } = require('uport-credentials');
const transports = require('uport-transports').transport;
const path = require('path');
const message = require('uport-transports').message.util;


/**
 * @type {{Modules: web3; readonly default: Web3} | Web3}
 * port8546 handle RPC calls
 */
const Web3 = require('web3');
const web3 = new Web3('ws://127.0.0.1:8546');

/**
 * @type {String}
 * addresses for the accounts deployed on Ethereum Network and are different to each user
 * devaccount is default account provided by ethereum for testing purposes
 */
const devaccount = '0x00a329c0648769A73afAc7F9381E08FB43dBEA72';
const testaccount = '0x00FD3ada700c41e155f9fb0858ea6878401F8300';

/**
 * contractABI is Application Binary Interface of Smart Contract which stores all the information about smart contract
   in JSON format created after compiling a contract
 * contractABI helps in invoking a smart contract
 */
const contractABI =
	[
		{
		"constant":true,
		"inputs":
            [
                {
                    "name": "resourceId",
                    "type":"int256"
                },
                {
                    "name":"user",
                    "type":"address"
                }
            ],
		"name":"RevokeResourceAccess",
        "outputs":
            [
                {
                    "name":"",
                    "type":"bool"
                }
			],
        "payable":false,
		"stateMutability":"view",
		"type":"function"
		},
		{
		"constant":false,
        "inputs":
            [
                {
                    "name":"resourceId",
                    "type":"int256"
                },
                {
                    "name":"user",
                    "type":"address"
                }
            ],
		"name":"GrantResourceAccess",
		"outputs":
            [
                {
                    "name":"",
                    "type":"bool"
                }
            ],
        "payable":true,
		"stateMutability":"payable",
		"type":"function"
		},
		{
		"constant":true,
		"inputs":
            [
                {
                    "name":"resourceId",
                    "type":"int256"
                },
                {
                    "name":"buyer",
                    "type":"address"
                }],
        "name":"ApprovePurchaseRights",
        "outputs":
            [
                {
                    "name":"",
                    "type":"bool"
                }
            ],
		"payable":false,
		"stateMutability":"view",
		"type":"function"
		},
		{
		"constant":true,
		"inputs":
			[
			    {
			        "name":"resourceId",
                    "type":"int256"
                },
                {
                    "name":"user",
                    "type":"address"
                }
            ],
        "name":"ApproveResourceAccess",
		"outputs":
            [
                {
                    "name":"",
                    "type":"bool"
                }
			],
        "payable":false,
		"stateMutability":"view",
		"type":"function"
		},
		{
		"constant":false,
		"inputs":
            [
                {
                    "name":"resourceId",
                    "type":"int256"
                },
                {
                    "name":"buyer",
                    "type":"address"
                }
            ],
		"name":"GrantPurchaseRights",
		"outputs":[],
		"payable":false,
		"stateMutability":"nonpayable",
		"type":"function"
		},
		{
		"constant":false,
		"inputs":
            [
                {
                    "name":"resourceId",
                    "type":"int256"
                }
			],
		"name":"PurchaseResource",
		"outputs":[],
		"payable":true,
		"stateMutability":"payable",
		"type":"function"
		},
		{
		"inputs":[],
		"payable":false,
		"stateMutability":"nonpayable",
		"type":"constructor"
		},
		{
		"anonymous":false,
		"inputs":
            [
                {
                    "indexed":false,
                    "name":"buyer",
                    "type":"address"
                },
                {
                    "indexed":false,
                    "name":"resourceid",
                    "type":"int256"
                },
                {
                    "indexed":false,
                    "name":"value",
                    "type":"int256"
                }
			],
		"name":"ConfirmPurchase",
		"type":"event"
		}
	];


/**
 * @type {string}
 * web3.eth.Contract returns a contract object which can then further be used to invoke smart contract methods
 */
const contractAddress = '0xb4f391500fc66E6A1aC5D345F58bDcBea66C1A6f';
var mycontract = new web3.eth.Contract(contractABI, contractAddress);
const app = express();
app.use(bodyParser.json({type: '*/*'}));


/**
 * @type {Credentials}
 * setting up Credentials for Application
 * @appName takes name for the decentralized application to be delpoyed
 * @did is digital identity document used to store information on IPFS
 * it is not a good idea to show privatekey in code and should be stored
   in environment variable, but for this example this is ignored
 */
const credentials = new Credentials({
	    appName: 'Login Example',
	    did: 'did:ethr:0x71e87e2ef964aee97a36ba049e3852474e2ee91c',
        privateKey: 'cda34d99eac96a315c6d76f74336fab87fd568bc44305b3999866f22a9672a19'
});


/**
 * @selectiveDisclosureRequest
 * @createDisclosureRequest asks client to disclose the defined credentials
 * @notifications is used to ask permission from the client to allow for notifications
 * @callbackUrl defines a url to handle the response
 * @transports library is used to generate a QR code using the credentials and present it
   to the client
 * @requestToken is response sent from the client after scanning the qr code and is further decoded
 * @callback_type can either be post or redirect
 */
app.get('/login', (req,res)=> {
    credentials.createDisclosureRequest({
	    requested:["name"],
	    notifications: true,
	    callbackUrl: 'https://uportapp12.herokuapp.com/loggedin'
    }).then(requestToken =>{
		console.log('Decode JWT', decodeJWT(requestToken));
		const uri = message.paramsToQueryString(message.messageToURI(requestToken),
		{
			callback_type:'post'
		});
		const qr = transports.ui.getImageDataURI(uri);
		res.send(`<div><h1>In Rainbows</h1> </br></br> <img src="${qr}"/></div>`)
	})
});


/**
 * @selectiveDisclosureResponse
 * @authenticateDisclosureResponse checks the response from the client and authenticate the credentials
 */

app.post('/loggedin', (req,res)=>{
        const jwt = req.body.access_token;
    credentials.authenticateDisclosureResponse(jwt).then(credentials => {
        console.log("Logged in with", credentials);
        res.send("OK Computer")
    }).catch(err => {
        console.log("Access Denied because", err)
    })
});


/**
 * @createAndIssueVerifications
 * @createDisclosureRequest asks client to disclose the defined credentials
 * @callbackUrl defines a url to handle the response
 */
app.get('/verify', (req, res) => {
    credentials.createDisclosureRequest({
		requested: ["name"],
		notifications: true,
        callbackUrl: 'https://uportapp12.herokuapp.com/verification'
    }).then(requestToken => {
        console.log(decodeJWT(requestToken));
        const uri = message.paramsToQueryString(message.messageToURI(requestToken),
        {
            callback_type: 'post'
    	});
        const qr =  transports.ui.getImageDataURI(uri);
        res.send(`<div><img src="${qr}"/></div>`)
    })
});

/**
 * @saveVerification (Create Verification)
 * route to authenticate and attest user credentials
 * @credentials will be sent to user's uport app as push notification
 */

app.post('/verification', (req,res) => {
        const jwt = req.body.access_token;
    credentials.authenticateDisclosureResponse(jwt).then(creds => {
        const push = transports.push.send(creds.pushToken, creds.boxPub);
        console.log('Creds', creds);
    credentials.createVerification({
        sub: creds.did,
        exp: Math.floor(new Date().getTime()/1000) + 30 * 24 * 60 * 60,
        claim:{'Test Credential': {'Name':creds.name , 'Last Seen': `${new Date()}`, 'PubKey':creds.boxPub}}
    }).then(attestation => {
        console.log(`Encoded JWT sent to user: ${attestation}`);
        console.log(`Decoded JWT sent to user: ${JSON.stringify(decodeJWT(attestation))}`);
        return push(attestation)
    }).then(res => {
        console.log('Push notification sent and should be received any moment');
        console.log('Accept the push notification in the Uport mobile application')
        })
    })
});

/**
 * @RequestVerification
 * @createDisclosureRequest asks client to disclose the defined credentials
 * @verified checks whether the credentials are possessed by user or not
 * @callbackUrl defines a url to handle the response
 */
app.get('/requestverify', (req,res) => {
	credentials.createDisclosureRequest({
		verified: ['Test Credential'],
		callbackUrl: 'https://uportapp12.herokuapp.com/requestverification'
	}).then(requestToken => {
		const uri = message.paramsToQueryString(message.messageToURI(requestToken),
		{
			callback_type:'post'
		});
		const rq = transports.ui.getImageDataURI(uri);
		res.send(`<div><img src="${rq}"/></div`)
	})
});


/**
 * @verificationResponse
 * route defined to handle verification response after authentication of user credentials
 */
app.post('/requestverification', (req,res)=>{
	    const jwt = req.body.access_token;
	credentials.authenticateDisclosureResponse(jwt).then(creds => {
		console.log('Creds', creds);
		console.log('Creds', creds.verified[0])
	}).catch( err => {
		console.log(err)
	})
});


/**
 * @createTransaction
 */
app.get('/sendtransaction', (req,res) => {
	credentials.createDisclosureRequest({
		notifications: true,
		networkId: 1,
		rpcUrl: 'http://127.0.0.1:8545',
		callbackUrl: 'https://uportapp12.herokuapp.com/verifytransaction'
	}).then(requestToken => {
		console.log(requestToken);
		console.log(decodeJWT(requestToken));
		const uri = message.paramsToQueryString(message.messageToURI(requestToken),
		{
			callback_type: 'post'
		});
		const qr = transports.ui.getImageDataURI(uri);
		res.send(`<div><img src="${qr}"/></div>`)
	})
});


/**
 * @verifyTransaction
 */
app.post('/verifytransaction', (req, res) => {
	    console.log("Callback Hit");
	    const jwt = req.body.access_token;
	credentials.authenticateDisclosureResponse(jwt).then(creds => {
		const push =  transports.push.send(creds.pushToken, creds.boxPub);
		var nonce = web3.eth.getTransactionCount(devaccount);
		const txObject = {
		to: creds.mnid,
		nonce: nonce,
		from:devaccount,
		to: contractAddress,
		data: mycontract.methods.GrantPurchaseRights(121, testaccount).encodeABI(),
		gasLimit: web3.utils.toHex(web3.utils.toWei("0.0000000000001", 'ether')),
		gasPrice: web3.utils.toHex(web3.utils.toWei("0.000000010", 'ether'))
	};
	credentials.createTxRequest(txObject, {
	    callbackUrl: 'https://uportapp12.herokuapp.com/txcallback',
        callback_type: 'post'
	}).then(attestation => {
	    console.log(`Encoded JWT sent to user: ${attestation}`);
	    return push(attestation)
	}).then(res => {
	    console.log(res);
	    console.log('Push notification sent and should be received any moment...');
	    console.log('Accepting the push notification in the uPort mobile application')
		})
	})
});


/**
 *
 */
app.post('/txcallback', (req, res) => {
	    console.log("txcallback hit");
	    console.log(req.body)
});


/**
 * default Route to render html
 */
app.get('/', (req,res)=>{
	    res.sendFile(path.join(__dirname, 'index.html'))
});


/**
 * manual server launch
 */
const server = app.listen(process.env.PORT || 4000, function(){
		console.log('App is running', server.address())
});

