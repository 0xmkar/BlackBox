const express = require('express');
const router = express.Router();
const contractService = require('../services/contract-service');

/**
 * Register a private transaction
 * POST /api/audit/register
 */
router.post('/register', async (req, res) => {
    try {
        const { txId, commitmentHash, protocol } = req.body;

        if (!txId || !commitmentHash || !protocol) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await contractService.registerTransaction({
            txId,
            commitmentHash,
            protocol
        });

        res.json({
            success: true,
            transactionHash: result.hash,
            message: 'Transaction registered successfully'
        });
    } catch (error) {
        console.error('Transaction registration error:', error);
        res.status(500).json({ error: 'Failed to register transaction' });
    }
});

/**
 * Submit audit result
 * POST /api/audit/submit
 */
router.post('/submit', async (req, res) => {
    try {
        const { txId, auditType, proof, publicInputs, passed } = req.body;

        if (!txId || auditType === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await contractService.submitAudit({
            txId,
            auditType, // 0=KYC, 1=AML, 2=YIELD
            proof,
            publicInputs,
            passed
        });

        res.json({
            success: true,
            transactionHash: result.hash,
            message: 'Audit submitted successfully'
        });
    } catch (error) {
        console.error('Audit submission error:', error);
        res.status(500).json({ error: 'Failed to submit audit' });
    }
});

/**
 * Get audit result
 * GET /api/audit/result/:txId/:auditType
 */
router.get('/result/:txId/:auditType', async (req, res) => {
    try {
        const { txId, auditType } = req.params;

        const result = await contractService.getAuditResult(txId, parseInt(auditType));

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Get audit result error:', error);
        res.status(500).json({ error: 'Failed to get audit result' });
    }
});

/**
 * Get all transactions
 * GET /api/audit/transactions
 */
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await contractService.getAllTransactions();

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

/**
 * Check full compliance status
 * GET /api/audit/compliance/:txId
 */
router.get('/compliance/:txId', async (req, res) => {
    try {
        const { txId } = req.params;

        const isCompliant = await contractService.isFullyCompliant(txId);

        res.json({
            success: true,
            txId,
            isCompliant
        });
    } catch (error) {
        console.error('Compliance check error:', error);
        res.status(500).json({ error: 'Failed to check compliance' });
    }
});

/**
 * Verify a specific proof on blockchain (for auditors)
 * POST /api/audit/verify/:txId/:proofType
 */
router.post('/verify/:txId/:proofType', async (req, res) => {
    try {
        const { txId, proofType } = req.params;

        console.log(`[API] Auditor verifying ${proofType.toUpperCase()} proof for transaction ${txId}`);

        // Map proof type to audit type number
        const auditTypeMap = {
            'kyc': 0,
            'aml': 1,
            'yield': 2
        };

        const auditType = auditTypeMap[proofType.toLowerCase()];
        if (auditType === undefined) {
            return res.status(400).json({ error: 'Invalid proof type' });
        }

        console.log(`[API] Querying blockchain for ${proofType.toUpperCase()} attestation...`);

        // Query blockchain for the proof
        const result = await contractService.getAuditResult(txId, auditType);

        console.log(`[API] Blockchain query result:`, result);

        if (result && result.passed) {
            console.log(`[API] ✅ ${proofType.toUpperCase()} proof VERIFIED on blockchain`);
            res.json({
                success: true,
                verified: true,
                proof: result,
                message: `${proofType.toUpperCase()} proof verified on-chain`
            });
        } else {
            console.log(`[API] ❌ ${proofType.toUpperCase()} proof NOT FOUND or FAILED`);
            res.json({
                success: true,
                verified: false,
                error: 'Proof not found or verification failed'
            });
        }
    } catch (error) {
        console.error(`[API] Error verifying ${req.params.proofType}:`, error);
        res.status(500).json({
            success: false,
            verified: false,
            error: 'Failed to verify proof on blockchain'
        });
    }
});

module.exports = router;
