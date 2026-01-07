'use client';

import { motion } from 'framer-motion';

export function ProofProgress({ progress }: { progress: number }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9BA4AE]">Generating Proof</span>
                <span className="text-sm font-semibold text-[#6ED6C9]">{Math.round(progress)}%</span>
            </div>

            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="h-full bg-[#6ED6C9] rounded-full"
                />
            </div>

            <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Computing witness...</span>
                <span>~2.5s remaining</span>
            </div>
        </div>
    );
}
