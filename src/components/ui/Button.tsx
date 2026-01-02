import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'google';
    size?: 'sm' | 'md' | 'lg' | 'login';
    loading?: boolean;
    ringThickness?: '0' | '1' | '2' | '4'; // thickness options
    ringColor?: string; // custom ring color
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    ringThickness = '2',
    ringColor,
    children,
    className = '',
    ...props
}) => {
    const baseClasses =
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none';

    // Add ring thickness and offset
    const focusRing = `focus:ring-${ringThickness} focus:ring-offset-1`;

    const variants = {
        primary: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-${ringColor || 'blue-500'} shadow-lg hover:shadow-xl`,
        secondary: `bg-gray-600 text-white hover:bg-gray-700 focus:ring-${ringColor || 'gray-500'}`,
        outline: `border-2 border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 focus:ring-${ringColor || 'blue-500'}`,
        ghost: `text-gray-700 hover:bg-gray-100 focus:ring-${ringColor || 'gray-500'}`,
        destructive: `bg-red-600 text-white shadow-lg hover:bg-red-700 focus:ring-${ringColor || 'red-500'}`,
        google: `w-full flex items-center justify-center px-4 py-3 border border-gray-600 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 focus:ring-${ringColor || 'gray-400'}`,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        login: 'px-4 py-3 text-sm w-full flex items-center justify-center',
    };

    return (
        <button
            className={`${baseClasses} ${focusRing} ${variants[variant]} ${sizes[size]} ${loading ? 'opacity-70 cursor-not-allowed' : ''
                } ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#D3A625]" />
            )}
            {children}
        </button>
    );
};