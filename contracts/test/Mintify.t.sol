//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {Mintify} from "src/Mintify.sol";

contract Dummy {}

contract MintifyTest is Test {
    bytes32 DEPLOYMENT_SALT = keccak256(abi.encodePacked("Salt_N_No_Pepa"));

    uint constant CHAIN_ID = 31337;
    string constant BASE_URI =
        "https://crimson-bitter-horse-871.mypinata.cloud/";

    Mintify mintify;
    address trustedSigner;
    uint256 trustedSignerPrivKey;
    address initialOwner = address(this);
    uint costPerUpdate = 0.01 ether;

    string[] sampleTokenURIs = [
        "someTokenURI",
        "anotherTokenURI",
        "oneMoreTokenURI"
    ];
    address[2] receivers = [
        makeAddr("firstReceiver"),
        makeAddr("secondReceiver")
    ];

    event MoneyWithdrawn(address indexed _owner, uint _amount);
    event TrustedSignerChanged(address indexed _initial, address indexed _new);
    event CostPerUpdateChanged(uint _initial, uint _new);
    event Minted(address indexed _to, uint indexed _tokenId, string _tokenURI);
    event URIUpdated(uint indexed tokenId, string _newTokenURI);

    receive() external payable {}

    function setUp() external {
        (trustedSigner, trustedSignerPrivKey) = makeAddrAndKey("trustedSigner");

        address implementation = address(new Mintify{salt: DEPLOYMENT_SALT}());

        bytes memory initData = abi.encodeCall(
            Mintify.initialize,
            (initialOwner, trustedSigner, costPerUpdate)
        );

        ERC1967Proxy proxy = new ERC1967Proxy{salt: DEPLOYMENT_SALT}(
            implementation,
            initData
        );

        mintify = Mintify(address(proxy));
    }

    function test_safeMint_AllowsToMint() external {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        hoax(receiver);

        vm.expectEmit(true, true, true, true);
        emit Minted(receiver, 1, tokenURI);

        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        assertEq(mintify.balanceOf(receiver), 1);
        assertEq(
            mintify.tokenURI(1),
            string(abi.encodePacked(BASE_URI, tokenURI))
        );
        assertEq(mintify.tokenUriUpdates(receiver), 1);
    }

    function test_safeMint_RevertsIf_InfsufficientFunds() external {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        hoax(receiver);
        vm.expectRevert(Mintify.IncorrectValue.selector);
        mintify.safeMintWithSignature{value: price - 1}(tokenURI, v, r, s);
    }

    function test_safeMint_RevertsIf_TryingToMintTwice() external {
        address receiver = receivers[0];

        string memory uriForFirstMint = sampleTokenURIs[0];
        string memory uriForSecondMint = sampleTokenURIs[1];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            uriForFirstMint,
            0
        );

        uint price = mintify.getPrice(receiver);

        startHoax(receiver);

        mintify.safeMintWithSignature{value: price}(uriForFirstMint, v, r, s);

        (v, r, s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            uriForSecondMint,
            1
        );

        vm.expectRevert(Mintify.AlreadyMinted.selector);
        mintify.safeMintWithSignature{value: costPerUpdate}(
            uriForSecondMint,
            v,
            r,
            s
        );
    }

    function test_safeMint_RevertsIf_TryingToReplay() external {
        address receiver = receivers[0];

        string memory uriForFirstMint = sampleTokenURIs[0];
        string memory uriForSecondMint = sampleTokenURIs[1];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            uriForFirstMint,
            0
        );

        uint price = mintify.getPrice(receiver);

        startHoax(receiver);

        price = mintify.getPrice(receiver);

        vm.expectRevert(Mintify.InvalidSigner.selector);
        mintify.safeMintWithSignature{value: price}(uriForSecondMint, v, r, s);
    }

    function test_updateTokenURIWithSignature_AllowsToUpdate() external {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];
        string memory updatedTokenURI = sampleTokenURIs[1];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        startHoax(receiver);

        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        (v, r, s) = _createSignatureForURIUpdate(
            trustedSignerPrivKey,
            1,
            updatedTokenURI,
            1
        );

        price = mintify.getPrice(receiver);

        vm.expectEmit(true, true, true, true);
        emit URIUpdated(1, updatedTokenURI);

        mintify.updateTokenURIWithSignature{value: price}(
            1,
            updatedTokenURI,
            v,
            r,
            s
        );

        assertEq(
            mintify.tokenURI(1),
            string(abi.encodePacked(BASE_URI, updatedTokenURI))
        );
        assertEq(mintify.tokenUriUpdates(receiver), 2);
    }

    function test_updateTokenURIWithSignature_RevertsIf_TryingToReplay()
        external
    {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];
        string memory updatedTokenURI = sampleTokenURIs[1];
        string memory replayAttemptTokenURI = sampleTokenURIs[2];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        startHoax(receiver);

        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        (v, r, s) = _createSignatureForURIUpdate(
            trustedSignerPrivKey,
            1,
            updatedTokenURI,
            1
        );

        price = mintify.getPrice(receiver);
        mintify.updateTokenURIWithSignature{value: price}(
            1,
            updatedTokenURI,
            v,
            r,
            s
        );

        price = mintify.getPrice(receiver);

        vm.expectRevert(Mintify.InvalidSigner.selector);
        mintify.updateTokenURIWithSignature{value: price}(
            1,
            replayAttemptTokenURI,
            v,
            r,
            s
        );
    }

    function test_updateTokenURIWithSignature_RevertsIf_TryingToUpdateAfterTransfer()
        external
    {
        address originalMinter = receivers[0];
        address newOwner = receivers[1];

        string memory tokenURI = sampleTokenURIs[0];
        string memory updatedTokenURI = sampleTokenURIs[1];
        string memory posttransferUpdateTokenURI = sampleTokenURIs[2];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            originalMinter,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(originalMinter);

        startHoax(originalMinter);

        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        (v, r, s) = _createSignatureForURIUpdate(
            trustedSignerPrivKey,
            1,
            updatedTokenURI,
            1
        );

        price = mintify.getPrice(originalMinter);
        mintify.updateTokenURIWithSignature{value: price}(
            1,
            updatedTokenURI,
            v,
            r,
            s
        );

        mintify.safeTransferFrom(originalMinter, newOwner, 1);

        (v, r, s) = _createSignatureForURIUpdate(
            trustedSignerPrivKey,
            1,
            posttransferUpdateTokenURI,
            2
        );

        // original minter scannot update
        (v, r, s) = _createSignatureForURIUpdate(
            trustedSignerPrivKey,
            1,
            posttransferUpdateTokenURI,
            2
        );

        price = mintify.getPrice(originalMinter);

        vm.expectRevert(Mintify.NotATokenOwner.selector);
        mintify.updateTokenURIWithSignature{value: price}(
            1,
            updatedTokenURI,
            v,
            r,
            s
        );

        // new owner cannot update
        (v, r, s) = _createSignatureForURIUpdate(
            trustedSignerPrivKey,
            1,
            posttransferUpdateTokenURI,
            0
        );

        price = mintify.getPrice(newOwner);

        startHoax(newOwner);

        vm.expectRevert(Mintify.UpdateUnavialable.selector);
        mintify.updateTokenURIWithSignature{value: price}(
            1,
            updatedTokenURI,
            v,
            r,
            s
        );
    }

    function test_withdrawFunds_AllowsToWithdraw() external {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        hoax(receiver);
        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        uint balanceBeforeWithdraw = address(this).balance;

        vm.expectEmit(true, true, true, true);
        emit MoneyWithdrawn(address(this), price);

        mintify.withdrawFunds();

        uint balanceAfterWithdraw = address(this).balance;

        assertEq(balanceAfterWithdraw, balanceBeforeWithdraw + price);
    }

    function test_withdrawFunds_RevertsIf_NotAnOwnerTryingToWithdraw()
        external
    {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        startHoax(receiver);
        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        vm.expectRevert(
            abi.encodeWithSelector(
                OwnableUpgradeable.OwnableUnauthorizedAccount.selector,
                receiver
            )
        );
        mintify.withdrawFunds();
    }

    function test_withdrawFunds_RevertsIf_OwnerIsContractWithNoReceive()
        external
    {
        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            trustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        Dummy dummy = new Dummy();
        mintify.transferOwnership(address(dummy));

        hoax(receiver);
        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);

        vm.prank(address(dummy));
        vm.expectRevert(Mintify.WithdrawFailed.selector);
        mintify.withdrawFunds();
    }

    function test_changeTrustedSigner_AllowsToChangeTrustedSignerAndUseIt()
        external
    {
        (
            address anotherTrustedSigner,
            uint anotherTrustedSignerPrivKey
        ) = makeAddrAndKey("anotherTrustedSigner");

        vm.expectEmit(true, true, true, true);
        emit TrustedSignerChanged(trustedSigner, anotherTrustedSigner);

        mintify.changeTrustedSigner(anotherTrustedSigner);

        address receiver = receivers[0];

        string memory tokenURI = sampleTokenURIs[0];

        (uint8 v, bytes32 r, bytes32 s) = _createSignatureForMint(
            anotherTrustedSignerPrivKey,
            receiver,
            tokenURI,
            0
        );

        uint price = mintify.getPrice(receiver);

        vm.expectEmit(true, true, true, true);
        emit Minted(receiver, 1, tokenURI);

        hoax(receiver);
        mintify.safeMintWithSignature{value: price}(tokenURI, v, r, s);
        assertEq(mintify.balanceOf(receiver), 1);
    }

    function test_changeTrustedSigner_RevertsIf_TryingToChangeToZeroAddress()
        external
    {
        vm.expectRevert(Mintify.ZeroAddressTrustedSigner.selector);
        mintify.changeTrustedSigner(address(0));
    }

    function test_changeCostPerUpdate_AllowsToChangeCost() external {
        uint newCostPerUpdate = costPerUpdate * 2;

        address user = receivers[0];

        vm.expectEmit(true, true, true, true);
        emit CostPerUpdateChanged(costPerUpdate, newCostPerUpdate);

        mintify.changeCostPerUpdate(newCostPerUpdate);

        assertEq(mintify.costPerUpdate(), newCostPerUpdate);
        assertEq(mintify.getPrice(user), newCostPerUpdate);
    }

    function test_supportsInterface_SupportsAllInterfaces() external view {
        bytes4 ERC4906InterfaceId = bytes4(0x49064906);

        assertTrue(mintify.supportsInterface(type(IERC165).interfaceId));
        assertTrue(mintify.supportsInterface(type(IERC721).interfaceId));
        assertTrue(
            mintify.supportsInterface(type(IERC721Metadata).interfaceId)
        );
        assertTrue(mintify.supportsInterface(ERC4906InterfaceId));
    }

    function _createSignatureForMint(
        uint _signerPrivKey,
        address _receiver,
        string memory _tokenURI,
        uint _nonce
    ) private pure returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_receiver, _tokenURI, _nonce, CHAIN_ID)
        );
        return _createSignature(_signerPrivKey, messageHash);
    }

    function _createSignatureForURIUpdate(
        uint _signerPrivKey,
        uint _tokenId,
        string memory _newTokenURI,
        uint _nonce
    ) private pure returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_tokenId, _newTokenURI, _nonce, CHAIN_ID)
        );
        return _createSignature(_signerPrivKey, messageHash);
    }

    function _createSignature(
        uint _signerPrivKey,
        bytes32 _messageHash
    ) private pure returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 ethSignerMessageHash = MessageHashUtils.toEthSignedMessageHash(
            _messageHash
        );
        (v, r, s) = vm.sign(_signerPrivKey, ethSignerMessageHash);
    }
}
