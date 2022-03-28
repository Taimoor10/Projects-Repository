//SPDX-License-Identifier: Unlicense
pragma solidity >=0.4.22 <0.9.0;

import "hardhat/console.sol";
import "contracts/Token.sol";

contract TokenSale {
    
    address private administrator;
    Token public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    bool internal locked;

    event Sell(address indexed _buyer, uint256 indexed _amount);

    modifier noReentrant()
    {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    constructor(Token tokenInstance, uint256 _tokenPrice) {
        administrator = msg.sender;
        tokenContract = tokenInstance;
        tokenPrice = _tokenPrice;
    }
 
    function buyTokens(address _address, uint256 _tokens) public payable noReentrant(){
        require(_tokens * tokenPrice == multiply(_tokens, tokenPrice), "Token multiplication error");
        require(_tokens >= 0, "Value is not correct");
        require(tokensSold <= tokenContract.totalSupply(), "Out of Tokens");
        tokensSold += _tokens;
        tokenContract.transferFrom(msg.sender, _address, _tokens);
        
        emit Sell(msg.sender, _tokens);
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
}