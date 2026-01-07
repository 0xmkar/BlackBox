'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export function StatsCard({ title, value, trend, trendValue }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="p-6 rounded-2xl bg-[#161B22] border border-white/[0.06]"
        >
            <p className="text-xs uppercase tracking-wider text-[#9BA4AE] font-medium mb-2">
                {title}
            </p>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold text-[#E6EDF3]">{value}</span>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-[#22C55E]' :
                            trend === 'down' ? 'text-[#EF4444]' :
                                'text-[#9BA4AE]'
                        }`}>
                        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {trend === 'neutral' && <Minus className="w-3 h-3" />}
                        {trendValue}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface StatsGridProps {
    stats: StatsCardProps[];
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.05 }}
                >
                    <StatsCard {...stat} />
                </motion.div>
            ))}
        </div>
    );
}
