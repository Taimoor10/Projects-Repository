const {expect, assert} = require("chai");
const { ethers } = require("hardhat");

describe("Token", function() {
    let Token, token, owner, account1, account2
    
    beforeEach(async () => {
        Token = await ethers.getContractFactory('Token');

        token = await Token.deploy(1000000);
        await token.deployed();
        [owner, account1, account2] = await ethers.getSigners();
    })

    describe('Deployment', () => {
        it('Should set the right owner', async() => {
            expect(await token.owner()).to.equal(owner.address);
        });

        it('Should set the total supply on deployment', async() => {
            assert.equal(await token.totalSupply(), 1000000, 'sets the totalSupply to 1000000');
        })

        it('Should assign totalSupply to owner', async() => {
            const totalSupply = await token.totalSupply();
            expect(await token.balanceOf(owner.address)).to.equal(totalSupply)
        });

        it('Should transfer tokens between accounts', async() => {
            await token.transfer(account1.address, 100);
            const account1Balance = await token.balanceOf(account1.address);
            expect(account1Balance).to.equal(100);

            await token.connect(account1).transfer(account2.address, 100);
            const account2Balance = await token.balanceOf(account2.address);
            expect(account2Balance).to.equal(100);
        });

        it('Should transfer tokens between provided from account to a recipient account', async() => {
            const ownerBalance = await token.balanceOf(owner.address);
            await token.transferFrom(owner.address, account2.address, 100);
            expect(await token.balanceOf(owner.address)).to.equal(ownerBalance-100);
            expect(await token.balanceOf(account2.address)).to.equal(100);
        })

        it('Should fail if 0 addresses are provided', async() => {
            await expect(token.transfer('0x0000000000000000000000000000000000000000', 100)).
                                to.be.revertedWith('Provided address or value is not valid')
        })

        it('should fail if sender token limit exceeds', async() => {
            const ownerBalance = await token.balanceOf(owner.address);
            await expect(token.connect(account1).transfer(owner.address, 1))
                        .to.be.revertedWith('Token limit exceeded')
            expect(await token.balanceOf(owner.address)).to.equal(ownerBalance);
        })

        it('Should update balances after a transfer', async() => {
            const ownerBalance = await token.balanceOf(owner.address);
            await token.transfer(account1.address, 50);
            expect(await token.balanceOf(owner.address)).to.equal(ownerBalance - 50);
            expect(await token.balanceOf(account1.address)).to.equal(50);
        })

        it('Should have a right token name and symbol', async() => {
            expect(await token.name()).to.equal('Binga');
            expect(await token.symbol()).to.equal('BNG');
        })

        it('Should set the approval', async() => {
            await token.approve(account1.address, 50)
            expect(await token.allowance(owner.address, account1.address)).to.equal(50)
        })

        it('Should increase the allowance of an account', async() => {
            const allowance = await token.allowance(owner.address, account1.address);
            await token.increaseAllowance(account1.address, 50);
            expect(await token.allowance(owner.address, account1.address)).to.equal(allowance+50);
        })

        it('Should decrease the allowance of an account', async() => {
            const ownerBalance = await token.balanceOf(owner.address)
            await token.approve(account1.address, 50)
            await token.decreaseAllowance(account1.address, 50);
            expect(await token.balanceOf(owner.address)).to.equal(ownerBalance-50)
            expect(await token.allowance(owner.address, account1.address)).to.equal(0);
        })
    })
})
