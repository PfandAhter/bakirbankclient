'use client';

import React from 'react';

interface ATMButtonProps {
    label: string;
    icon?: React.ReactNode;
    position: 'left' | 'right';
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
}

export const ATMButton: React.FC<ATMButtonProps> = ({
    label,
    icon,
    position,
    onClick,
    disabled = false,
    active = false
}) => {
    const isLeft = position === 'left';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                group relative flex items-center gap-2 w-full py-3 px-4
                transition-all duration-300 ease-out
                ${isLeft ? 'flex-row-reverse text-left' : 'flex-row text-right'}
                ${disabled
                    ? 'opacity-40 cursor-not-allowed bg-zinc-800/50'
                    : active
                        ? 'bg-gradient-to-r from-gryffindor-burgundy to-gryffindor-maroon hover:from-gryffindor-maroon hover:to-gryffindor-burgundy shadow-lg shadow-gryffindor-burgundy/30'
                        : 'bg-zinc-800/80 hover:bg-zinc-700/80'
                }
                border border-zinc-600/50
                ${isLeft ? 'rounded-r-lg border-l-0' : 'rounded-l-lg border-r-0'}
            `}
        >
            {/* Connector line to screen */}
            <div className={`
                absolute top-1/2 -translate-y-1/2 w-3 h-0.5
                ${disabled ? 'bg-zinc-600' : active ? 'bg-gryffindor-gold' : 'bg-zinc-500'}
                ${isLeft ? '-right-3' : '-left-3'}
            `} />

            {/* Icon */}
            {icon && (
                <span className={`
                    text-xl transition-transform duration-300
                    ${!disabled && 'group-hover:scale-110'}
                    ${active ? 'text-gryffindor-gold' : 'text-zinc-300'}
                `}>
                    {icon}
                </span>
            )}

            {/* Label */}
            <span className={`
                text-sm font-medium flex-1 transition-colors duration-300
                ${active ? 'text-white' : disabled ? 'text-zinc-500' : 'text-zinc-300 group-hover:text-white'}
            `}>
                {label}
            </span>

            {/* Active indicator */}
            {active && !disabled && (
                <div className={`
                    absolute top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full
                    bg-gryffindor-gold shadow-lg shadow-gryffindor-gold/50
                    ${isLeft ? 'left-0' : 'right-0'}
                `} />
            )}
        </button>
    );
};

export default ATMButton;
