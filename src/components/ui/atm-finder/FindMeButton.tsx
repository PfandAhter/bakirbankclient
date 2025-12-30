'use client';

import { Crosshair, Navigation } from 'lucide-react';

interface FindMeButtonProps {
    onClick: () => void;
    disabled?: boolean;
    hasUserPosition: boolean;
}

export const FindMeButton = ({ onClick, disabled = false, hasUserPosition }: FindMeButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || !hasUserPosition}
            title={hasUserPosition ? "Konumuma Git" : "Konum alınamadı"}
            className={`
                w-11 h-11 sm:w-14 sm:h-14 rounded-full 
                bg-white/90 backdrop-blur-md border border-gray-200
                flex items-center justify-center
                transition-all duration-300 ease-out
                shadow-lg hover:shadow-xl
                ${disabled || !hasUserPosition
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-500 hover:border-blue-500 hover:scale-105 cursor-pointer group'
                }
            `}
        >
            <Navigation
                className={`
                    w-5 h-5 sm:w-6 sm:h-6 
                    text-blue-600 
                    transition-all duration-300
                    ${!disabled && hasUserPosition ? 'group-hover:text-white group-hover:rotate-45' : ''}
                `}
            />
        </button>
    );
};

export default FindMeButton;
