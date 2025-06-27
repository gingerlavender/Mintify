// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Mintify is Ownable, ERC721, ERC721URIStorage, Nonces {
    string private constant PINATA_GATEWAY =
        "https://crimson-bitter-horse-871.mypinata.cloud/";

    address private trustedSigner;

    uint private currentTokenId = 1;

    mapping(address user => uint) public tokenUriUpdates;
    uint public costPerUpdate;

    error InvalidSigner();
    error NotATokenOwner();
    error InsufficientFunds();
    error WithdrawFailed();
    error ZeroAddressTrustedSigner();

    event MoneyWithdrawn(address indexed _owner, uint _amount);
    event TrustedSignerChanged(address indexed _initial, address indexed _new);
    event CostPerUpdateChanged(uint _initial, uint _new);
    event Minted(address indexed _to, uint indexed _tokenId, string _tokenURI);
    event Updated(uint indexed tokenId, string _newTokenURI);

    modifier costs(uint _cost) {
        require(msg.value >= _cost, InsufficientFunds());
        _;
    }

    constructor(
        address _trustedSigner,
        uint _costPerUpdate
    ) Ownable(msg.sender) ERC721("Mintify", "MFY") {
        trustedSigner = _trustedSigner;
        costPerUpdate = _costPerUpdate;
    }

    function safeMintWithSignature(
        string calldata _tokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable costs(costPerUpdate) {
        _checkIsSignedMint(msg.sender, _tokenURI, v, r, s);

        _safeMint(msg.sender, currentTokenId);
        _setTokenURI(currentTokenId, _tokenURI);
        tokenUriUpdates[msg.sender]++;

        emit Minted(msg.sender, currentTokenId++, _tokenURI);
    }

    function updateTokenURIWithSignature(
        uint _tokenId,
        string calldata _newTokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable costs(getUpdatePrice(msg.sender)) {
        require(msg.sender == ownerOf(_tokenId), NotATokenOwner());
        _checkIsSignedUpdate(_tokenId, _newTokenURI, v, r, s);

        _setTokenURI(_tokenId, _newTokenURI);
        tokenUriUpdates[msg.sender]++;

        emit Updated(_tokenId, _newTokenURI);
    }

    function withdrawFunds() external onlyOwner {
        uint balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");

        require(success, WithdrawFailed());

        emit MoneyWithdrawn(owner(), balance);
    }

    function changeTrustedSigner(address _newTrustedSigner) external onlyOwner {
        require(_newTrustedSigner != address(0), ZeroAddressTrustedSigner());

        address initialTrustedSigner = trustedSigner;
        trustedSigner = _newTrustedSigner;

        emit TrustedSignerChanged(initialTrustedSigner, _newTrustedSigner);
    }

    function changeCostPerUpdate(uint _newCostPerUpdate) external onlyOwner {
        uint initialCostPerUpdate = costPerUpdate;
        costPerUpdate = _newCostPerUpdate;

        emit CostPerUpdateChanged(initialCostPerUpdate, _newCostPerUpdate);
    }

    function getUpdatePrice(address _user) public view returns (uint) {
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

    function _baseURI() internal pure override returns (string memory) {
        return PINATA_GATEWAY;
    }

    function _checkIsSignedMint(
        address _to,
        string calldata _tokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_to, _tokenURI, _useNonce(_to), block.chainid)
        );

        _checkIsValidSignature(messageHash, v, r, s);
    }

    function _checkIsSignedUpdate(
        uint _tokenId,
        string calldata _tokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _tokenId,
                _tokenURI,
                _useNonce(msg.sender),
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

        require(recovered == trustedSigner, InvalidSigner());
    }
}
