// src/components/chat/renderers/NearestAtmInfo.tsx
'use client';

import React from 'react';
import { MapPin, Building2, Navigation } from 'lucide-react';

interface NearestAtmData {
    selectedAtmId: string;
    bankName: string;
    selectedAtmLatitude: string;
    selectedAtmLongitude: string;
    userLatitude: string;
    userLongitude: string;
}

interface NearestAtmInfoProps {
    atm: NearestAtmData;
    onShowOnMap?: (atm: NearestAtmData) => void;
}

export const NearestAtmInfo: React.FC<NearestAtmInfoProps> = ({ atm, onShowOnMap }) => {
    const handleOpenInMaps = () => {
        const url = `https://www.google.com/maps/dir/${atm.userLatitude},${atm.userLongitude}/${atm.selectedAtmLatitude},${atm.selectedAtmLongitude}`;
        window.open(url, '_blank');
    };

    return (
        <div className="w-full mt-2 rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
            <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-emerald-500/10">
                <MapPin size={16} className="text-emerald-400" />
                <span className="text-sm font-medium text-slate-50">En Yakın ATM</span>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <Building2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg text-slate-50">{atm.bankName}</span>
                        <span className="text-xs text-white/50">ATM</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleOpenInMaps}
                        className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                        <Navigation size={16} />
                        <span className="text-sm font-medium">Yol Tarifi Al</span>
                    </button>

                    {onShowOnMap && (
                        <button
                            onClick={() => onShowOnMap(atm)}
                            className="flex-1 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                            <MapPin size={16} />
                            <span className="text-sm font-medium">Haritada Göster</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
