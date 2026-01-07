'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedLayoutProps {
    children: ReactNode;
}

export function AnimatedLayout({ children }: AnimatedLayoutProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
