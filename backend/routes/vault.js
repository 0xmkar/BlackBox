const express = require('express');
const router = express.Router();
const contractService = require('../services/contract-service');
const ethers = require('ethers');

/**
 * GET /api/vault/info
 * Get vault information (AUM, curator, status)
 */
router.get('/info', async (req, res) => {
    try {
        const vaultInfo = await contractService.getVaultInfo();

        res.json({
            success: true,
            vault: vaultInfo
        });
    } catch (error) {
        console.error('[Vault API] Error getting vault info:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vault/balance/:address
 * Get depositor balance in vault
 */
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await contractService.getDepositorBalance(address);

        res.json({
            success: true,
            address,
            balance
        });
    } catch (error) {
        console.error('[Vault API] Error getting balance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/vault/pac
 * Record Private Activity Commitment (curator only)
 * Body: { pac: "0x...", curatorAddress: "0x..." }
 */
router.post('/pac', async (req, res) => {
    try {
        const { pac, curatorAddress } = req.body;

        if (!pac || !curatorAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing pac or curatorAddress'
            });
        }

        const txHash = await contractService.recordPrivateActivity(pac, curatorAddress);

        res.json({
            success: true,
            txHash,
            pac
        });
    } catch (error) {
        console.error('[Vault API] Error recording PAC:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/vault/swap
 * Execute private swap via FusionX
 * Body: { tokenIn, tokenOut, amountIn, poolFee? }
 */
router.post('/swap', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, poolFee = 3000 } = req.body;

        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: tokenIn, tokenOut, amountIn'
            });
        }

        console.log('[Vault API] 🔄 Processing swap request...');
        console.log(`[Vault API] ${tokenIn} → ${tokenOut}, Amount: ${amountIn}`);

        // Generate PAC (simplified for demo)
        const pacData = ethers.solidityPacked(
            ['address', 'address', 'uint256', 'uint256'],
            [tokenIn, tokenOut, amountIn, Date.now()]
        );
        const pac = ethers.keccak256(pacData);

        console.log('[Vault API] Generated PAC:', pac);

        const result = await contractService.executeSwap(
            tokenIn,
            tokenOut,
            amountIn,
            poolFee,
            pac
        );

        console.log('[Vault API] ✅ Swap executed successfully');

        res.json({
            success: true,
            txHash: result.txHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed,
            pac,
            explorerUrl: `https://sepolia.mantlescan.xyz/tx/${result.txHash}`,
            message: 'Swap is PUBLIC on FusionX, strategy intent is PRIVATE'
        });

    } catch (error) {
        console.error('[Vault API] ❌ Swap error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Swap execution failed'
        });
    }
});

/**
 * GET /api/vault/meth-balance/:address
 * Get MockMETH balance of address
 */
router.get('/meth-balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await contractService.getMETHBalance(address);

        res.json({
            success: true,
            address,
            balance
        });
    } catch (error) {
        console.error('[Vault API] Error getting mETH balance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/vault/faucet
 * Mint MockMETH tokens (faucet)
 * Body: { address: "0x...", amount: "1000000000000000000000" }
 */
router.post('/faucet', async (req, res) => {
    try {
        const { address, amount } = req.body;

        if (!address || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing address or amount'
            });
        }

        const txHash = await contractService.mintMETH(address, amount);

        res.json({
            success: true,
            txHash,
            address,
            amount
        });
    } catch (error) {
        console.error('[Vault API] Error minting mETH:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
