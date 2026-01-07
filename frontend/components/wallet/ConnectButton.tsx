'use client';

import { ConnectKitButton } from 'connectkit';
import { motion } from 'framer-motion';

export function ConnectButton() {
    return (
        <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => {
                return (
                    <motion.button
                        onClick={show}
                        className={`
              px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200
              ${isConnected
                                ? 'bg-[#161B22] border border-white/[0.1] text-[#E6EDF3] hover:border-[#6ED6C9]/30'
                                : 'bg-[#6ED6C9] text-[#0B0E11] hover:bg-[#5AC2B5]'
                            }
              shadow-lg shadow-[#6ED6C9]/20 hover:shadow-[#6ED6C9]/30
            `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isConnected ? (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                                {ensName ?? truncatedAddress}
                            </span>
                        ) : (
                            'Connect Wallet'
                        )}
                    </motion.button>
                );
            }}
        </ConnectKitButton.Custom>
    );
}
