// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';


contract ERN is ERC20 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(
        string memory name, string memory symbol
    ) public ERC20(name, symbol) {
        // 30M Total $ERN supply 
        _mint(msg.sender, 30000000 * (10 ** 18));
    }
}
