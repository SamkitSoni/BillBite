// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BillBite {
    error MenuNotSelected(uint256 billId, uint256 menuIndex);

    struct Menu {
        string name;
        uint256 cost;
        address owner;
    }

    uint256 public currentBillId;
    mapping(uint256 => Menu[]) public bills;
    mapping(uint256 => address) public billRestaurant;

    event BillCreated(uint256 billId, uint256 menuCount, address restaurant);
    event MenuAdded(uint256 billId, Menu menu);
    event BillPaid(uint256 billId, address restaurant, address token);

    // Restuarant calls, return bill id
    function createBill(Menu[] memory menus) public returns (uint256) {
        for (uint256 i = 0; i < menus.length; i++) {
            bills[currentBillId].push(menus[i]);
            emit MenuAdded(currentBillId, menus[i]);
        }
        billRestaurant[currentBillId] = msg.sender;

        emit BillCreated(currentBillId, menus.length, msg.sender);

        return currentBillId++;
    }

    // User select menu that be long to them
    function selectMenu(uint256 billId, uint256[] memory menuIndex) public {
        for (uint256 i = 0; i < menuIndex.length; i++) {
            bills[billId][menuIndex[i]].owner = msg.sender;
        }
    }

    // User calls
    function pay(uint256 billId, address token) external {
        Menu[] memory menus = getBillDetail(billId);

        for (uint256 i = 0; i < menus.length; i++) {
            if (menus[i].owner == address(0)) {
                revert MenuNotSelected(billId, i);
            }
            // user need to approve first
            // Transfer the amount to the restaurant
            IERC20(token).transferFrom(menus[i].owner, address(this), menus[i].cost);
        }

        // Transfer the amount to the restaurant
        IERC20(token).transfer(billRestaurant[billId], getBillCost(billId));

        emit BillPaid(billId, billRestaurant[billId], token);
    }

    function getBillDetail(uint256 billId) public view returns (Menu[] memory) {
        return bills[billId];
    }

    function getBillCost(uint256 billId) public view returns (uint256 totalCost) {
        Menu[] storage menus = bills[billId];
        for (uint256 i = 0; i < menus.length; i++) {
            totalCost += menus[i].cost;
        }
    }
}
