// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

contract Mintify is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    string private constant PINATA_GATEWAY =
        "https://crimson-bitter-horse-871.mypinata.cloud/ipfs/";

    address private _trustedSigner;

    uint256 private _currentTokenId;

    mapping(uint256 tokenId => address) public firstOwner;

    mapping(address user => uint256) public tokenUriUpdates;

    uint256 public costPerUpdate;

    error InvalidSigner();
    error AlreadyMinted();
    error UpdateUnavialable();
    error NotATokenOwner();
    error IncorrectValue();
    error WithdrawFailed();
    error ZeroAddressTrustedSigner();

    event MoneyWithdrawn(address indexed _owner, uint256);

    event TrustedSignerChanged(address indexed _initial, address indexed _new);
    event CostPerUpdateChanged(uint256 _initial, uint256 _new);
    event Minted(
        address indexed _to,
        uint256 indexed _tokenId,
        string _tokenURI
    );
    event URIUpdated(uint256 indexed tokenId, string _newTokenURI);

    modifier costs(uint256 _cost) {
        require(msg.value == _cost, IncorrectValue());
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _initialOwner,
        address trustedSigner_,
        uint256 _costPerUpdate
    ) public initializer {
        __ERC721_init("Mintify", "MFY");
        __ERC721URIStorage_init();
        __Ownable_init(_initialOwner);
        __UUPSUpgradeable_init();

        _currentTokenId = 1;
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
        firstOwner[_currentTokenId] = msg.sender;

        emit Minted(msg.sender, _currentTokenId++, _tokenURI);
    }

    function updateTokenURIWithSignature(
        uint256 _tokenId,
        string calldata _newTokenURI,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable costs(getPrice(msg.sender)) {
        require(msg.sender == ownerOf(_tokenId), NotATokenOwner());
        require(msg.sender == firstOwner[_tokenId], UpdateUnavialable());
        _checkIsSignedUpdate(_tokenId, _newTokenURI, v, r, s);

        _setTokenURI(_tokenId, _newTokenURI);
        tokenUriUpdates[msg.sender]++;

        emit URIUpdated(_tokenId, _newTokenURI);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
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

    function changeCostPerUpdate(uint256 _newCostPerUpdate) external onlyOwner {
        uint256 initialCostPerUpdate = costPerUpdate;
        costPerUpdate = _newCostPerUpdate;

        emit CostPerUpdateChanged(initialCostPerUpdate, _newCostPerUpdate);
    }

    function getPrice(address _user) public view returns (uint256) {
        return (tokenUriUpdates[_user] + 1) * costPerUpdate;
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {} // solhint-disable-line no-empty-blocks

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
        uint256 _tokenId,
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
