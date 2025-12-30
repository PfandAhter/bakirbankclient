'use client';

interface ActionButtonProps {
    isCalculating: boolean;
    animationInProgress: boolean;
    animationProgress: number;
    onClick: () => void;
}

export const ActionFloatingButton = ({
    isCalculating,
    animationInProgress,
    animationProgress,
    onClick
}: ActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={isCalculating}
            className={`
              fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2
              px-4 sm:px-6 py-2.5 sm:py-3 w-56 sm:w-64 lg:w-72 h-12 sm:h-14
              text-white text-sm sm:text-base lg:text-lg font-semibold
              rounded-full shadow-lg z-[1000]
              ${animationInProgress ? '' : 'bg-[#082c30] hover:bg-black'}
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
            `}
            style={{
                background: animationInProgress
                    ? `linear-gradient(to right, #4CAF50 ${animationProgress * 100}%, #cccccc ${animationProgress * 100}%)`
                    : undefined,
            }}
        >
            <div className="flex items-center justify-center hover:scale-105 text-center">
                {isCalculating
                    ? 'Hesaplanıyor...'
                    : animationInProgress
                        ? `Rota (${Math.round(animationProgress * 100)}%)`
                        : 'Animasyonu Başlat'}
            </div>
        </button>
    );
};