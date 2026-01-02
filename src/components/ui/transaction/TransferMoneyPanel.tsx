
import TransferForm from "@/src/components/ui/transaction/TransferForm";
import AlertBox from "@/src/components/ui/notification/AlertBox";
import { CheckCircle2, Send, X, Shield, Sparkles } from "lucide-react";
import { useAlert } from "@/src/hooks/notification/useAlert";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Account, SavedRecipient } from "@/src/types/account";
import { TransferData } from "@/src/types/transaction";
import { currencySymbols } from "@/src/types/currency";
import TransferConfirmation from "@/src/components/ui/transaction/TransferConfirmation";
import { useTransfer } from "@/src/hooks/transaction/useTransfer";

interface TransferMoneyPanelProps {
    fromAccounts: Account[];
    selectedAccount?: Account;
    selectedSavedRecipient?: SavedRecipient | null;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    fetchTransaction: () => Promise<void>;
}

export default function TransferMoneyPanel({
    fromAccounts,
    selectedAccount,
    selectedSavedRecipient,
    onClose,
    onSuccess,
    fetchTransaction,
}: TransferMoneyPanelProps) {
    const { alert, showAlert } = useAlert();

    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

    const [transferData, setTransferData] = useState<TransferData | null>(null);

    const {
        loading,
        success,
        confirmStep,
        setConfirmStep,
        validateTransfer,
        confirmTransfer,
    } = useTransfer({
        showAlert,
        onSuccess,
        fetchTransaction,
        idempotencyKey,
    });

    const handleFormSubmit = async (data: TransferData) => {
        setTransferData(data);
        await validateTransfer(data);
    };

    const handleFinalTransfer = async () => {
        if (!transferData) return;
        await confirmTransfer(transferData);
    };

    const handleBack = () => {
        setConfirmStep(false);
        setIdempotencyKey(uuidv4());
    };

    const handleClose = () => {
        onClose();
        setIdempotencyKey(uuidv4());
    };

    const currentAccount = transferData
        ? fromAccounts.find((a) => a.iban === transferData.fromIBAN)
        : selectedAccount;

    const getInitialData = () => {
        if (!selectedSavedRecipient) return undefined;
        return {
            accountIBAN: selectedSavedRecipient.accountIBAN,
            firstName: selectedSavedRecipient.firstName,
            secondName: selectedSavedRecipient.secondName,
            lastName: selectedSavedRecipient.lastName,
        };
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            {alert.type && (
                <AlertBox
                    type={alert.type}
                    title={alert.title ?? ""}
                    message={typeof alert.message === 'string' ? alert.message : undefined}
                />
            )}

            <div className="bg-[#0f1015] border border-[#740001]/30 rounded-2xl shadow-2xl w-full max-w-lg text-white">
                <div className="flex justify-between items-center border-b border-[#D3A625]/20 p-6 bg-gradient-to-r from-[#740001] to-[#8B1A1A] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-10 h-10 bg-[#0f1015]/30 rounded-lg flex items-center justify-center shadow-lg border border-[#D3A625]/30">
                            <Send className="w-5 h-5 text-[#D3A625]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                {confirmStep ? "İşlemi Onayla" : "Para Transferi"}
                                <Sparkles className="w-4 h-4 text-[#D3A625]" />
                            </h2>
                            <p className="text-xs text-[#D3A625]/80">Güvenli para transferi işlemi</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white hover:bg-[#740001] p-2 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center bg-[#0f1015]">
                        <div
                            className="w-20 h-20 bg-[#2e7d32]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2e7d32]/50">
                            <CheckCircle2 className="w-12 h-12 text-[#4caf50] animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">Transfer Başarılı!</h2>
                        <p className="text-gray-400 mb-6 text-sm">İşleminiz başarıyla gerçekleştirildi.</p>
                        <button
                            onClick={handleClose}
                            className="bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white px-8 py-3 rounded-xl font-bold mt-4 shadow-lg border border-[#4caf50]/30 transition-all transform hover:scale-105"
                        >
                            Tamam
                        </button>
                    </div>
                ) : confirmStep && transferData ? (
                    <TransferConfirmation
                        amount={transferData.amount}
                        currencySymbol={currencySymbols[currentAccount?.currency || "TRY"]}
                        fromAccountName={currentAccount?.name}
                        recipientName={`${transferData.toFirstName || ""} ${transferData.toLastName || ""}`.trim()}
                        toIban={transferData.toIBAN}
                        description={transferData.description}
                        loading={loading}
                        onBack={handleBack}
                        onConfirm={handleFinalTransfer}
                    />
                ) : (
                    <div className="bg-[#0f1015] p-1">
                        <TransferForm
                            fromAccounts={fromAccounts}
                            selectedAccount={selectedAccount}
                            initialData={getInitialData()}
                            currencySymbols={currencySymbols}
                            isLoading={loading}
                            onSubmit={handleFormSubmit}
                            onClose={handleClose}
                            showAlert={showAlert}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}