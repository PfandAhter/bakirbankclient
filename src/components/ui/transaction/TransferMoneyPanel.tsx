import TransferForm from "@/src/components/ui/transaction/TransferForm";
import AlertBox from "@/src/components/ui/notification/AlertBox";
import {CheckCircle2, Send, X} from "lucide-react";
import {useAlert} from "@/src/hooks/notification/useAlert";
import {useState} from "react";
import {v4 as uuidv4} from "uuid";

import {Account, SavedRecipient} from "@/src/types/account";
import {TransferData} from "@/src/types/transaction";
import {currencySymbols} from "@/src/types/currency";
import TransferConfirmation from "@/src/components/ui/transaction/TransferConfirmation";
import {useTransfer} from "@/src/hooks/transaction/useTransfer";

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
    const {alert, showAlert} = useAlert();

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            {alert.type && (
                <AlertBox
                    type={alert.type}
                    title={alert.title ?? ""}
                    message={alert.message ?? undefined}
                />
            )}

            <div className="bg-[#0c0d13] border border-[#1e222d] rounded-2xl shadow-2xl w-full max-w-lg text-white">
                <div className="flex justify-between items-center border-b border-[#1e222d] p-6">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                            <Send className="w-5 h-5 text-white"/>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {confirmStep ? "İşlemi Onayla" : "Para Transferi"}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white hover:bg-[#1e293b] p-2 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div
                            className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-500 animate-pulse"/>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Transfer Başarılı!</h2>
                        <button
                            onClick={handleClose}
                            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold mt-4"
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
                )}
            </div>
        </div>
    );
}