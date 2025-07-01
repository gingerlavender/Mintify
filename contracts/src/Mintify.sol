// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Mintify is Ownable, ERC721, ERC721URIStorage {
    string private constant PINATA_GATEWAY =
        "https://crimson-bitter-horse-871.mypinata.cloud/";

    address private _trustedSigner;

    uint private _currentTokenId = 1;

    mapping(uint tokenId => bool) private _wasTransferred;

    mapping(address user => uint) public tokenUriUpdates;

    uint public costPerUpdate;

    error InvalidSigner();
    error AlreadyMinted();
    error UpdateUnavialable();
    error NotATokenOwner();
    error InsufficientFunds();
    error WithdrawFailed();
    error ZeroAddressTrustedSigner();

    event MoneyWithdrawn(address indexed _owner, uint _amount);
    event TrustedSignerChanged(address indexed _initial, address indexed _new);
    event CostPerUpdateChanged(uint _initial, uint _new);
    event Minted(address indexed _to, uint indexed _tokenId, string _tokenURI);
    event URIUpdated(uint indexed tokenId, string _newTokenURI);

    modifier costs(uint _cost) {
        require(msg.value >= _cost, InsufficientFunds());
        _;
    }

    constructor(
        address trustedSigner_,
        uint _costPerUpdate
    ) Ownable(msg.sender) ERC721("Mintify", "MFY") {
        _trustedSigner = trustedSigner_;
        costPerUpdate = _costPerUpdate;
    }

    function safeMintWithSignature(
        string calldata _tokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable costs(costPerUpdate) {
        require(tokenUriUpdates[msg.sender] == 0, AlreadyMinted());
        _checkIsSignedMint(msg.sender, _tokenURI, v, r, s);

        _safeMint(msg.sender, _currentTokenId);
        _setTokenURI(_currentTokenId, _tokenURI);
        tokenUriUpdates[msg.sender]++;

        emit Minted(msg.sender, _currentTokenId++, _tokenURI);
    }

    function updateTokenURIWithSignature(
        uint _tokenId,
        string calldata _newTokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable costs(getPrice(msg.sender)) {
        require(msg.sender == ownerOf(_tokenId), NotATokenOwner());
        require(!_wasTransferred[_tokenId], UpdateUnavialable());
        _checkIsSignedUpdate(_tokenId, _newTokenURI, v, r, s);

        _setTokenURI(_tokenId, _newTokenURI);
        tokenUriUpdates[msg.sender]++;

        emit URIUpdated(_tokenId, _newTokenURI);
    }

    function withdrawFunds() external onlyOwner {
        uint balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");

        require(success, WithdrawFailed());

        emit MoneyWithdrawn(owner(), balance);
    }

    function changeTrustedSigner(address _newTrustedSigner) external onlyOwner {
        require(_newTrustedSigner != address(0), ZeroAddressTrustedSigner());

        address initialTrustedSigner = _trustedSigner;
        _trustedSigner = _newTrustedSigner;

        emit TrustedSignerChanged(initialTrustedSigner, _newTrustedSigner);
    }

    function changeCostPerUpdate(uint _newCostPerUpdate) external onlyOwner {
        uint initialCostPerUpdate = costPerUpdate;
        costPerUpdate = _newCostPerUpdate;

        emit CostPerUpdateChanged(initialCostPerUpdate, _newCostPerUpdate);
    }

    function getPrice(address _user) public view returns (uint) {
        return (tokenUriUpdates[_user] + 1) * costPerUpdate;
    }

    function tokenURI(
        uint tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address _to,
        uint _tokenId,
        address _auth
    ) internal override returns (address) {
        address from = super._update(_to, _tokenId, _auth);
        if (_to != address(0) && from != address(0)) {
            _wasTransferred[_tokenId] = true;
        }

        return from;
    }

    function _baseURI() internal pure override returns (string memory) {
        return PINATA_GATEWAY;
    }

    function _checkIsSignedMint(
        address _to,
        string calldata _tokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private view {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _to,
                _tokenURI,
                tokenUriUpdates[_to],
                block.chainid
            )
        );

        _checkIsValidSignature(messageHash, v, r, s);
    }

    function _checkIsSignedUpdate(
        uint _tokenId,
        string calldata _tokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private view {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _tokenId,
                _tokenURI,
                tokenUriUpdates[msg.sender],
                block.chainid
            )
        );

        _checkIsValidSignature(messageHash, v, r, s);
    }

    function _checkIsValidSignature(
        bytes32 _msgHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private view {
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            _msgHash
        );
        address recovered = ECDSA.recover(ethSignedMessageHash, v, r, s);

        require(recovered == _trustedSigner, InvalidSigner());
    }
}
