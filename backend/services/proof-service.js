const snarkjs = require("snarkjs");
const path = require("path");

/**
 * REAL ZK Proof Generation Service
 * Uses SnarkJS with compiled circuits
 */

class ProofService {
    /**
     * Generate AML proof (ON-CHAIN VERIFICATION)
     * Proves user address is NOT on sanctions blacklist
     */
    async generateAMLProof(inputs) {
        const startTime = Date.now();
        const logs = [];
        const log = (msg) => {
            const ts = new Date().toISOString().split('T')[1].slice(0, -1);
            console.log(`[ZK-PROOF] ${ts} - ${msg}`);
            logs.push(`[${ts}] ${msg}`);
        };

        try {
            log("🚀 Starting AML Path Exclusion Proof generation...");

            // CORRECTED PATHS: Go up two levels from backend/services to project root
            const wasmPath = path.join(__dirname, "../../circuits/build/aml_proof_js/aml_proof.wasm");
            const zkeyPath = path.join(__dirname, "../../circuits/build/aml_final.zkey");

            log(`📂 Loading circuit artifacts from: ${path.dirname(wasmPath)}`);

            const t1 = Date.now();
            // Generate proof using SnarkJS
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                inputs,
                wasmPath,
                zkeyPath
            );

            log(`✅ Witness generated & Proof computed in ${Date.now() - t1}ms`);
            log(`🔐 Public Signals: [${publicSignals.join(', ')}]`);
            log(`⚏ Proof Curve Points: A=[${proof.pi_a[0].substring(0, 10)}...], ...`);

            // Format for Solidity verifier (CRITICAL: reverse pi_b rows)
            const formattedProof = {
                a: proof.pi_a.slice(0, 2),
                b: [
                    proof.pi_b[0].reverse(),
                    proof.pi_b[1].reverse()
                ],
                c: proof.pi_c.slice(0, 2),
                input: publicSignals
            };

            const totalTime = Date.now() - startTime;
            log(`🏁 Total ZK Generation Time: ${totalTime}ms`);

            return {
                proof: formattedProof,
                publicSignals,
                generationTime: `${(totalTime / 1000).toFixed(2)}s`,
                notOnBlacklist: true,
                logs: logs // Send logs to frontend
            };
        } catch (error) {
            console.error("AML proof generation failed:", error);
            throw new Error("Failed to generate AML proof: " + error.message);
        }
    }

    /**
     * Generate KYC proof (OFF-CHAIN VERIFICATION)
     * Mock implementation - would use real circuit in production
     */
    async generateKYCProof(inputs) {
        const startTime = Date.now();

        // Simulate proof generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const generationTime = Date.now() - startTime;

        return {
            proof: {
                pi_a: ['0x123...', '0x456...'],
                pi_b: [['0x789...', '0xabc...'], ['0xdef...', '0x012...']],
                pi_c: ['0x345...', '0x678...']
            },
            publicSignals: ['0x' + 'a'.repeat(64)],
            commitmentHash: '0x' + 'a'.repeat(64),
            generationTime: `${(generationTime / 1000).toFixed(1)}s`,
            logs: [`[${new Date().toISOString()}] KYC proof generated (mock)`]
        };
    }

    /**
     * Generate Yield proof (OFF-CHAIN VERIFICATION)
     * Mock implementation - would use real circuit in production
     */
    async generateYieldProof(inputs) {
        const startTime = Date.now();

        // Simulate proof generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const passed = inputs.yieldAmount >= inputs.threshold;
        const generationTime = Date.now() - startTime;

        return {
            proof: {
                pi_a: ['0x333...', '0x444...'],
                pi_b: [['0x555...', '0x666...'], ['0x777...', '0x888...']],
                pi_c: ['0x999...', '0xaaa...']
            },
            publicSignals: [inputs.threshold, passed ? 1 : 0],
            passed,
            generationTime: `${(generationTime / 1000).toFixed(1)}s`,
            logs: [`[${new Date().toISOString()}] Yield proof generated (mock)`]
        };
    }
}

module.exports = new ProofService();
