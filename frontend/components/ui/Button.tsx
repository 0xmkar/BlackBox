'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#6ED6C9] text-[#0B0E11] hover:bg-[#5AC2B5]',
  secondary: 'bg-transparent border border-white/10 text-[#E6EDF3] hover:border-[#6ED6C9] hover:text-[#6ED6C9]',
  ghost: 'bg-transparent text-[#9BA4AE] hover:text-[#E6EDF3] hover:bg-white/5',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, icon, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        className={`
          rounded-full font-medium transition-all duration-150
          inline-flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {!loading && icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
