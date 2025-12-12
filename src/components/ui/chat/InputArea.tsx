// src/components/chat/InputArea.tsx
'use client';

import React, { useState, KeyboardEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import {Loader2, MapPin, Send} from 'lucide-react';
import { InputAttachment } from '@/src/types/chat';
import { AttachmentChip } from '@/src/components/ui/chat/AttachmentChip';

interface InputAreaProps {
    attachments: InputAttachment[];
    onRemoveAttachment: (id: string) => void;
    onAddAttachment: (attachment: InputAttachment) => void;
    onSendMessage: (text: string, attachments: InputAttachment[]) => void;
    disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
                                                        attachments,
                                                        onRemoveAttachment,
                                                        onAddAttachment,
                                                        onSendMessage,
                                                        disabled
                                                    }) => {
    const [input, setInput] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const canSend = (input.trim() || attachments.length > 0) && !disabled;
    const hasLocationAttachment = attachments.some(a => a.type === 'location');

    const handleSend = () => {
        if (canSend) {
            onSendMessage(input.trim(), attachments);
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleGetLocation = () => {
        if (isGettingLocation || hasLocationAttachment) return;

        if (!navigator.geolocation) {
            alert('Tarayıcınız konum servisini desteklemiyor.');
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                const attachment: InputAttachment = {
                    id: `att-loc-${Date.now()}`,
                    type: 'location',
                    label: `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                    contextText: `My current location is latitude: ${latitude}, longitude: ${longitude}`,
                    data: { latitude, longitude }
                };

                onAddAttachment(attachment);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                let message = 'Konum alınamadı.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
                }
                alert(message);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="p-4 bg-black/30 border-t border-white/[0.08]">
            {/* Attachment Chips */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 px-1">
                    <AnimatePresence mode="popLayout">
                        {attachments.map(attachment => (
                            <AttachmentChip
                                key={attachment.id}
                                attachment={attachment}
                                onRemove={onRemoveAttachment}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Input Field */}
            <div className="flex gap-2 items-center bg-white/[0.08] rounded-[14px] p-1.5 border border-white/10 transition-all duration-200 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]">
                {/* Location Button */}
                <button
                    onClick={handleGetLocation}
                    disabled={disabled || isGettingLocation || hasLocationAttachment}
                    className="w-9 h-9 rounded-lg border-none bg-transparent text-white/50 cursor-pointer flex items-center justify-center transition-all duration-200 hover:enabled:bg-white/10 hover:enabled:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={hasLocationAttachment ? 'Konum zaten eklendi' : 'Konum paylaş'}
                >
                    {isGettingLocation ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <MapPin size={18} />
                    )}
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={attachments.length > 0
                        ? "Mesajınızı yazın veya Enter'a basın..."
                        : "Type your message..."}
                    disabled={disabled}
                    className="flex-1 bg-transparent border-none text-slate-50 py-2.5 px-3 text-[0.9375rem] outline-none placeholder:text-white/40"
                />
                <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="w-11 h-11 rounded-xl border-none bg-gradient-to-br from-indigo-500 to-purple-500 text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:enabled:scale-105 hover:enabled:shadow-[0_4px_12px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
