'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AnimatedLayout } from './providers/AnimatedLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatsGrid } from '../components/features/StatsCards';
import { TransactionTable } from '../components/features/TransactionTable';
import { AuditPanel } from '../components/features/AuditPanel'; // Import AuditPanel
import { Wallet, Plus, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence
import Link from 'next/link';

interface Transaction {
  id: string;
  protocol: string;
  timestamp: string;
  status: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/transaction`);
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions.map((tx: any) => ({
          id: tx.id,
          protocol: tx.protocol === '0x0000000000000000000000000000000000000000' ? 'Private Protocol' : tx.protocol,
          timestamp: tx.timestamp,
          status: 'Pending'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'Total Transactions', value: transactions.length.toString(), trend: 'up' as const, trendValue: '+12%' },
    { title: 'Proofs Generated', value: (transactions.length * 2).toString(), trend: 'up' as const, trendValue: '+8%' },
    { title: 'Audits Passed', value: Math.floor(transactions.length * 0.9).toString(), trend: 'neutral' as const },
    { title: 'Audits Failed', value: Math.ceil(transactions.length * 0.1).toString(), trend: 'down' as const, trendValue: '-3%' },
  ];

  return (
    <AnimatedLayout>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#E6EDF3]">Dashboard</h1>
              <p className="text-sm text-[#9BA4AE] mt-1">
                Privacy-preserving compliance overview
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={<Wallet className="w-4 h-4" />}>
                Connect Wallet
              </Button>
              <Link href="/vault">
                <Button variant="primary" icon={<Shield className="w-4 h-4" />}>
                  View Vault
                </Button>
              </Link>
              <Link href="/user">
                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                  New Transaction
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid stats={stats} />

          {/* Transactions Table */}
          <Card padding="lg" className="overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#E6EDF3]">Recent Transactions</h2>
              <Button variant="ghost" size="sm" onClick={fetchTransactions}>
                Refresh
              </Button>
            </div>
            <TransactionTable
              transactions={transactions}
              loading={loading}
              onSelectTx={setSelectedTx}
            />
          </Card>

          {/* Cost Comparison Banner */}
          <Card className="bg-gradient-to-r from-[#161B22] to-[#12161C] border-[#6ED6C9]/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">Why Mantle?</h3>
                <p className="text-sm text-[#9BA4AE]">
                  Save 99.96% on compliance audit costs compared to Ethereum L1
                </p>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <p className="text-xs text-[#9BA4AE] uppercase tracking-wider mb-1">Ethereum L1</p>
                  <p className="text-2xl font-semibold text-[#EF4444] line-through opacity-60">$87</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9BA4AE] uppercase tracking-wider mb-1">Mantle L2</p>
                  <p className="text-2xl font-semibold text-[#6ED6C9]">$0.03</p>
                </div>
              </div>
            </div>
          </Card>
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
                onClose={() => setSelectedTx(null)}
              />
            </>
          )}
        </AnimatePresence>
      </AppShell>
    </AnimatedLayout>
  );
}
