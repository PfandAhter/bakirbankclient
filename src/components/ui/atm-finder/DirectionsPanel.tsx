"use client";

import React from "react";

interface Step {
    name?: string;
    distance: number;
    duration: number;
}

interface DirectionsPanelProps {
    steps: Step[];
    isDirectionsPanelOpen?: boolean;
}

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ steps, isDirectionsPanelOpen }) => {
    if (!steps || steps.length === 0) return null;

    if (!isDirectionsPanelOpen) return null;

    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const totalDistance = steps.reduce((acc, step) => acc + step.distance, 0);

    return (
        <div
            className="
        absolute bottom-16 sm:bottom-20 left-2 sm:left-5 z-[1000] 
        h-[300px] sm:h-[350px] lg:h-[400px] 
        w-[calc(100vw-16px)] sm:w-[320px] lg:w-[370px] max-w-[370px]
        rounded-xl sm:rounded-2xl bg-[#0f1015]/90 p-3 sm:p-4 lg:p-5 shadow-xl
        backdrop-blur-md border border-[#740001]/40
        transition-all duration-300 ease-out

        font-sans
        scrollbar-thin scrollbar-thumb-[#740001] scrollbar-track-[#12131a]
        hover:scrollbar-thumb-[#8B1A1A]
        hidden sm:block
      "
        >
            <h3 className="mb-1 text-sm sm:text-base font-semibold text-[#D3A625] flex items-center gap-2">
                <span className="text-lg">🧭</span> Rota Adımları
            </h3>
            <h2 className="text-xs sm:text-sm font-medium text-gray-300">
                Tahmini Süre: <span className="text-[#D3A625]">{Math.floor(totalDuration / 60)} dk {Math.round(totalDuration % 60)} sn</span>
            </h2>
            <h2 className="text-xs sm:text-sm font-medium text-gray-300">
                Tahmini Mesafe: <span className="text-[#D3A625]">{Math.round(totalDistance)} m</span>
            </h2>

            <ol className="custom-scrollbar mt-3 sm:mt-5 flex flex-col gap-2 sm:gap-2.5 list-none p-0 overflow-y-auto max-h-[180px] sm:max-h-[220px] lg:max-h-[250px] pr-1">
                {steps.map((step, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-2.5 rounded-lg bg-[#12131a] border border-[#740001]/20 p-2.5 transition-colors duration-300 hover:bg-[#740001]/10"
                    >
                        <span className="mt-0.5 text-lg opacity-80">➡️</span>
                        <div>
                            <div className="text-sm font-medium text-white/90">
                                {step.name || "İsimsiz Cadde"}
                            </div>
                            <div className="text-xs text-gray-500">
                                {Math.round(step.distance)} m – {Math.round(step.duration)} sn
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default DirectionsPanel;
