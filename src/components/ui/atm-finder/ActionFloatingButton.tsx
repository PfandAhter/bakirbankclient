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
              fixed bottom-10 left-1/2 -translate-x-1/2
              px-6 py-3 w-72 h-14
              text-white text-lg font-semibold
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
            <div className="flex items-center justify-center hover:scale-105">
                {isCalculating
                    ? 'Hesaplanıyor...'
                    : animationInProgress
                        ? `Rota Gösteriliyor (${Math.round(animationProgress * 100)}%)`
                        : 'Animasyonu Başlat'}
            </div>
        </button>
    );
};