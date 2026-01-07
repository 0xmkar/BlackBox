'use client';

import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-[#0B0E11]">
            <TopNav />
            <Sidebar />
            <main className="ml-16 mt-16 p-8">
                {children}
            </main>
        </div>
    );
}
