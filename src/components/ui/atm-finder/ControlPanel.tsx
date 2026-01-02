'use client';

import React, { useState, memo } from 'react';
import { Atm } from '@/src/types/atm-map';
import { MapPin, Send, QrCode, Sparkles } from 'lucide-react';

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

    return (
        <div className={`fixed top-16 sm:top-18 right-2 sm:right-2 w-[280px] sm:w-[320px] lg:w-[350px] max-w-[90vw] max-h-[80vh] sm:max-h-screen p-4 sm:p-5 lg:p-6 
                        bg-[#0f1015]/95 backdrop-blur-xl
                        text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#740001]/40
                        overflow-y-auto z-50 transition-all duration-300
                        ${isControlPanelDisabled ? 'opacity-20 pointer-events-none invisible' : ''}`}>

            {/* Header with Title and Close Button */}
            <div className="relative mb-6">
                <h2 className="text-xl font-bold text-center text-[#D3A625] pr-8 flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-[#740001]" />
                    ATM Harita Uygulaması
                </h2>

                <button
                    onClick={cancelSelectedATM}
                    disabled={selectedAtm === null}
                    className="absolute -top-1 -right-2 w-8 h-8 rounded-full
                             bg-[#740001] hover:bg-[#8B1A1A] disabled:bg-gray-600
                             disabled:opacity-0 disabled:pointer-events-none
                             text-[#D3A625] font-bold text-sm
                             transition-all duration-200 shadow-lg border border-[#D3A625]/30"
                >
                    ×
                </button>
            </div>

            {/* 3D Toggle Button */}
            <button
                onClick={toggle3D}
                disabled={animationInProgress}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-[#740001] to-[#8B1A1A]
                         hover:from-[#8B1A1A] hover:to-[#9f2020] disabled:from-gray-500 disabled:to-gray-600
                         rounded-xl font-semibold transition-all duration-200
                         shadow-lg hover:shadow-[#740001]/25 transform hover:scale-105 disabled:transform-none
                         border border-[#D3A625]/20"
            >
                {is3D ? '2D Görünüme Geç' : '3D Görünüme Geç'}
            </button>

            {/* Filters Container */}
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-4">
                    {/* Bank Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#D3A625]">Banka</label>
                        <select
                            value={bankNames}
                            onChange={(e) => setBankNames(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#12131a] border border-[#740001]/40
                                     rounded-lg text-white focus:outline-none focus:ring-2
                                     focus:ring-[#D3A625] focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-[#0a0b0f]">Tümü</option>
                            {bankOptions.map((bank) => (
                                <option key={bank} value={bank} className="bg-[#0a0b0f]">{bank}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#D3A625]">Durum</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#12131a] border border-[#740001]/40
                                     rounded-lg text-white focus:outline-none focus:ring-2
                                     focus:ring-[#D3A625] focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-[#0a0b0f]">Tümü</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status} className="bg-[#0a0b0f]">{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Deposit Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#D3A625]">Para Yatırma</label>
                        <select
                            value={filterDepositStatus}
                            onChange={(e) => setFilterDepositStatus(e.target.value)}
                            className="w-full px-2.5 py-2 bg-[#12131a] border border-[#740001]/40
                                     rounded-lg text-white text-sm focus:outline-none focus:ring-2
                                     focus:ring-[#D3A625] focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-[#0a0b0f]">Tümü</option>
                            {depositOptions.map((status) => (
                                <option key={status} value={status} className="bg-[#0a0b0f]">{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Withdraw Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#D3A625]">Para Çekme</label>
                        <select
                            value={filterWithdrawStatus}
                            onChange={(e) => setFilterWithdrawStatus(e.target.value)}
                            className="w-full px-2.5 py-2 bg-[#12131a] border border-[#740001]/40
                                     rounded-lg text-white text-sm focus:outline-none focus:ring-2
                                     focus:ring-[#D3A625] focus:border-transparent
                                     backdrop-blur-sm transition-all duration-200"
                        >
                            <option value="all" className="bg-[#0a0b0f]">Tümü</option>
                            {withdrawOptions.map((status) => (
                                <option key={status} value={status} className="bg-[#0a0b0f]">{status}</option>
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
                    className="w-full mb-4 px-4 py-3 bg-[#12131a]
                             hover:bg-[#740001]/30 disabled:bg-gray-600
                             rounded-xl font-semibold transition-all duration-200
                             shadow-lg border border-[#D3A625]/30 text-[#D3A625]
                             flex items-center justify-center gap-2"
                >
                    <QrCode className="w-5 h-5" />
                    QR KOD
                </button>
            )}

            {/* Selected ATM Information */}
            {selectedAtm && (
                <div className="bg-[#12131a] backdrop-blur-sm text-white rounded-xl p-4 mb-4
                   max-h-80 overflow-y-auto border border-[#740001]/40 shadow-inner">
                    <h3 className="font-bold text-lg mb-3 text-[#D3A625] border-b border-[#740001]/30 pb-2">
                        {selectedAtm.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-semibold text-[#D3A625]">Enlem:</span> {selectedAtm.latitude.toFixed(4)}</p>
                            <p><span className="font-semibold text-[#D3A625]">Boylam:</span> {selectedAtm.longitude.toFixed(4)}</p>
                        </div>
                        <p><span className="font-semibold text-[#D3A625]">Adres:</span> {selectedAtm.address}</p>

                        {/* Durum bilgileri */}
                        <div className="space-y-2">
                            <p><span className="font-semibold text-[#D3A625]">Durum:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium
                                  ${selectedAtm.status === 'ACTIVE' ? 'bg-[#D3A625]/20 text-[#D3A625]' : 'bg-[#740001]/20 text-[#740001]'}`}>
                                    {selectedAtm.status}
                                </span>
                            </p>
                            <p><span className="font-semibold text-[#D3A625]">Yatırma:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium
                                  ${selectedAtm.depositStatus === 'ACTIVE' ? 'bg-[#D3A625]/20 text-[#D3A625]' : 'bg-[#740001]/20 text-[#740001]'}`}>
                                    {selectedAtm.depositStatus}
                                </span>
                            </p>
                            <p><span className="font-semibold text-[#D3A625]">Çekme:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium
                                  ${selectedAtm.withdrawStatus === 'ACTIVE' ? 'bg-[#D3A625]/20 text-[#D3A625]' : 'bg-[#740001]/20 text-[#740001]'}`}>
                                    {selectedAtm.withdrawStatus}
                                </span>
                            </p>
                        </div>

                        {selectedAtm.supportedBanks && selectedAtm.supportedBanks.length > 0 && (
                            <div>
                                <p className="font-semibold mb-2 text-[#D3A625]">Desteklenen Bankalar:</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedAtm.supportedBanks.map((bank) => (
                                        <span key={bank.id} className="px-2 py-1 bg-[#740001]/30 text-[#D3A625]
                                                         rounded-full text-xs font-medium border border-[#D3A625]/20">
                                            {bank.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedAtm.isUserCreated && (
                            <div className="mt-3 p-2 bg-[#D3A625]/10 border border-[#D3A625]/30 rounded-lg">
                                <p className="text-[#D3A625] text-sm italic font-medium">
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
                    className={`w-full px-6 py-4 bg-gradient-to-r from-[#D3A625] to-[#EEBA30]
             hover:from-[#EEBA30] hover:to-[#D3A625]
             disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed
             rounded-xl font-bold text-lg text-[#0a0b0f] transition-all duration-200
             shadow-lg hover:shadow-[#D3A625]/25
             ${sendButtonVisibility ? 'transform hover:scale-105' : 'transform-none'}
             disabled:opacity-50 flex items-center justify-center gap-2`}
                    style={{
                        opacity: sendButtonVisibility ? 1 : 0.5,
                    }}
                >
                    <Send className="w-5 h-5" />
                    Para Gönder
                </button>
            )}
        </div>
    );
};

export default ControlPanel;