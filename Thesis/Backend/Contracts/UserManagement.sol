/*
This Smart Contract provides an interface for user management component
This Smart Contract also implments functionality itself to keep the logic separate
*/

pragma solidity >=0.4.22 < 0.7.0;

interface UserManagement{

    function signUp(bytes32 _username, uint256 _publicKey, address _userAddress, bool _status) external payable;
    function isUser(bytes32 _username) external view returns(bool);
    function getPublicKey(bytes32 _username) external view returns(uint256);
    function changeStatus(bytes32 _username, bool _status) external payable;
}

contract User is UserManagement {

    address _administrator;

    constructor() public {
        _administrator = msg.sender;
    }

    struct UserInformation{
        address UserAddress;
        uint256 publicKey;
        bytes32 username;
        bytes32 identifier;
        bool status;
    }

    event userManipulated(bytes32 indexed email, address indexed userAddres, uint256 publicKey,bool indexed status);
    event userNotRegistered(string message);

    mapping(bytes32 => UserInformation)clients;

    function signUp(bytes32 _username, uint256 _publicKey, address _userAddress, bool _status) public payable override
    {
        bytes32 id = keccak256(abi.encodePacked(_username, _userAddress));
        require(clients[_username].identifier != id && clients[_username].username != _username, "User is already registered with the provided username");

        clients[_username].UserAddress = _userAddress;
        clients[_username].publicKey = _publicKey;
        clients[_username].username = _username;
        clients[_username].identifier = id;
        clients[_username].status = _status;

        emit userManipulated(_username, _userAddress, _publicKey, _status);
    }

    function getUser(bytes32 _username)public view returns(address _address, uint256 _pubKey, bytes32 _id, bool _status)
    {
        return(clients[_username].UserAddress, clients[_username].publicKey, clients[_username].identifier, clients[_username].status);
    }

    function isUser(bytes32 _username) public override view returns(bool result){
        return clients[_username].status;
    }

    function getPublicKey(bytes32 _username) public override view returns(uint256)
    {
        require(isUser(_username) == true, "User is not registered");
        return clients[_username].publicKey;
    }

    function changeStatus(bytes32 _username, bool _status) public payable override
    {
        require(msg.sender == _administrator, 'UnAuhtorized');
        clients[_username].status = _status;
    }
}