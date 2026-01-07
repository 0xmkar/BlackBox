'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { AnimatedLayout } from '../providers/AnimatedLayout';
import { Card } from '../../components/ui/Card';
import { TransactionTable } from '../../components/features/TransactionTable';
import { AuditPanel } from '../../components/features/AuditPanel';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuditorDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [auditResult, setAuditResult] = useState<any>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transaction`);
            const data = await res.json();
            if (data.success) {
                // Reverse to show newest first
                const sortedTxs = data.transactions.reverse().map((tx: any) => ({
                    ...tx,
                    id: tx.id,
                    protocol: tx.protocol === '0x0000000000000000000000000000000000000000' ? 'Private Protocol' : tx.protocol,
                    status: 'Pending Audit'
                }));
                setTransactions(sortedTxs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAudit = async (tx: any) => {
        // Simulate immediate open
        setSelectedTx(tx);
        setAuditResult(null);

        // In a real flow, you'd trigger verification here
        // For demo, we auto-verify after delay or wait for user action in panel
        // We'll simulate a passed KYC audit for now
        setTimeout(() => {
            setAuditResult({
                passed: true,
                title: 'KYC Verified Successfully',
                description: 'Identity confirmed via ZK proof. No sanctions match found.'
            });
        }, 1500);
    };

    return (
        <AnimatedLayout>
            <AppShell>
                <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
                    {/* Header */}
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-semibold text-[#E6EDF3]">Audit Console</h1>
                            <p className="text-sm text-[#9BA4AE] mt-1">
                                Real-time compliance verification & monitoring
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA4AE]" />
                            <input
                                type="text"
                                placeholder="Search transaction ID..."
                                className="pl-10 pr-4 py-2 bg-[#161B22] border border-white/[0.06] rounded-full text-sm text-[#E6EDF3] w-64 focus:outline-none focus:border-[#6ED6C9] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex gap-8 h-full">
                        <Card className="flex-1 overflow-hidden flex flex-col" padding="lg">
                            <div className="flex-1 overflow-y-auto">
                                <TransactionTable
                                    transactions={transactions}
                                    loading={loading}
                                    onSelectTx={handleAudit}
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Slide-out Panel */}
                <AnimatePresence>
                    {selectedTx && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTx(null)}
                                className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
                            />
                            <AuditPanel
                                tx={selectedTx}
                                result={auditResult}
                                onClose={() => setSelectedTx(null)}
                            />
                        </>
                    )}
                </AnimatePresence>
            </AppShell>
        </AnimatedLayout>
    );
}
