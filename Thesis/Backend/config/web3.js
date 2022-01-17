/*
This file provides a web3 object to communicate with Ethereum blockchain
*/

const Web3 = require('web3')
const web3  = new Web3()
web3.setProvider('http://localhost:8545')

module.exports = web3