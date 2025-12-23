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

    if(!isDirectionsPanelOpen) return null;

    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const totalDistance = steps.reduce((acc, step) => acc + step.distance, 0);
//#0a3d42 ccccc bg-black/30 overflow-y-auto max-h-[400px] mt-5 flex flex-col gap-2.5
    return (
        <div
            className="
        absolute bottom-20 left-5 z-[1000] h-[400px] w-[370px] max-w-[370px]
        rounded-2xl bg-[#ccccc] p-5 shadow-xl bg-black/50
        backdrop-blur-md border border-white/20
        transition-all duration-300 ease-out

        font-sans
        scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-[#ccccc]
        hover:scrollbar-thumb-gray-500
      "
        >
            <h3 className="mb-1 text-base font-semibold text-white">
                🧭 Rota Adımları
            </h3>
            <h2 className="text-sm font-medium text-gray-300">
                Tahmini Süre: {Math.floor(totalDuration / 60)} dk {Math.round(totalDuration % 60)} sn
            </h2>
            <h2 className="text-sm font-medium text-gray-300">
                Tahmini Mesafe: {Math.round(totalDistance)} m
            </h2>

            <ol className="custom-scrollbar mt-5 flex flex-col gap-2.5 list-none p-0 overflow-y-auto max-h-[250px]">
                {steps.map((step, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-2.5 rounded-lg bg-gray-50 p-2.5 transition-colors duration-300 hover:bg-gray-100"
                    >
                        <span className="mt-0.5 text-lg">➡️</span>
                        <div>
                            <div className="text-sm font-medium text-gray-900">
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
