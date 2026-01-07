'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '../wallet/ConnectButton';

export function TopNav() {
    const pathname = usePathname();

    // Determine section name from pathname
    const getSectionName = () => {
        if (pathname === '/') return 'Dashboard';
        if (pathname === '/user') return 'User Dashboard';
        if (pathname === '/auditor') return 'Audit Console';
        if (pathname?.includes('/transactions')) return 'Transactions';
        return 'Dashboard';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#12161C]/80 backdrop-blur-md border-b border-white/[0.04] z-50">
            <div className="flex items-center justify-between h-full px-6">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-xl font-bold text-[#E6EDF3]">MantleAudit</span>
                </Link>

                {/* Center: Section name */}
                <div className="text-[#9BA4AE] text-sm font-medium">
                    {getSectionName()}
                </div>

                {/* Right: Network + Wallet */}
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-[#161B22] border border-white/[0.06] text-xs text-[#9BA4AE] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                        Mantle Sepolia
                    </div>
                    <ConnectButton />
                </div>
            </div>
        </nav>
    );
}
