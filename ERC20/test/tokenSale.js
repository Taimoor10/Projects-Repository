const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSale", function() {
    let tokenContract, tokenInstance, tokenSale, admin, account1, account2

    beforeEach(async () => {
        [admin, account1, account2] = await ethers.getSigners();
        tokenSale = await ethers.getContractFactory('TokenSale');
        tokenContract = await ethers.getContractFactory('Token');
        
        tokenInstance =  await tokenContract.deploy(1000000);
        await tokenInstance.deployed();

        tokenSaleInstance = await tokenSale.deploy(tokenInstance.address, 100);
        await tokenSaleInstance.deployed();
    })

    describe('Deployment', () => {

        it('Should set up a tokenSale contract', async() => {
            expect(await tokenSaleInstance.address).to.be.not.equal(0x0);
        })

        it('Should set up an instance for Token contract', async() =>{
            expect(await tokenSaleInstance.tokenContract()).to.be.not.equal(0x0);
            expect(await tokenSaleInstance.tokenContract()).to.equal(tokenInstance.address);
        })

        it('Should set the token Price', async() => {
            expect(await tokenSaleInstance.tokenPrice()).to.equal(100)
        })

        it('Should execute buy tokens', async() => {
            const adminBalance = await tokenInstance.balanceOf(admin.address)
            await tokenSaleInstance.buyTokens(account1.address, 100)
            expect(await tokenInstance.balanceOf(admin.address)).to.equal(adminBalance-100)
        })

        it('Sender and Recipient addresses cannot be the same', async() => {
            await expect(tokenSaleInstance.buyTokens(admin.address, 100)).to.be.revertedWith('sender and recipient cannot be the same');
        })

        it('Should fail in there are not enough tokens available', async() => {
            await expect(tokenSaleInstance.buyTokens(account1.address, 8000000)).to.be.revertedWith("Owner does not have enough funds")
        })
    })
})