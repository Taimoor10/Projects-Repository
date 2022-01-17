/*
This Smart Contract provides an Interface for claims management component
The ERC735 is a standardized contract origninally created by author Fabian Vogelsteller
The information can be found here at "https://erc725alliance.org/"

The structure of ERC735.sol was studied from a project provided by author Fabian Vogelsteller
Details:
author: "Fabian Vogelsteller (@frozeman)",
title: "ethereum/EIPs",
URL: "https://github.com/ethereum/EIPs/issues/735",
*/

pragma solidity >=0.4.21 <0.7.0;

abstract contract ERC735 {

    event ClaimRequested(uint256 indexed claimRequestId, uint256 indexed claimType, uint256 scheme, address indexed issuer, bytes signature, bytes data, string uri);    event ClaimAdded(bytes32 indexed claimId, uint256 indexed claimType, address indexed issuer, uint256 signatureType, bytes32 signature, bytes claim, string uri);
    event ClaimAdded(bytes32 indexed claimId, bytes32 claimName, uint256 indexed claimType, uint256 scheme, address indexed issuer, bytes signature, bytes data, string uri, string issuerName);
    event ClaimRemoved(bytes32 indexed claimId, bytes32 claimName, uint256 indexed claimType, uint256 scheme, address indexed issuer, bytes signature, bytes data, string uri);
    //event ClaimChanged(bytes32 indexed claimId, uint256 indexed claimType, uint256 scheme, address indexed issuer, bytes signature, bytes data, string uri);

    function getClaim(bytes32 _claimId) public virtual view returns(bytes32 claimName, uint256 claimType, uint256 scheme, address issuer, bytes memory signature, bytes memory data, string memory uri, string memory issuerName);
    function getClaimIdsByType(uint256 _claimType) public virtual view returns(bytes32[] memory claimIds);
    function addClaim(bytes32 _claimName, uint256 _claimType, uint256 _scheme, address issuer, bytes memory _signature, bytes memory _data, string memory _uri, string memory _issuerName) public virtual returns (bytes32 claimRequestId);
    function removeClaim(bytes32 _claimId) public virtual returns (bool success);
}