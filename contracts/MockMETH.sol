// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockMETH
 * @notice Mock ERC20 token representing Mantle Staked ETH for testnet
 * @dev Simple faucet-enabled token for easy testing
 */
contract MockMETH is ERC20 {
    /**
     * @notice Deploy MockMETH token
     */
    constructor() ERC20("Mock Mantle Staked ETH", "mETH") {
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
     * @notice Convenience function to mint 1000 mETH to caller
     * @dev Makes testing easier - just call drip()
     */
    function drip() external {
        _mint(msg.sender, 1000 * 10 ** 18); // 1000 mETH
    }
}
