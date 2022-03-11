/*
This Smart Contract imports ERC725.sol, ERC735.sol and UserManagement.sol contracts for implementation
*/

pragma solidity >=0.4.21 < 0.7.0;

import "./ERC725.sol";
import "./ERC735.sol";
import "./UserManagement.sol";

contract Identity is ERC725, ERC735, User
{
    mapping(address => Key)keys;
    mapping(uint256 => address[])keysByPurpose;

    mapping(bytes32 => Claim)claims;
    mapping(uint256 => bytes32[])claimsByType;
    mapping(bytes32 => uint256)claimPosition;
    mapping(bytes32 => bytes32[])claimPreRequisites;
    mapping(bytes32 => bool)preRequisiteAdded;
    mapping(bytes32 => bool)claimHasPreRequisites;
    mapping(bytes32 => bytes32)claimIdByName;

    mapping(address => Issuers)claimIssuers;
    mapping(bytes32 => mapping(address => bool))issuedClaims;
    mapping(bytes32 => address[])claimers;

    event KeyAdded(address indexed key, uint256 indexed purpose);
    event KeyRemoved(address indexed key, uint256 indexed purpose);

    event ClaimAdded(bytes32 indexed claimId, bytes32 claimName, uint256 indexed claimType, uint256 scheme,
                    address indexed issuer, bytes signature, bytes data, string uri, string issuerName);

    event PreReqAdded(bytes32 indexed claimId, bytes32 preReqId);

    event ClaimRemoved(bytes32 indexed claimId, bytes32 claimName, uint256 indexed claimType, uint256 scheme,
                    address indexed issuer, bytes signature, bytes data, string uri, string issuerName);

    event ClaimIssuerAdded(address indexed claimer);

    event ClaimIssued(bytes32 indexed claimId, address claimer, bytes32 claimName, uint256 indexed claimType, uint256 scheme,
                    address indexed issuer, bytes signature, bytes data, string uri, string issuerName);

    event ClaimRequested(bytes32 indexed claimId, bytes32 claimName, uint256 indexed claimType, uint256 scheme,
                    address indexed issuer, bytes signature, bytes data, string uri, string issuerName);

    event RecoveredAddress(address recoveredAddress);

    event KeyHolderLength(bool length);


    struct Key {
        uint256 purpose; // Administrator Key = 1, Claim Issuer Key = 3
        address key;
    }

    struct Claim {
        bytes32 claimName;
        uint256 claimType;
        uint256 scheme;
        address issuer;  // msg.sender(Claim Issuer)
        bytes signature; // this.address + claimType + data
        bytes data;
        string uri;
        string issuerName;
    }

    struct Issuers {
        uint256 status;
        string name;
    }

    address public administrator;
    constructor() public
    {
        administrator = msg.sender;
        addKey(msg.sender, 1);

        bytes32 Id = keccak256(abi.encodePacked("Test", msg.sender, "0"));
        claims[Id] = Claim({
            claimName : keccak256(abi.encodePacked("Test Claim")),
            claimType : 0,
            scheme : 0,
            issuer : msg.sender,
            signature : "",
            data : "",
            uri : "Unusable claim",
            issuerName : "Administrator"
        });

        claimPosition[keccak256(abi.encodePacked(msg.sender,"0"))] = claimsByType[0].length;
        claimsByType[0].push(Id);
        claimers[Id].push(administrator);
    }

    //Modifiers
    modifier onlyAdmin
    {
        require(msg.sender == administrator, "Sender is not admin");
        _;
    }

    modifier claimSignerOnly
    {
        require(keys[msg.sender].purpose == 3, "Sender is not a claim signer");
        _;
    }

    //Keys
    function addKey(address _address, uint256 _purpose) public onlyAdmin override returns(bool success)
    {
        require(keys[_address].purpose == 0,"Key Already Exists");
        require(_purpose != 0, "Key Purpose 0 is not allowed");

        keys[_address].key = _address;
        keys[_address].purpose = _purpose;

        claimPosition[keccak256(abi.encodePacked(_address, _purpose))] = keysByPurpose[_purpose].length;
        keysByPurpose[_purpose].push(_address);

        emit KeyAdded(_address, _purpose);

        if(_purpose == 3 && claimIssuers[_address].status == 0)
        {
            claimIssuers[_address].status = 1;
        }
        return true;
    }

    function getKey(address _key)public view override returns(uint256 purpose, address addr)
    {
        return(keys[_key].purpose,keys[_key].key);
    }

    function getKeysByPurpose(uint256 _purpose) public view override returns(address[] memory keysPurpose)
    {
        return(keysByPurpose[_purpose]);
    }

    function getKeyPurpose(address _key) public view override returns(uint256 _purpose)
    {
        return(keys[_key].purpose);
    }

    function removeKey(address _key) public onlyAdmin returns(bool success)
    {
        require(keys[_key].key == _key, "Key does not exist");

        uint256 keyPurpose = keys[_key].purpose;

        address[] storage keyPurposeArray = keysByPurpose[keyPurpose];

        bytes32 previousKeyIndex = keccak256(abi.encodePacked(_key,keyPurpose));
        uint256 newIndex = claimPosition[previousKeyIndex];
        delete  claimPosition[previousKeyIndex];

        address keyTypeReplacer = keyPurposeArray[keyPurposeArray.length-1];
        keyPurposeArray[newIndex] = keyTypeReplacer;
        claimPosition[keccak256(abi.encodePacked(keyTypeReplacer, keys[keyTypeReplacer].key))] = newIndex;
        keyPurposeArray.pop();

        delete keys[_key];
        //delete keysByPurpose[keys[_key].purpose];
        delete claimIssuers[_key];

        emit KeyRemoved(keys[_key].key, keys[_key].purpose);
        return true;
    }

    //Issuers
    function addIssuer(address _issuer)public onlyAdmin returns(address issuer)
    {
        require(claimIssuers[_issuer].status == 0, "Claim Holder Already exists");
        //claimIssuers[_issuer].status = 1;
        addKey(_issuer, 3);
        emit ClaimIssuerAdded(_issuer);
        return _issuer;
    }

    function removeIssuer(address _issuer)public onlyAdmin returns(address issuer)
    {
        require(claimIssuers[_issuer].status != 0, "Claim Issuer Doesnt exist");
        //claimIssuers[_issuer].status = 1;
        claimIssuers[_issuer].status = 0;
        keys[_issuer].purpose = 0;
        return _issuer;
    }

    function isIssuer(address _issuer)public view returns(bool result)
    {
        if(claimIssuers[_issuer].status == 0)
        {
            return false;
        }
        else if(claimIssuers[_issuer].status == 1)
        {
            return true;
        }
    }

    //Claims
    function addClaim(bytes32 _claimName, uint256 _claimType, uint256 _scheme, address _issuer, bytes memory _signature,
                        bytes memory _data, string memory _uri, string memory _issuerName)public override claimSignerOnly returns(bytes32 _claimId)
    {
        bytes32 claimId = keccak256(abi.encodePacked(_claimName, _issuer, _claimType));

        require(claims[claimId].claimName != _claimName && claims[claimId].claimType != _claimType &&
                claims[claimId].issuer != _issuer, "Claim duplication not allowed");

        claims[claimId] = Claim({
            claimName : _claimName,
            claimType : _claimType,
            scheme : _scheme,
            issuer : _issuer,
            signature : _signature,
            data : _data,
            uri : _uri,
            issuerName : _issuerName
        });

        claimPosition[keccak256(abi.encodePacked(_issuer,_claimType))] = claimsByType[_claimType].length;
        claimsByType[_claimType].push(claimId);
        claimIdByName[_claimName] = claimId;
        emit ClaimAdded(claimId, _claimName, _claimType, _scheme, _issuer, _signature, _data, _uri, _issuerName);
        return(claimId);
    }

    //Getting Claim Id By Name
    function getClaimIdByName(bytes32 _claimName) public view returns(bytes32 claimId)
    {
        return claimIdByName[_claimName];
    }

    //Adding Pre Requisite Claims
    function addPreRequistesClaim(bytes32 _claimId, bytes32 _preReqId) public claimSignerOnly returns(bytes32[] memory preReqIds)
    {
        require(claims[_claimId].claimType != 0 && claims[_preReqId].claimType != 0, "Claim does not exist");
        
        claimPreRequisites[_claimId].push(_preReqId);
        claimHasPreRequisites[_claimId] = true;
        preRequisiteAdded[_preReqId] = true;
        emit PreReqAdded(_claimId, _preReqId);
        return(claimPreRequisites[_claimId]);
    }

    //Getting Pre-Req Ids
    function getPreRequisiteIds(bytes32 _claimId) public view returns(bytes32[] memory preReqIds)
    {
        return(claimPreRequisites[_claimId]);
    }

    function getClaim(bytes32 claimId) public override view returns(bytes32 claimName, uint256 claimType, uint256 scheme, address issuer,
                 bytes memory signature, bytes memory data, string memory uri, string memory issuerName)
    {
        Claim memory _claim = claims[claimId];
        return(_claim.claimName, _claim.claimType, _claim.scheme, _claim.issuer, _claim.signature, _claim.data, _claim.uri, _claim.issuerName);
    }

    function getClaimIdsByType(uint256 _claimType) public override view returns(bytes32[] memory claimIds)
    {
        return claimsByType[_claimType];
    }

    function removeClaim(bytes32 _claimId) public claimSignerOnly override returns(bool success)
    {
        Claim memory _claim = claims[_claimId];


        uint256 claimIdTypePosition = claimPosition[_claimId];
        delete claimPosition[_claimId];
        bytes32[] storage claimTypeArray = claimsByType[_claim.claimType];
        bytes32 replacer = claimTypeArray[claimTypeArray.length-1];
        claimTypeArray[claimIdTypePosition] = replacer;
        claimPosition[replacer] = claimIdTypePosition;
        delete claims[_claimId];
        delete claimPreRequisites[_claimId];
        claimTypeArray.pop();
        
        emit ClaimRemoved(_claimId, _claim.claimName, _claim.claimType, _claim.scheme, _claim.issuer, _claim.signature, _claim.data, _claim.uri, _claim.issuerName);

        return true;
    }

    //Issuing Claims with Pre-Req Checks and Claims
    function issueClaim(bytes32 _claimId, bytes32 _username, address _claimer) public claimSignerOnly returns(bool success)
    {
        require(isUser(_username) == true && clients[_username].UserAddress==_claimer, "User is not registered");
        
        if(claimHasPreRequisites[_claimId]==true)
        {
            bytes32[] memory preReqIds = getPreRequisiteIds(_claimId);
            for(uint8 i = 0; i<preReqIds.length; i++)
            {
                require(issuedClaims[preReqIds[i]][_claimer] == true, "Pre-Requiste is not issued, denied");
            }
        }
        issuedClaims[_claimId][_claimer] = true;
        claimers[_claimId].push(_claimer);

        Claim memory _claim = claims[_claimId];
        emit ClaimIssued(_claimId, _claimer, _claim.claimName, _claim.claimType, _claim.scheme, _claim.issuer,
                        _claim.signature, _claim.data, _claim.uri, _claim.issuerName);
        return true;
    }

    //Check Pre Req Claims
    function claimHasPreReq(bytes32 _claimId) public view returns(bool result)
    {
        return(claimHasPreRequisites[_claimId]);
    }

    function getClaimHolders(bytes32 _claimId) public view claimSignerOnly returns(address[] memory addresses)
    {
        return claimers[_claimId];
    }

    //Verify Claim
    function claimIsValid(bytes32 _claimId, address _claimer) public returns(bool result)
    {
        //check if claim is issued
        require(issuedClaims[_claimId][_claimer]==true, "Claim is not issued");

        bytes32 claimName;
        uint256 claimType;
        uint256 scheme;
        address issuer;
        bytes memory signature;
        bytes memory data;
        string memory uri;
        string memory issuerName;

        //Fetch claim from claims array
        (claimName, claimType,scheme,issuer,signature,data,uri,issuerName) = getClaim(_claimId);

        emit ClaimRequested(_claimId, claimName, claimType, scheme, issuer, signature, data, uri, issuerName);

        bytes32 dataHash = keccak256(abi.encodePacked(issuer, claimType, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        //Retreive address of data signer
        address recovered = getRecoveredAddress(signature, prefixedHash);
        emit RecoveredAddress(recovered);

        if(keys[recovered].purpose == 3)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    function getRecoveredAddress(bytes memory sig, bytes32 dataHash) internal pure returns(address issuer)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;

        // Check the signature length
        if (sig.length != 65) {
            revert("Invalid signature length");
        }

        // Divide the signature in r, s and v variables
        assembly{
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }
        address recoveredAddress = ecrecover(dataHash, v, r, s);
        return (recoveredAddress);
    }
}
