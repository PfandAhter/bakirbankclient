'use client';

import {useState, useRef, useEffect} from 'react';

interface RouteTypeSelectorProps {
    selectedRouteType: string;
    onRouteTypeChange: (type: string) => void;
    disabled?: boolean;
}

const RouteTypeSelector = ({selectedRouteType, onRouteTypeChange, disabled = false}: RouteTypeSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const routeTypes = [
        {value: 'walking', label: 'Yürüyerek', emoji: '🚶'},
        {value: 'cycling', label: 'Bisiklet', emoji: '🚴'},
        {value: 'driving', label: 'Araba', emoji: '🚗'}
    ];

    const currentType = routeTypes.find(type => type.value === selectedRouteType) || routeTypes[0];
    const filteredTypes = routeTypes.filter((type) => type.value !== selectedRouteType);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (type: string) => {
        onRouteTypeChange(type);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-14 h-14 rounded-full 
                    bg-[#ccccc] backdrop-blur-md border border-white/20
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-black/90 hover:border-white/30 hover:scale-105 cursor-pointer'
                }
                    ${isOpen ? 'bg-black/90 border-white/40 scale-105' : ''}
                    shadow-lg hover:shadow-xl
                    relative z-20
                `}
                title={`Rota Tipi: ${currentType.label}`}
            >
                <span
                    className={`text-2xl transition-transform duration-300 ${
                        isOpen ? 'rotate-12 scale-110' : ''
                    }`}
                >
                    {currentType.emoji}
                </span>
            </button>

            <div
                className={`
                    absolute top-2 right-0 
                    transition-all duration-500 ease-out
                    ${isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-4 pointer-events-none'
                }
                `}
            >
                <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-xl overflow-hidden">
                    <div className="pt-12"> {/* Ana butonun altında boşluk bırak */}
                        {filteredTypes.map((type, index) => (
                            <button
                                key={type.value}
                                onClick={() => handleOptionClick(type.value)}
                                className={`
                                    w-14 h-14 flex items-center justify-center text-2xl text-white/90
                                    transition-all duration-300 ease-out
                                    hover:bg-white/20 hover:text-white hover:scale-110
                                    transform
                                    ${isOpen
                                    ? 'translate-y-0 opacity-100'
                                    : `translate-y-${(index + 1) * -8} opacity-0`
                                }
                                `}
                                style={{
                                    transitionDelay: isOpen ? `${index * 100}ms` : '0ms'
                                }}
                            >
                                <span className="transition-transform duration-200 hover:rotate-12">
                                    {type.emoji}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteTypeSelector;