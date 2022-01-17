module.exports = function keyGenerator(web3, nacl, fs){

//Generates a Public and Private Key pair
this.generatePublicPrivateKeysPair = (email) => {
let keypair = nacl.box.keyPair(email)
let publicKey = Buffer.from(keypair.publicKey)
let privateKey = Buffer.from(keypair.secretKey)
return {publicKey, privateKey}
}

//Account creation with Web3 and nacl
this.generateKeys = () => {
let devKey = fs.readFileSync('devKey', 'utf8')
let decryptedAccount = web3.eth.accounts.decrypt(devKey, '')
let accountObject = nacl.box.keyPair.fromSecretKey(Uint8Array.from(web3.utils.hexToBytes(decryptedAccount.privateKey)))
decryptedAccountPublicKey = web3.utils.bytesToHex(accountObject.publicKey)
decryptedAccount.publicKey = decryptedAccountPublicKey
return decryptedAccount
}

//Get Public Key from PrivateKey
this.getPublicKey = (privKey) => {
let accountObject = nacl.box.keyPair.fromSecretKey(Uint8Array.from(web3.utils.hexToBytes(privKey)))
let publicKey = web3.utils.bytesToHex(accountObject.publicKey)
return publicKey
}

//Create Account with Web3
this.createAccount = () => {
return web3.eth.accounts.create(web3.utils.randomHex(32))
}

//Create Account from Privatekey
this.createAccountFromPrivateKey = (privKey) => {
return web3.eth.accounts.privateKeyToAccount(web3.utils.bytesToHex(privKey))
}

//Encryption
this.encryptMessage = (msg, publicKey, privateKey) => {
let message = msg
let nonce = Buffer.from(nacl.randomBytes(24))
const encryptedMessage = nacl.box(nacl.util.decodeUTF8(message), nonce, 
                                Uint8Array.from(web3.utils.hexToBytes(publicKey)), 
                                Uint8Array.from(web3.utils.hexToBytes(privateKey)))
console.log('Encrypted Message :', web3.utils.bytesToHex(encryptedMessage))
return {encryptedMessage, nonce}
}

//Decryption
this.decryptMessage = (box, nonce, publicKey, privateKey) => {
let decryptedMessage = nacl.box.open(box.encryptedMessage, nonce, 
                                      Uint8Array.from(web3.utils.hexToBytes(publicKey)), 
                                      Uint8Array.from(web3.utils.hexToBytes(privateKey)))
decryptedMessage = nacl.util.encodeUTF8(decryptedMessage)
console.log('Decrypted Message :', decryptedMessage)
return decryptedMessage
}}