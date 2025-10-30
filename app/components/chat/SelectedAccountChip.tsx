import {useState} from 'react';

interface SelectedAccountChipProps {
    accounts: { id: string; name: string }[];
    onRemove: (id: string) => void;
}

export const SelectedAccountChip: React.FC<SelectedAccountChipProps> = ({
                                                                            accounts,
                                                                            onRemove
                                                                        }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (accounts.length === 0) return null;

    return (
        <div className="relative">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="
                    flex 
                    items-center 
                    gap-1 
                    px-2 
                    py-0.5 
                    rounded-full 
                    bg-gradient-to-r 
                    from-purple-500 
                    to-indigo-600 
                    text-white 
                    text-xs 
                    shadow-sm 
                    whitespace-nowrap
                    cursor-pointer
                    hover:opacity-90
                "
            >
                <span className="text-xl">
                    📎{accounts.length}
                </span>
                <span className="ml-1">
                    {isExpanded ? '▲' : '▶' }
                </span>
            </div>

            {isExpanded && (
                <div className="
                    absolute 
                    bottom-full
                    right-0
                    left-0
                    mb-1
                    z-10 
                    bg-white 
                    rounded-lg 
                    shadow-lg 
                    border 
                    border-gray-200 
                    py-1
                    min-w-[200px]
                ">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="
                                flex 
                                items-center 
                                justify-between 
                                px-3 
                                py-1.5 
                                hover:bg-gray-50
                                cursor-default
                            "
                        >
                            <span className="text-sm text-gray-700">
                                💳 {account.name}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(account.id);
                                }}
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-400 
                                    hover:text-gray-600 
                                    hover:bg-gray-100 
                                    rounded-full 
                                    p-1
                                "
                                title="Kaldır"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};