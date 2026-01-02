import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Gryffindor Theme Colors - Softer Banking Palette
                gryffindor: {
                    burgundy: '#740001',      // Deep burgundy (primary)
                    maroon: '#8B1A1A',        // Softer maroon
                    wine: '#5C0001',          // Dark wine
                    gold: '#D3A625',          // Classic gold (accent)
                    lightGold: '#EEBA30',     // Light gold
                    cream: '#DAA520',         // Goldenrod cream
                },
                banking: {
                    dark: '#0a0b0f',          // Deep background
                    card: '#0f1015',          // Card background
                    border: '#1e1f26',        // Subtle borders
                    text: '#f8fafc',          // Primary text
                    muted: '#9ca3af',         // Muted text
                },
            },
            keyframes: {
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(116, 0, 1, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(116, 0, 1, 0.5)' },
                },
                'gold-shimmer': {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
            },
            animation: {
                'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
                'gold-shimmer': 'gold-shimmer 3s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}

export default config