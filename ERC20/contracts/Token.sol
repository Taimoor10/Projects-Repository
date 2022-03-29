//SPDX-License-Identifier: Unlicense
pragma solidity >=0.4.22 <0.9.0;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    address public owner;
    mapping (address => uint256) public balances;
    mapping (address => mapping(address => uint256)) private _allowed;
    bool internal locked;

    modifier noReentrant()
    {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(uint256 _initialSupply) {
        name = "Binga";
        symbol = "BNG";
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply;
        owner = msg.sender;
    }

    function transfer(address _to, uint256 _amount) public noReentrant() {
        require(_to != address(0) && _amount >= 0, "Provided address or value is not valid");
        require(balanceOf(msg.sender) >= _amount, "Token limit exceeded");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        emit Transfer(msg.sender, _to, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _value) public noReentrant() {
        require(_from != address(0) && _to != address(0) && _value >= 0, "Provided address or value is not valid");
        require(balances[_from] >= _value, "Owner does not have enough funds");
        require(_from != _to, "sender and recipient cannot be the same");
        balances[_from] -= _value;
        balances[_to] += _value;
        _allowed[_from][_to] += _value;
        
        emit Transfer(_from, _to, _value);
    }

    function allowance(address _owner, address _spender) public view returns(uint256) {
        return _allowed[_owner][_spender];
    }

    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool) {
        require(_spender != address(0), "Spender is not a valid address");
        require(balances[msg.sender] >= _addedValue, "Owner does not have enough funds");
        _allowed[msg.sender][_spender] += _addedValue;

        emit Approval(msg.sender, _spender, _addedValue);
        return true;
    }

    function decreaseAllowance(address _spender, uint256 _decreasedValue) public returns (bool) {
        require(_spender != address(0), "Spender is not a valid address");
        _allowed[msg.sender][_spender] -= _decreasedValue;

        emit Approval(msg.sender, _spender, _decreasedValue);
        return true;
    }

    function approve(address _spender, uint256 _value) public noReentrant() returns (bool) {
        require(_spender != address(0), "Invalid Spender address");
        require(balances[msg.sender] >= _value, "Owner does not have enough funds");
        balances[msg.sender] -= _value;
        _allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function balanceOf(address account) public view returns(uint256 balance) {
        return(balances[account]);
    }
}