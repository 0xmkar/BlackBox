// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @notice Mock ERC20 token representing USDT for testnet
 * @dev Simple faucet-enabled token for testing swaps
 */
contract MockUSDT is ERC20 {
    /**
     * @notice Deploy MockUSDT token
     */
    constructor() ERC20("Mock Tether USD", "USDT") {
        // No initial supply - users mint via faucet
    }

    /**
     * @notice Faucet function - anyone can mint tokens for testing
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Convenience function to mint 10,000 USDT to caller
     * @dev Makes testing easier - matches typical swap outputs
     */
    function drip() external {
        _mint(msg.sender, 10000 * 10 ** 18); // 10,000 USDT
    }
}
