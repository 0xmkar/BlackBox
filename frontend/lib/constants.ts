// Layout constants - Use everywhere for consistency
export const LAYOUT = {
    SIDEBAR_WIDTH: 64,
    TOPNAV_HEIGHT: 64,
} as const;

// Color tokens (matching CSS variables)
export const COLORS = {
    bg: {
        primary: '#0B0E11',
        surface: '#12161C',
        card: '#161B22',
    },
    accent: {
        mint: '#6ED6C9',
        mintHover: '#5AC2B5',
    },
    text: {
        primary: '#E6EDF3',
        secondary: '#9BA4AE',
        muted: '#6B7280',
    },
    status: {
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
    },
    border: {
        subtle: 'rgba(255, 255, 255, 0.06)',
        divider: 'rgba(255, 255, 255, 0.04)',
    },
} as const;

// Animation durations
export const TIMING = {
    fast: 120,
    normal: 180,
    slow: 240,
} as const;
