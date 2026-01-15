"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import MantleLogo from './MantleLogo';

const BackgroundLogo = () => {
    const pathname = usePathname();

    // Don't render on the home page as it has its own logic
    if (pathname === '/') return null;

    return (
        <div className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] z-0 pointer-events-none opacity-20 blur-sm">
            <div className="w-full h-full animate-[logoRotate_60s_linear_infinite]">
                <MantleLogo />
            </div>
        </div>
    );
};

export default BackgroundLogo;
