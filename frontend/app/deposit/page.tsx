'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { AnimatedLayout } from '../providers/AnimatedLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProofProgress } from '../../components/ui/ProofProgress';
import {
    Wallet,
    TrendingUp,
    ArrowRight,
    Lock,
    Check,
    AlertCircle,
    ArrowDownCircle,
    ArrowUpCircle,
    PieChart
} from 'lucide-react';
import { useWalletStatus } from '../../hooks/useWallet';
import { ConnectButton } from '../../components/wallet/ConnectButton';

export default function DepositPage() {
    const { address, isConnected } = useWalletStatus();

    const [vaultInfo, setVaultInfo] = useState<any>(null);
    const [userShares, setUserShares] = useState<any>(null);
    const [depositAmount, setDepositAmount] = useState('1000');
    const [withdrawShares, setWithdrawShares] = useState('100');
    const [isDepositing, setIsDepositing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [complianceTxId, setComplianceTxId] = useState('');
    const [hasProofs, setHasProofs] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            fetchVaultInfo();
            fetchUserShares();
        }
    }, [isConnected, address]);

    const fetchVaultInfo = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vault/info`);
            const data = await response.json();
            if (data.success) {
                setVaultInfo(data.vault);
            }
        } catch (error) {
            console.error('Error fetching vault info:', error);
        }
    };

    const fetchUserShares = async () => {
        if (!address) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vault/shares/${address}`);
            const data = await response.json();
            if (data.success) {
                setUserShares(data);
                if (data.complianceTxId && data.complianceTxId !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    setComplianceTxId(data.complianceTxId);
                    setHasProofs(true);
                }
            }
        } catch (error) {
            console.error('Error fetching user shares:', error);
        }
    };

    const handleDeposit = async () => {
        if (!isConnected || !address) {
            alert('Please connect your wallet first');
            return;
        }

        if (!complianceTxId) {
            alert('Please generate KYC/AML proofs first on the User page');
            return;
        }

        setIsDepositing(true);
        setProgress(0);

        try {
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const tokenAddress = vaultInfo?.asset || '0x0000000000000000000000000000000000000000';

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vault/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: tokenAddress,
                    amount: depositAmount,
                    complianceTxId
                })
            });

            const data = await response.json();
            clearInterval(interval);
            setProgress(100);

            if (data.success) {
                setTxHash(data.txHash);
                await fetchVaultInfo();
                await fetchUserShares();
                setTimeout(() => {
                    setIsDepositing(false);
                    setProgress(0);
                }, 2000);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Deposit failed: ${error.message}`);
            setIsDepositing(false);
            setProgress(0);
        }
    };

    const handleWithdraw = async () => {
        if (!isConnected || !address) {
            alert('Please connect your wallet first');
            return;
        }

        setIsWithdrawing(true);
        setProgress(0);

        try {
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const tokenAddress = vaultInfo?.asset || '0x0000000000000000000000000000000000000000';

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vault/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: tokenAddress,
                    shareAmount: withdrawShares
                })
            });

            const data = await response.json();
            clearInterval(interval);
            setProgress(100);

            if (data.success) {
                setTxHash(data.txHash);
                await fetchVaultInfo();
                await fetchUserShares();
                setTimeout(() => {
                    setIsWithdrawing(false);
                    setProgress(0);
                }, 2000);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Withdrawal failed: ${error.message}`);
            setIsWithdrawing(false);
            setProgress(0);
        }
    };

    return (
        <AnimatedLayout>
            <AppShell>
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-[#E6EDF3]">Vault Deposits</h1>
                            <p className="text-sm text-[#9BA4AE] mt-1">
                                Deposit, withdraw, and track your vault shares
                            </p>
                        </div>
                        {!isConnected && <ConnectButton />}
                    </div>

                    {isConnected && !hasProofs && (
                        <Card className="bg-[#F59E0B]/10 border-[#F59E0B]/20">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                                <div>
                                    <p className="text-sm font-medium text-[#E6EDF3]">Compliance Proofs Required</p>
                                    <p className="text-xs text-[#9BA4AE]">
                                        Generate KYC and AML proofs on the <a href="/user" className="text-[#6ED6C9] hover:underline">User page</a> first
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {userShares && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card padding="lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-[#6ED6C9]/10 text-[#6ED6C9]">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-medium text-[#9BA4AE]">Your Shares</h3>
                                </div>
                                <p className="text-2xl font-semibold text-[#E6EDF3]">{userShares.shares}</p>
                                <p className="text-xs text-[#9BA4AE] mt-1">{userShares.percentage} of vault</p>
                            </Card>

                            <Card padding="lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-medium text-[#9BA4AE]">Token Value</h3>
                                </div>
                                <p className="text-2xl font-semibold text-[#E6EDF3]">
                                    {(parseInt(userShares.tokenValue || '0') / 1e18).toFixed(4)} ETH
                                </p>
                                <p className="text-xs text-[#9BA4AE] mt-1">Based on your shares</p>
                            </Card>

                            <Card padding="lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-medium text-[#9BA4AE]">Vault AUM</h3>
                                </div>
                                <p className="text-2xl font-semibold text-[#E6EDF3]">
                                    {vaultInfo ? (parseInt(vaultInfo.totalAUM) / 1e18).toFixed(4) : '0'} ETH
                                </p>
                                <p className="text-xs text-[#9BA4AE] mt-1">Total vault value</p>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card padding="lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-[#6ED6C9]/10 text-[#6ED6C9]">
                                    <ArrowDownCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#E6EDF3]">Deposit to Vault</h2>
                            </div>

                            {isDepositing ? (
                                <ProofProgress progress={progress} />
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-medium text-[#9BA4AE] uppercase mb-2">
                                            Amount (Wei)
                                        </label>
                                        <input
                                            type="number"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            className="w-full bg-[#0B0E11] border border-white/[0.06] rounded-xl px-4 py-3 text-[#E6EDF3] focus:outline-none focus:border-[#6ED6C9] transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[#9BA4AE] uppercase mb-2">
                                            Compliance TxId
                                        </label>
                                        <input
                                            type="text"
                                            value={complianceTxId}
                                            onChange={(e) => setComplianceTxId(e.target.value)}
                                            placeholder="0x... (from User page)"
                                            className="w-full bg-[#0B0E11] border border-white/[0.06] rounded-xl px-4 py-3 text-[#E6EDF3] focus:outline-none focus:border-[#6ED6C9] transition-colors font-mono text-sm"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleDeposit}
                                        disabled={!isConnected || !complianceTxId}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Deposit & Receive Shares
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>

                                    <div className="flex items-center gap-2 text-xs text-[#6B7280] justify-center bg-[#0B0E11] py-2 rounded-lg border border-white/[0.04]">
                                        <Lock className="w-3 h-3" />
                                        <span>Privacy-preserving deposit with ZK proofs</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card padding="lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                                    <ArrowUpCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#E6EDF3]">Withdraw from Vault</h2>
                            </div>

                            {isWithdrawing ? (
                                <ProofProgress progress={progress} />
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-medium text-[#9BA4AE] uppercase mb-2">
                                            Shares to Redeem
                                        </label>
                                        <input
                                            type="number"
                                            value={withdrawShares}
                                            onChange={(e) => setWithdrawShares(e.target.value)}
                                            className="w-full bg-[#0B0E11] border border-white/[0.06] rounded-xl px-4 py-3 text-[#E6EDF3] focus:outline-none focus:border-[#6ED6C9] transition-colors"
                                        />
                                        <p className="text-xs text-[#9BA4AE] mt-2">
                                            You have {userShares?.shares || '0'} shares available
                                        </p>
                                    </div>

                                    <div className="bg-[#0B0E11] rounded-xl p-4 border border-white/[0.06]">
                                        <p className="text-xs text-[#9BA4AE] mb-1">You will receive approximately:</p>
                                        <p className="text-lg font-semibold text-[#E6EDF3]">
                                            {vaultInfo && userShares ?
                                                ((parseInt(withdrawShares) / parseInt(userShares.shares || '1')) * (parseInt(userShares.tokenValue || '0') / 1e18)).toFixed(6)
                                                : '0'} ETH
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleWithdraw}
                                        disabled={!isConnected || parseInt(withdrawShares) > parseInt(userShares?.shares || '0')}
                                        className="w-full"
                                        size="lg"
                                        variant="secondary"
                                    >
                                        Withdraw Tokens
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>

                                    <div className="flex items-center gap-2 text-xs text-[#6B7280] justify-center bg-[#0B0E11] py-2 rounded-lg border border-white/[0.04]">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Curator cannot withdraw - only depositors</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {txHash && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="bg-[#6ED6C9]/10 border-[#6ED6C9]/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-[#6ED6C9]" />
                                        <div>
                                            <h3 className="text-sm font-medium text-[#E6EDF3]">Transaction Successful</h3>
                                            <p className="text-xs text-[#9BA4AE] mt-1 font-mono">{txHash}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => window.open(`https://explorer.sepolia.mantle.xyz/tx/${txHash}`, '_blank')}
                                    >
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
