// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { BillBite } from "../src/BillBite.sol";
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";

contract BillBiteTest is Test {
    BillBite public billbite;

    address restaurant = makeAddr("restaurant");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    MockERC20 public eth;

    function setUp() public {
        billbite = new BillBite();
        eth = new MockERC20("ETH", "ETH", 18);
    }

    function test_selectMenu() public {
        uint256 billId = _createBill();
        vm.prank(alice);
        billbite.selectMenu(billId, new uint256[](1));

        assertEq(billbite.getBillDetail(billId)[0].owner, alice);
    }

    function test_payBill() public {
        uint256 billId = _createBill();

        vm.prank(alice);
        uint256[] memory aliceMenu = new uint256[](1);
        aliceMenu[0] = 0;
        billbite.selectMenu(billId, aliceMenu);

        vm.prank(bob);
        uint256[] memory bobMenu = new uint256[](1);
        bobMenu[0] = 1;
        billbite.selectMenu(billId, bobMenu);

        deal(address(eth), alice, 10e18);
        deal(address(eth), bob, 20e18);
        vm.prank(alice);
        eth.approve(address(billbite), 10e18);
        vm.prank(bob);
        eth.approve(address(billbite), 20e18);

        uint256 aliceBalanceBefore = eth.balanceOf(alice);
        uint256 bobBalanceBefore = eth.balanceOf(bob);
        uint256 restaurantBalanceBefore = eth.balanceOf(restaurant);

        assertEq(aliceBalanceBefore, 10e18, "Alice");
        assertEq(bobBalanceBefore, 20e18, "Bob");
        assertEq(restaurantBalanceBefore, 0, "Restaurant");

        billbite.pay(billId, address(eth));

        uint256 aliceBalanceAfter = eth.balanceOf(alice);
        uint256 bobBalanceAfter = eth.balanceOf(bob);
        uint256 restaurantBalanceAfter = eth.balanceOf(restaurant);

        assertEq(aliceBalanceAfter, 0, "Alice");
        assertEq(bobBalanceAfter, 0, "Bob");
        assertEq(restaurantBalanceAfter, 30e18, "Restaurant");
    }

    function _createBill() internal returns (uint256) {
        BillBite.Menu[] memory menus = new BillBite.Menu[](2);
        menus[0] = BillBite.Menu({ name: "Pizza", cost: 10e18, owner: address(0) });
        menus[1] = BillBite.Menu({ name: "Burger", cost: 20e18, owner: address(0) });
        vm.prank(restaurant);
        uint256 billId = billbite.createBill(menus);

        assertEq(billbite.getBillDetail(billId).length, 2);
        assertEq(billbite.getBillCost(billId), 30e18);
        assertEq(billbite.billRestaurant(billId), restaurant);
        assertEq(billbite.getBillDetail(billId)[0].name, "Pizza");
        assertEq(billbite.getBillDetail(billId)[1].name, "Burger");
        assertEq(billbite.getBillDetail(billId)[0].cost, 10e18);
        assertEq(billbite.getBillDetail(billId)[1].cost, 20e18);
        assertEq(billbite.getBillDetail(billId)[0].owner, address(0));
        assertEq(billbite.getBillDetail(billId)[1].owner, address(0));

        return billId;
    }
}
