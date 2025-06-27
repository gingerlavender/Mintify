//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Mintify} from "src/Mintify.sol";

contract MintifyTest is Test {
    uint constant CHAIN_ID = 31337;

    Mintify mintify;
    address trustedSigner;
    uint256 trustedSignerPrivKey;
    uint costPerUpdate = 0.01 ether;

    address receiver = makeAddr("receiver");

    function setUp() external {
        (trustedSigner, trustedSignerPrivKey) = makeAddrAndKey("trustedSigner");
        mintify = new Mintify(trustedSigner, costPerUpdate);
    }

    function test_safeMint_allowsMint() external {
        string memory tokenURI = "sampleTokenUri";

        bytes32 messageHash = keccak256(
            abi.encodePacked(receiver, tokenURI, uint(0), CHAIN_ID)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            trustedSignerPrivKey,
            ethSignedMessageHash
        );

        hoax(receiver);

        mintify.safeMintWithSignature{value: costPerUpdate}(tokenURI, v, r, s);

        assertEq(mintify.balanceOf(receiver), 1);
    }

    function test_safeMint_RevertsIf_InfsufficientFunds() external {
        string memory tokenURI = "sampleTokenUri";

        bytes32 messageHash = keccak256(
            abi.encodePacked(receiver, tokenURI, uint(0), CHAIN_ID)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            trustedSignerPrivKey,
            ethSignedMessageHash
        );

        hoax(receiver);

        vm.expectRevert(Mintify.InsufficientFunds.selector);
        mintify.safeMintWithSignature{value: costPerUpdate - 1}(
            tokenURI,
            v,
            r,
            s
        );
    }
}
