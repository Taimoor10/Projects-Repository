/*
This Smart Contract provides an Interface for keys management component
The ERC725 is a standardized contract origninally created by author Fabian Vogelsteller
The information can be found here at "https://erc725alliance.org/"

The structure of ERC725.sol was studied from a project provided by author Fabian Vogelsteller
Details:
author: "Fabian Vogelsteller (@frozeman)",
title: "ethereum/EIPs",
URL: "https://github.com/ethereum/EIPs/blob/ede8c26a77eb1ac8fa2d01d8743a8cf259d8d45b/EIPS/eip-725.md"
*/

pragma solidity >=0.4.21 <0.7.0;

abstract contract ERC725 {

    //Administrator is assigned key number 1
    //Claim Issuer is assigned key number 3

    event KeyAdded(address indexed key, uint256 indexed purpose, uint256 indexed keyType);
    event KeyRemoved(address indexed key, uint256 indexed purpose, uint256 indexed keyType);
    event ExecutionRequested(uint256 indexed executionId, address indexed to, uint256 indexed value, bytes data);
    event Executed(uint256 indexed executionId, address indexed to, uint256 indexed value, bytes data);
    event Approved(uint256 indexed executionId, bool approved);

    function getKey(address _key) public virtual view returns(uint256 purpose, address addr);
    function getKeyPurpose(address _key) public virtual view returns(uint256 purpose);
    function getKeysByPurpose(uint256 _purpose) public virtual view returns(address[] memory keysPurpose);
    function addKey(address _key, uint256 _purpose) public virtual returns (bool success);
}