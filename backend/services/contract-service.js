const ethers = require('ethers');
require('dotenv').config(); // Load from backend/.env

const REGISTRY_ABI = require('../../artifacts/contracts/AuditRegistry.sol/AuditRegistry.json').abi;
const VERIFIER_ABI = require('../../artifacts/contracts/AuditVerifier.sol/AuditVerifier.json').abi;
const MOCK_METH_ABI = require('../../artifacts/contracts/MockMETH.sol/MockMETH.json').abi;
const CURATOR_VAULT_ABI = require('../../artifacts/contracts/CuratorVault.sol/CuratorVault.json').abi;

class ContractService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.MANTLE_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

        this.registryContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS_REGISTRY,
            REGISTRY_ABI,
            this.wallet
        );

        this.verifierContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS_VERIFIER,
            VERIFIER_ABI,
            this.wallet
        );

        this.mockMETHContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS_MOCK_METH,
            MOCK_METH_ABI,
            this.wallet
        );

        this.vaultContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS_CURATOR_VAULT,
            CURATOR_VAULT_ABI,
            this.wallet
        );
    }

    // Assuming an initialize method might be added later or is implicitly handled
    // For now, I'll keep the original contract references as `this.registryContract`
    // and `this.verifierContract` to maintain consistency with the constructor.
    // If `this.auditRegistry` is intended, the constructor also needs modification.

    async registerTransaction({ txId, commitmentHash, protocol }) {
        try {
            // await this.initialize(); // Uncomment if initialize() is implemented and needed

            // if (!this.registryContract) { // Changed from auditRegistry to registryContract
            //   throw new Error('AuditRegistry contract not initialized');
            // }

            const tx = await this.registryContract.registerTx(txId, commitmentHash, protocol);
            await tx.wait();

            return tx.hash;
        } catch (error) {
            console.error("Error registering transaction:", error);
            throw error;
        }
    }

    async submitAuditVerification(txId, auditType, passed, proofData) {
        try {
            let tx;

            if (auditType === 'AML') {
                console.log(`[Contract] Submitting AML attestation for ${txId}...`);
                const mockSig = "0x";
                tx = await this.verifierContract.submitAMLAttestation(txId, passed, mockSig);
            } else if (auditType === 'KYC') {
                console.log(`[Contract] Submitting KYC attestation for ${txId}...`);
                const mockSig = "0x";
                tx = await this.verifierContract.submitKYCAttestation(txId, passed, mockSig);
            } else if (auditType === 'YIELD') {
                console.log(`[Contract] Submitting Yield attestation for ${txId}...`);
                const mockSig = "0x";
                tx = await this.verifierContract.submitYieldAttestation(txId, passed, mockSig);
            } else {
                throw new Error(`Unknown audit type: ${auditType}`);
            }

            console.log(`[Contract] Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`[Contract] Transaction mined in block ${receipt.blockNumber}`);

            return receipt.hash;
        } catch (error) {
            console.error("Error submitting audit verification:", error);
            if (error.data) {
                console.error("Revert data:", error.data);
            }
            throw error;
        }
    }

    async getAuditResult(txId, auditType) {
        try {
            // Handle both string ("KYC", "AML", "YIELD") and number (0, 1, 2) inputs
            let enumType;
            if (typeof auditType === 'number') {
                enumType = auditType; // Already a number (0, 1, or 2)
            } else {
                // Convert string to number
                const typeMap = { 'KYC': 0, 'AML': 1, 'YIELD': 2 };
                enumType = typeMap[auditType];
            }

            if (enumType === undefined) {
                throw new Error(`Invalid audit type: ${auditType}`);
            }

            const result = await this.verifierContract.getAuditResult(txId, enumType);

            // Get the transaction hash by querying events
            // We'll find the AuditCompleted event for this txId and auditType
            const typeNames = ['KYC', 'AML', 'YIELD'];
            const auditTypeName = typeNames[enumType];

            let attestationTxHash = null;

            // Try to query events, but don't fail if RPC has issues
            try {
                const filter = this.verifierContract.filters.AuditCompleted(txId, enumType);
                const events = await this.verifierContract.queryFilter(filter);

                if (events.length > 0) {
                    // Get the most recent event's transaction hash
                    attestationTxHash = events[events.length - 1].transactionHash;
                }
            } catch (eventError) {
                // RPC might be having issues with eth_getLogs, log but continue
                console.warn(`[Contract] Could not fetch events for ${auditTypeName}, RPC may be unavailable:`, eventError.shortMessage || eventError.message);
                // attestationTxHash remains null, which is fine
            }

            // Convert struct to JS object
            return {
                passed: result.passed,
                timestamp: Number(result.timestamp),
                auditor: result.auditor,
                txHash: attestationTxHash,
                type: auditTypeName
            };
        } catch (error) {
            console.error("Error getting audit result:", error);
            return null;
        }
    }

    /**
     * Get all proof attestations for a specific transaction
     */
    async getAllProofsForTransaction(txId) {
        try {
            const proofs = {};

            // Check each proof type, but don't fail if one fails
            for (let i = 0; i < 3; i++) {
                try {
                    const result = await this.getAuditResult(txId, i);
                    if (result && result.timestamp > 0) {
                        const type = ['kyc', 'aml', 'yield'][i];
                        proofs[type] = {
                            passed: result.passed,
                            txHash: result.txHash,
                            timestamp: result.timestamp,
                            auditor: result.auditor
                        };
                    }
                } catch (proofError) {
                    // Log but continue with other proofs
                    const type = ['KYC', 'AML', 'YIELD'][i];
                    console.warn(`[Contract] Could not fetch ${type} proof for ${txId}:`, proofError.shortMessage || proofError.message);
                }
            }

            return proofs;
        } catch (error) {
            console.error("Error getting proofs for transaction:", error);
            return {};
        }
    }

    /**
     * Get all registered transactions from blockchain
     */
    async getAllTransactions() {
        try {
            const count = await this.registryContract.getTransactionCount();
            const transactions = [];

            for (let i = 0; i < count; i++) {
                const txId = await this.registryContract.getTransactionIdByIndex(i);
                const tx = await this.registryContract.getTransaction(txId);

                transactions.push({
                    txId: tx.txId,
                    commitmentHash: tx.commitmentHash,
                    timestamp: tx.timestamp,
                    protocol: tx.protocol,
                    exists: tx.exists
                    // Proofs are fetched on-demand when auditor clicks "Verify", not on page load
                });
            }

            return transactions;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }

    /**
     * VAULT MANAGEMENT METHODS
     */

    /**
     * Get vault information
     */
    async getVaultInfo() {
        try {
            console.log('[Vault] Fetching vault information...');
            const vaultInfo = await this.vaultContract.getVaultInfo();
            console.log('[Vault] ✅ Vault Info Retrieved:');
            console.log('  - Curator:', vaultInfo.curator);
            console.log('  - Asset (mETH):', vaultInfo.asset);
            console.log('  - Total AUM:', vaultInfo.totalAUM.toString(), 'wei');
            console.log('  - Active:', vaultInfo.active);
            console.log('  - Latest PAC:', vaultInfo.latestPAC);

            return {
                curator: vaultInfo.curator,
                asset: vaultInfo.asset,
                totalAUM: vaultInfo.totalAUM.toString(),
                latestPAC: vaultInfo.latestPAC,
                active: vaultInfo.active,
                createdAt: Number(vaultInfo.createdAt)
            };
        } catch (error) {
            console.error("[Vault] ❌ Error getting vault info:", error);
            throw error;
        }
    }

    /**
     * Get depositor balance in vault
     */
    async getDepositorBalance(address) {
        try {
            console.log(`[Vault] Checking balance for depositor: ${address}`);
            const balance = await this.vaultContract.getDepositorBalance(address);
            console.log(`[Vault] ✅ Balance: ${balance.toString()} wei`);
            return balance.toString();
        } catch (error) {
            console.error("[Vault] ❌ Error getting depositor balance:", error);
            throw error;
        }
    }

    /**
     * Record curator private activity (PAC)
     */
    async recordPrivateActivity(pac, curatorAddress) {
        try {
            console.log('[PAC] 🔒 Recording Private Activity Commitment...');
            console.log(`[PAC] Curator: ${curatorAddress}`);
            console.log(`[PAC] PAC Hash: ${pac}`);

            // Use curator's wallet to sign
            const curatorWallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            const vaultWithCurator = this.vaultContract.connect(curatorWallet);

            console.log('[PAC] Submitting transaction to blockchain...');
            const tx = await vaultWithCurator.recordPrivateActivity(pac);
            console.log(`[PAC] Transaction submitted: ${tx.hash}`);

            console.log('[PAC] Waiting for confirmation...');
            await tx.wait();
            console.log('[PAC] ✅ PAC Recorded on-chain!');
            console.log('[PAC] NOTE: Trade details are PRIVATE - only commitment hash is stored');

            return tx.hash;
        } catch (error) {
            console.error("[PAC] ❌ Error recording private activity:", error);
            throw error;
        }
    }

    /**
     * Get MockMETH balance of address
     */
    async getMETHBalance(address) {
        try {
            console.log(`[mETH] Checking balance for: ${address}`);
            const balance = await this.mockMETHContract.balanceOf(address);
            console.log(`[mETH] ✅ Balance: ${balance.toString()} wei (${ethers.formatEther(balance)} mETH)`);
            return balance.toString();
        } catch (error) {
            console.error("[mETH] ❌ Error getting mETH balance:", error);
            throw error;
        }
    }

    /**
     * Mint MockMETH tokens (faucet)
     */
    async mintMETH(toAddress, amount) {
        try {
            console.log('[mETH Faucet] 💧 Minting MockMETH...');
            console.log(`[mETH Faucet] To: ${toAddress}`);
            console.log(`[mETH Faucet] Amount: ${amount} wei (${ethers.formatEther(amount)} mETH)`);

            const tx = await this.mockMETHContract.mint(toAddress, amount);
            console.log(`[mETH Faucet] Transaction: ${tx.hash}`);

            await tx.wait();
            console.log('[mETH Faucet] ✅ Tokens minted successfully!');

            return tx.hash;
        } catch (error) {
            console.error("[mETH Faucet] ❌ Error minting mETH:", error);
            throw error;
        }
    }
    /**
     * Execute swap on FusionX via vault
     */
    async executeSwap(tokenIn, tokenOut, amountIn, poolFee, pac) {
        try {
            console.log('[SWAP] 🔄 Executing private swap via FusionX...');
            console.log('[SWAP] Token In:', tokenIn);
            console.log('[SWAP] Token Out:', tokenOut);
            console.log('[SWAP] Amount In:', amountIn);
            console.log('[SWAP] Pool Fee:', poolFee);
            console.log('[SWAP] PAC:', pac);

            // Use wallet to sign transaction
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            const vaultWithSigner = this.vaultContract.connect(wallet);

            console.log('[SWAP] Submitting transaction to blockchain...');
            const tx = await vaultWithSigner.executePrivateSwap(
                tokenIn,
                tokenOut,
                amountIn,
                poolFee,
                pac
            );

            console.log(`[SWAP] Transaction submitted: ${tx.hash}`);
            console.log('[SWAP] Waiting for confirmation...');

            const receipt = await tx.wait();

            console.log('[SWAP] ✅ Swap confirmed!');
            console.log('[SWAP] Block:', receipt.blockNumber);
            console.log('[SWAP] Gas Used:', receipt.gasUsed.toString());
            console.log('[SWAP] 🔒 Strategy intent remains PRIVATE');
            console.log('[SWAP] 📊 Swap is PUBLIC on FusionX at:', `https://sepolia.mantlescan.xyz/tx/${tx.hash}`);

            return {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error("[SWAP] ❌ Error executing swap:", error);
            throw error;
        }
    }
}

module.exports = new ContractService();
