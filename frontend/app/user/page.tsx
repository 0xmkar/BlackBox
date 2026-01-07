'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { AnimatedLayout } from '../providers/AnimatedLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProofProgress } from '../../components/ui/ProofProgress';
import { Wallet, ShieldCheck, ArrowRight, Lock, Check, AlertCircle } from 'lucide-react';
import { useWalletStatus, useTransactionSignature, useProofSignature } from '../../hooks/useWallet';
import { ConnectButton } from '../../components/wallet/ConnectButton';

export default function UserDashboard() {
    const { address, isConnected } = useWalletStatus();
    const { signTransaction } = useTransactionSignature();
    const { signProof } = useProofSignature();

    const [amount, setAmount] = useState('1000');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTxId, setCurrentTxId] = useState<string | null>(null);
    const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
    const [commitmentHash, setCommitmentHash] = useState<string | null>(null);
    const [proofProgress, setProofProgress] = useState(0);
    const [verifying, setVerifying] = useState<'kyc' | 'aml' | 'yield' | null>(null);
    const [proofStatus, setProofStatus] = useState({ kyc: false, aml: false, yield: false });
    const [proofHashes, setProofHashes] = useState<{ kyc?: string; aml?: string; yield?: string }>({});
    const [signatureCount, setSignatureCount] = useState(0);

    const registerTransaction = async () => {
        if (!isConnected || !address) {
            alert('Please connect your wallet first');
            return;
        }

        setIsSubmitting(true);
        try {
            // Step 1: Request signature from user
            const timestamp = BigInt(Math.floor(Date.now() / 1000));
            // Convert USDC amount to base units (6 decimals)
            const amountInBaseUnits = Math.floor(parseFloat(amount) * 1_000_000);
            const message = {
                amount: BigInt(amountInBaseUnits),
                protocol: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                timestamp,
            };

            const signature = await signTransaction(message);
            setSignatureCount(prev => prev + 1);

            // Step 2: Send to backend with signature
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transaction/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                    protocol: '0x0000000000000000000000000000000000000000',
                    walletAddress: address,
                    signature,
                    message: {
                        amount: message.amount.toString(),
                        protocol: message.protocol,
                        timestamp: message.timestamp.toString(),
                    },
                })
            });

            const data = await response.json();
            if (data.success) {
                setCurrentTxId(data.txId);
                setCurrentTxHash(data.txHash);
                setCommitmentHash(data.commitmentHash);
            }
        } catch (error) {
            console.error(error);
            alert('Transaction failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const prepareProof = async (type: 'kyc' | 'aml' | 'yield') => {
        if (!isConnected || !address || !currentTxId) {
            alert('Please connect wallet and submit transaction first');
            return;
        }

        setVerifying(type);
        setProofProgress(0);

        try {
            // Step 1: Request signature from user
            const timestamp = BigInt(Math.floor(Date.now() / 1000));
            const message = {
                txId: currentTxId,
                proofType: type.toUpperCase() as 'KYC' | 'AML' | 'YIELD',
                timestamp,
            };

            const signature = await signProof(message);
            setSignatureCount(prev => prev + 1);

            // Step 2: Simulate progress while generating proof
            const interval = setInterval(() => {
                setProofProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);

            // Step 3: Generate proof with signature
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proof/generate/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txId: currentTxId,
                    inputs: { amount: Number(amount) },
                    walletAddress: address,
                    signature,
                    message: {
                        txId: message.txId,
                        proofType: message.proofType,
                        timestamp: message.timestamp.toString(),
                    },
                })
            });

            const data = await response.json();
            clearInterval(interval);
            setProofProgress(100);
            setProofStatus(prev => ({ ...prev, [type]: true }));

            // Store the proof transaction hash
            if (data.txHash) {
                setProofHashes(prev => ({ ...prev, [type]: data.txHash }));
                console.log(`[USER] ${type.toUpperCase()} proof transaction:`, data.txHash);
            }

            setTimeout(() => {
                setVerifying(null);
                setProofProgress(0);
            }, 1000);
        } catch (error) {
            console.error(error);
            alert(`${type.toUpperCase()} proof generation failed. Please try again.`);
            setVerifying(null);
            setProofProgress(0);
        }
    };

    return (
        <AnimatedLayout>
            <AppShell>
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Wallet Status Banner */}
                    {!isConnected && (
                        <Card className="bg-[#F59E0B]/10 border-[#F59E0B]/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                                    <div>
                                        <p className="text-sm font-medium text-[#E6EDF3]">Wallet Not Connected</p>
                                        <p className="text-xs text-[#9BA4AE]">Connect your wallet to submit transactions</p>
                                    </div>
                                </div>
                                <ConnectButton />
                            </div>
                        </Card>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-[#E6EDF3]">Transaction & Proofs</h1>
                            <p className="text-sm text-[#9BA4AE] mt-1">
                                Submit transactions and generate zero-knowledge proofs
                            </p>
                        </div>
                        {isConnected && signatureCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#6ED6C9]/10 border border-[#6ED6C9]/20">
                                <Check className="w-4 h-4 text-[#6ED6C9]" />
                                <span className="text-sm font-medium text-[#6ED6C9]">{signatureCount} Signature{signatureCount !== 1 ? 's' : ''} Collected</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Transaction Submission */}
                        <Card padding="lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-[#6ED6C9]/10 text-[#6ED6C9]">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#E6EDF3]">New Transaction</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium text-[#9BA4AE] uppercase mb-2">
                                        Amount (USDC)
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-[#0B0E11] border border-white/[0.06] rounded-xl px-4 py-3 text-[#E6EDF3] focus:outline-none focus:border-[#6ED6C9] transition-colors"
                                    />
                                </div>

                                <Button
                                    onClick={registerTransaction}
                                    loading={isSubmitting}
                                    disabled={!isConnected}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isConnected ? 'Submit to Mantle' : 'Connect Wallet First'}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-2 text-xs text-[#6B7280] justify-center bg-[#0B0E11] py-2 rounded-lg border border-white/[0.04]">
                                    <Lock className="w-3 h-3" />
                                    <span>Privacy Preserved via ZK Commitment</span>
                                </div>
                            </div>
                        </Card>

                        {/* Right: Proof Generation */}
                        <Card padding="lg" className={!currentTxId ? 'opacity-50 pointer-events-none' : ''}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#E6EDF3]">Generate Proofs</h2>
                            </div>

                            {currentTxId ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="bg-[#0B0E11] rounded-xl p-4 border border-white/[0.06] flex-1 min-w-0">
                                            <p className="text-xs text-[#9BA4AE] mb-1">Transaction ID</p>
                                            <p className="text-sm font-mono text-[#E6EDF3] truncate">{currentTxId}</p>
                                        </div>
                                        <div className="bg-[#0B0E11] rounded-xl p-4 border border-white/[0.06] text-center w-24 flex-shrink-0">
                                            <p className="text-xs text-[#9BA4AE] mb-1">Progress</p>
                                            <p className="text-sm font-semibold text-[#E6EDF3]">{Object.values(proofStatus).filter(Boolean).length}/3</p>
                                        </div>
                                    </div>

                                    {verifying ? (
                                        <ProofProgress progress={proofProgress} />
                                    ) : (
                                        <div className="space-y-3">
                                            <ProofAction
                                                title="KYC Compliance"
                                                desc="Verify identity without revealing PII"
                                                isVerified={proofStatus.kyc}
                                                txHash={proofHashes.kyc}
                                                onClick={() => prepareProof('kyc')}
                                            />
                                            <ProofAction
                                                title="AML Check"
                                                desc="Sanctions screening proof"
                                                isVerified={proofStatus.aml}
                                                txHash={proofHashes.aml}
                                                onClick={() => prepareProof('aml')}
                                            />
                                            <ProofAction
                                                title="Yield Eligibility"
                                                desc="Prove balance > threshold"
                                                isVerified={proofStatus.yield}
                                                txHash={proofHashes.yield}
                                                onClick={() => prepareProof('yield')}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-center px-6">
                                    <p className="text-sm text-[#9BA4AE]">
                                        Submit a transaction first to generate compliance proofs.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {currentTxId && commitmentHash && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="bg-[#12161C]/50 border-dashed">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-[#E6EDF3]">Commitment Hash Created</h3>
                                        <p className="text-xs text-[#9BA4AE] mt-1 font-mono">{commitmentHash}</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => window.open(`https://explorer.sepolia.mantle.xyz/tx/${currentTxHash}`, '_blank')}>
                                        View on Explorer
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </AppShell>
        </AnimatedLayout>
    );
}

function ProofAction({ title, desc, onClick, isVerified, txHash }: { title: string, desc: string, onClick: () => void, isVerified: boolean, txHash?: string }) {
    if (isVerified) {
        return (
            <div className="w-full flex items-center justify-between p-4 bg-[#6ED6C9]/10 border border-[#6ED6C9]/20 rounded-xl transition-all duration-200">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#6ED6C9]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-[#6ED6C9]" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[#6ED6C9]">{title}</p>
                        <p className="text-xs text-[#6ED6C9]/70">Verified Successfully</p>
                    </div>
                </div>
                {txHash && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://explorer.sepolia.mantle.xyz/tx/${txHash}`, '_blank');
                        }}
                        className="text-xs px-3 py-1.5 bg-[#6ED6C9]/20 hover:bg-[#6ED6C9]/30 border border-[#6ED6C9]/30 rounded-lg text-[#6ED6C9] hover:text-white transition-all flex-shrink-0"
                    >
                        View Proof
                    </button>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-[#0B0E11] hover:bg-[#161B22] border border-white/[0.06] hover:border-[#6ED6C9]/30 rounded-xl transition-all duration-200 group text-left"
        >
            <div>
                <p className="text-sm font-medium text-[#E6EDF3] group-hover:text-[#6ED6C9] transition-colors">{title}</p>
                <p className="text-xs text-[#9BA4AE]">{desc}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#161B22] flex items-center justify-center group-hover:bg-[#6ED6C9] transition-colors">
                <ArrowRight className="w-4 h-4 text-[#9BA4AE] group-hover:text-[#0B0E11]" />
            </div>
        </button>
    );
}
