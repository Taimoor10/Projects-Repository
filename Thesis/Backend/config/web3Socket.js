/*
This file provides a web3 socket object to catch events
*/

const Web3Socket = require('web3')
const web3Socket = new Web3Socket('ws://localhost:8546')

module.exports = web3Socket