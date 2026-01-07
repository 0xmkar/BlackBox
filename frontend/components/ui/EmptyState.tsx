'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {icon && (
                <div className="w-16 h-16 mb-4 text-[#6B7280]">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-[#E6EDF3] mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-[#9BA4AE] max-w-sm mb-6">{description}</p>
            )}
            {action}
        </div>
    );
}
