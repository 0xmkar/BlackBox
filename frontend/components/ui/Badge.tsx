'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'default' | 'mint';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#22C55E]/10 text-[#22C55E]',
  error: 'bg-[#EF4444]/10 text-[#EF4444]',
  warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  default: 'bg-white/5 text-[#9BA4AE]',
  mint: 'bg-[#6ED6C9]/10 text-[#6ED6C9]',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  let variant: BadgeVariant = 'default';
  if (s === 'passed' || s === 'verified') variant = 'success';
  else if (s === 'failed') variant = 'error';

  return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
