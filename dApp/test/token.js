const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function() {
    let Token, token, owner, account1, account2
    
    beforeEach(async () => {
        Token = await ethers.getContractFactory('Token');
        token = await Token.deploy();
        await token.deployed();
        [owner, account1, account2] = await ethers.getSigners();
    })

    describe('Deployment', () => {
        it('Should set the right owner', async() => {
            expect(await token.owner()).to.equal(owner.address);
        });

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
    })
})
