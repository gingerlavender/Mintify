//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {Options} from "openzeppelin-foundry-upgrades/Options.sol";

import {ERC1967Proxy} from "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {Mintify} from "src/Mintify.sol";

contract MintifyDeployScript is Script {
    address constant INITIAL_OWNER = 0xf737D6A273F2E14b4c65d45E0878C4dFdd6D44fb;

    address constant TRUSTED_SIGNER =
        0xf737D6A273F2E14b4c65d45E0878C4dFdd6D44fb;

    uint256 constant COST_PER_UPDATE = 0.001 ether;

    bytes constant INIT_DATA =
        abi.encodeCall(
            Mintify.initialize,
            (INITIAL_OWNER, TRUSTED_SIGNER, COST_PER_UPDATE)
        );

    error AddressMismatch(address predicted, address deployed);

    function run() external {
        Options memory opts;

        bytes32 deploymentSalt = keccak256(
            abi.encodePacked(vm.envString("DEPLOYMENT_SALT"))
        );

        Upgrades.validateImplementation("Mintify.sol:Mintify", opts);

        vm.startBroadcast();

        address implementationAddress = address(
            new Mintify{salt: deploymentSalt}()
        );

        address predictedProxyAddress = vm.computeCreate2Address(
            deploymentSalt,
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(implementationAddress, INIT_DATA)
                )
            )
        );

        ERC1967Proxy proxy = new ERC1967Proxy{salt: deploymentSalt}(
            implementationAddress,
            INIT_DATA
        );

        require(
            address(proxy) == predictedProxyAddress,
            AddressMismatch(predictedProxyAddress, address(proxy))
        );

        vm.stopBroadcast();

        console.log("Implementation deployed at: ", implementationAddress);
        console.log("Proxy deployed at: ", address(proxy));
    }
}
