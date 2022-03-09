//SPDX-License-Identifier: Unlicense
pragma solidity >=0.4.22 <0.9.0;

import "hardhat/console.sol";

contract Token {
    string public name = "Binga";
    string public symbol = "BNG";
    uint256 public totalSupply = 1000000;
    address public owner;
    mapping (address => uint256) public balances;

    constructor() {
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
        console.log("Total Supply set to: %s", totalSupply);
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Token limit exceeded");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        console.log("Balance of %s is %s", msg.sender, balances[msg.sender]);
        console.log("Balance of %s is %s", to, balances[to]);
    }

    function balanceOf(address account) public view returns(uint256 balance) {
        return(balances[account]);
    }
}