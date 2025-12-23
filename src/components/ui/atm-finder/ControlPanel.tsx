'use client';

import React, { useState, memo } from 'react';
import { Atm } from '@/src/types/atm-map';

interface ControlPanelProps {
    viewTPS: boolean;
    isSendMoneyPanelOpen: boolean;
    isControlPanelDisabled: boolean;
    isControlPanelOpen: boolean;
    cancelSelectedATM: () => void;
    selectedAtm: Atm | null;
    toggle3D: () => void;
    is3D: boolean;
    animationInProgress: boolean;
    bankNames: string;
    setBankNames: (bank: string) => void;
    bankOptions: string[];
    filterStatus: string;
    setFilterStatus: (status: string) => void;
    statusOptions: string[];
    filterDepositStatus: string;
    setFilterDepositStatus: (status: string) => void;
    depositOptions: string[];
    filterWithdrawStatus: string;
    setFilterWithdrawStatus: (status: string) => void;
    withdrawOptions: string[];
    toggleQRCodePanel: () => void;
    toggleSendMoneyPanel: () => void;
    sendButtonVisibility: boolean;
}

const ControlPanel = ({
    viewTPS,
    isSendMoneyPanelOpen,
    isControlPanelOpen,
    isControlPanelDisabled,
    selectedAtm,
    toggle3D,
    is3D,
    animationInProgress,
    bankNames,
    setBankNames,
    bankOptions,
    filterStatus,
    setFilterStatus,
    cancelSelectedATM,
    statusOptions,
    filterDepositStatus,
    setFilterDepositStatus,
    depositOptions,
    filterWithdrawStatus,
    setFilterWithdrawStatus,
    withdrawOptions,
    toggleSendMoneyPanel,
    toggleQRCodePanel,
    sendButtonVisibility,
}: ControlPanelProps) => {

    const [isQrCodePanelOpen, setIsQrCodePanelOpen] = useState(false);

    if (viewTPS || isSendMoneyPanelOpen || isQrCodePanelOpen || !isControlPanelOpen) return null;

    if (!isControlPanelOpen) return null;

    // bg-gradient-to-br
    return (
        <div className={`fixed top-18 right-2 w-[350px] max-w-[90vw] max-h-screen p-6 
                        bg-[#ccccc] from-slate-800 via-slate-700 to-slate-900 
                        backdrop-blur-lg bg-opacity-95 text-white 
                        rounded-3xl shadow-2xl border border-slate-600/30
                        overflow-y-auto z-50 transition-all duration-300
                        ${isControlPanelDisabled ? 'opacity-20 pointer-events-none invisible' : ''}`}>

            {/* Header with Title and Close Button */}
            <div className="relative mb-6">
                <h2 className="text-xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400
                             bg-clip-text text-transparent pr-8">
                    ATM Harita Uygulaması
                </h2>

                <button
                    onClick={cancelSelectedATM}
                    disabled={selectedAtm === null}
                    className="absolute -top-1 -right-2 w-8 h-8 rounded-full
                             bg-red-500 hover:bg-red-600 disabled:bg-gray-400
                             disabled:opacity-0 disabled:pointer-events-none
                             text-white font-bold text-sm
                             transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                >
                    ×
                </button>
            </div>

            {/* Search Container
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Şehir veya bölge ara..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20
                             rounded-xl text-white placeholder-gray-300
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                             backdrop-blur-sm transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                />
                <button
                    onClick={searchLocation}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700
                             rounded-xl font-semibold transition-all duration-200
                             shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                    Ara
                </button>
            </div>*/}

            {/* 3D Toggle Button */}
            <button
                onClick={toggle3D}
                disabled={animationInProgress}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600
                         hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500
                         rounded-xl font-semibold transition-all duration-200
                         shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 disabled:transform-none"
            >
                {is3D ? '2D Görünüme Geç' : '3D Görünüme Geç'}
            </button>

            {/* Filters Container */}
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-4">
                    {/* Bank Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-200">Banka</label>
                        <select
                            value={bankNames}
                            onChange={(e) => setBankNames(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/10 border border-white/20
                                     rounded-lg text-white focus:outline-none focus:ring-2
                                     focus:ring-blue-400 focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-gray-800">Tümü</option>
                            {bankOptions.map((bank) => (
                                <option key={bank} value={bank} className="bg-gray-800">{bank}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-200">Durum</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/10 border border-white/20
                                     rounded-lg text-white focus:outline-none focus:ring-2
                                     focus:ring-blue-400 focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-gray-800">Tümü</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status} className="bg-gray-800">{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Deposit Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-200">Para Yatırma</label>
                        <select
                            value={filterDepositStatus}
                            onChange={(e) => setFilterDepositStatus(e.target.value)}
                            className="w-full px-2.5 py-2 bg-white/10 border border-white/20
                                     rounded-lg text-white text-sm focus:outline-none focus:ring-2
                                     focus:ring-blue-400 focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-gray-800">Tümü</option>
                            {depositOptions.map((status) => (
                                <option key={status} value={status} className="bg-gray-800">{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Withdraw Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-200">Para Çekme</label>
                        <select
                            value={filterWithdrawStatus}
                            onChange={(e) => setFilterWithdrawStatus(e.target.value)}
                            className="w-full px-2.5 py-2 bg-white/10 border border-white/20
                                     rounded-lg text-white text-sm focus:outline-none focus:ring-2
                                     focus:ring-blue-400 focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-gray-800">Tümü</option>
                            {withdrawOptions.map((status) => (
                                <option key={status} value={status} className="bg-gray-800">{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* QR Code Button - only when no ATM is selected */}
            {!selectedAtm && (
                <button
                    onClick={toggleQRCodePanel}
                    disabled={animationInProgress}
                    className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600
                             hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500
                             rounded-xl font-semibold transition-all duration-200
                             shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 disabled:transform-none"
                >
                    QR KOD
                </button>
            )}

            {/* Selected ATM Information */}
            {selectedAtm && (
                <div className="bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl p-4 mb-4
                   max-h-80 overflow-y-auto border border-white/20 shadow-inner">
                    <h3 className="font-bold text-lg mb-3 text-gray-900 border-b border-gray-200 pb-2">
                        {selectedAtm.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-semibold">Enlem:</span> {selectedAtm.latitude.toFixed(4)}</p>
                            <p><span className="font-semibold">Boylam:</span> {selectedAtm.longitude.toFixed(4)}</p>
                        </div>
                        <p><span className="font-semibold">Adres:</span> {selectedAtm.address}</p>

                        {/* Durum bilgileri alt alta dizildi */}
                        <div className="space-y-2">
                            <p><span className="font-semibold">Durum:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium
                                  ${selectedAtm.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {selectedAtm.status}
                                </span>
                            </p>
                            <p><span className="font-semibold">Yatırma:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium
                                  ${selectedAtm.depositStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {selectedAtm.depositStatus}
                                </span>
                            </p>
                            <p><span className="font-semibold">Çekme:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium
                                  ${selectedAtm.withdrawStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {selectedAtm.withdrawStatus}
                                </span>
                            </p>
                        </div>

                        {selectedAtm.supportedBanks && selectedAtm.supportedBanks.length > 0 && (
                            <div>
                                <p className="font-semibold mb-2">Desteklenen Bankalar:</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedAtm.supportedBanks.map((bank) => (
                                        <span key={bank.id} className="px-2 py-1 bg-blue-100 text-blue-800
                                                         rounded-full text-xs font-medium">
                                            {bank.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedAtm.isUserCreated && (
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-amber-800 text-sm italic font-medium">
                                    Bu ATM sizin tarafınızdan oluşturuldu
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Send Money Button - only when ATM is selected */}
            {selectedAtm && (
                <button
                    onClick={toggleSendMoneyPanel}
                    disabled={!sendButtonVisibility}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600
             hover:from-green-600 hover:to-emerald-700
             disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
             rounded-xl font-bold text-lg transition-all duration-200
             shadow-lg hover:shadow-green-500/25
             ${sendButtonVisibility ? 'transform hover:scale-105' : 'transform-none'}
             disabled:opacity-50`}
                    style={{
                        opacity: sendButtonVisibility ? 1 : 0.5,
                    }}
                >
                    Para Gönder
                </button>
            )}
        </div>
    );
};

export default ControlPanel;