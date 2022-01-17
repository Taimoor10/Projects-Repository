/*
This file provides a utility function for Administator to decrypt user's Account
This file only provides the implementation but is not utilised for Thesis
*/

const fs = require('fs')
const nacl = require('tweetnacl')
const web3 = require('../config/web3')
nacl.util = require('tweetnacl-util')
let utils = require('../config/utils')


/*
Decrypts a wallet file to retrieve Ethereum Account's information
The function uses web3.js library to decrypt Account's information
*/

async function decryptFile() {
    let nonce = fs.readFileSync("../Nonces/0x0e9c58d8C213895526032930e1AC004657a0A18a_WalletFile")
    nonce = Uint8Array.from(nonce)

    const devKey = fs.readFileSync('../Keys/devKey', 'utf8')
    let decryptedAccount = await utils.decryptAccount(devKey, "")

    let content = fs.readFileSync('../Keys/0x0e9c58d8C213895526032930e1AC004657a0A18a_WalletFile', 'ascii')
    
    let encrypt = nacl.util.decodeBase64(content)
    let decryptionKey = Buffer.from(web3.utils.hexToBytes(decryptedAccount.privateKey))
    let decrypted = nacl.secretbox.open(encrypt, nonce, decryptionKey)
    console.log(nacl.util.encodeUTF8(decrypted))
}

decryptFile()