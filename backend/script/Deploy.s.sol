// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { Script, console } from "forge-std/Script.sol";
import { BillBite } from "../src/BillBite.sol";

contract DeployScript is Script {
    // Save address
    string internal configDir = string.concat(vm.projectRoot(), "/");
    string internal configFilePath = string.concat(configDir, "address.json");

    uint256 internal deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    BillBite billbite;

    function run() public {
        vm.startBroadcast(deployerPrivateKey);
        billbite = new BillBite();

        updateJson(".billbite", address(billbite));
        vm.stopBroadcast();
    }

    function updateJson(string memory _key, address _address) internal {
        vm.writeJson(vm.toString(_address), configFilePath, _key);
    }
}
