const user = require('./routes/UserManagement')
const identity = require('./routes/Identity')
const express = require('express')
const fs = require('fs')
const events = require('./eventListener')
const web3 = require('./config/web3')
const cors = require('cors')

app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(cors())


app.set('views', './public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/user', user)
app.use('/identity', identity)

const contractABI = require('./build/contracts/Identity.json')
const contractAddress = require('./contractAddresses/IdentityAddress.json').address
let contractObject = new web3.eth.Contract(contractABI.abi, contractAddress)
let eventsArray = ["ClaimAdded", "PreReqAdded", "ClaimIssued", "ClaimRemoved"]
events.subscribeEvent(contractObject, eventsArray)

//Server
var server = app.listen(process.env.PORT || 3000, '0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;  
  console.log('Server listening at http://%s:%s', host, port);
});

