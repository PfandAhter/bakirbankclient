'use client';

import { useAuth } from '@/src/hooks/login/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAlert } from "@/src/hooks/notification/useAlert";
import { RefreshCw, ArrowUpRight, X } from 'lucide-react';

import AlertBox from "@/src/components/ui/notification/AlertBox";
import ProtectedRoute from "@/src/providers/ProtectedRoute";
import AccountCreationForm from "@/src/components/ui/transaction/AccountCreationForm";
import TransferMoneyPanel from "@/src/components/ui/transaction/TransferMoneyPanel";
import SavedRecipientShowModal from "@/src/components/ui/transaction/SavedRecipientShowModal";
import DepositMoneyPanel from "@/src/components/ui/transaction/DepositMoneyPanel";

import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransaction';
import { useInvoices } from '@/src/hooks/useInvoices';
import { useLocationData } from '@/src/hooks/useLocation';
import { useRecipients } from '@/src/hooks/useRecipients';
import { SavedRecipient, NewAccountFormState } from '@/src/types/account';

import Header from '@/src/components/ui/Header';
import ActiveAccountCard from '@/src/components/ui/transaction/ActiveAccountCard';
import QuickActions from '@/src/components/ui/transaction/QuickActions';
import TransactionHistory from '@/src/components/ui/transaction/TransactionHistory';

export default function TransactionPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { alert, showAlert } = useAlert();

    const { accounts, selectedAccount, setSelectedAccount, isLoading, createAccount, setAccounts } = useAccounts(isAuthenticated);
    const { transactions, setTransactions, fetchTransactions, page, setPage, totalPages } = useTransactions({
        selectedAccountId: selectedAccount?.id,
        showAlert
    });
    const { handleInvoiceClick, loadingInvoices } = useInvoices(showAlert, setTransactions);
    const { selectedRecipient, setSelectedRecipient, savedRecipients, fetchRecipients, loadingRecipients } = useRecipients();

    const [modals, setModals] = useState({
        transfer: false,
        deposit: false,
        accountCreation: false,
        recipientForm: false,
        accountSuccess: false
    });

    const [newAccount, setNewAccount] = useState<NewAccountFormState>({
        name: "", iban: "", currency: "TRY", description: "", city: "", district: "", branchId: "", balance: 0
    });

    const { cities, districts, branches, fetchDistricts, fetchBranches } = useLocationData(modals.accountCreation);

    useEffect(() => {
        if (isLoading) {
            const timeout = setTimeout(() => router.push("/"), 5000);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, router]);

    const toggleModal = (name: keyof typeof modals, value: boolean) => {
        setModals(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAccountSubmit = async (e: React.FormEvent, idempotencyKey: string): Promise<boolean> => {
        e.preventDefault();
        try {
            await createAccount(newAccount, idempotencyKey);
            toggleModal('accountSuccess', true);
            toggleModal('accountCreation', false);
            setNewAccount({ name: "", iban: "", currency: "TRY", description: "", city: "", district: "", branchId: "", balance: 0 });
            return true;
        } catch (error) {
            console.error(error);
            showAlert("error", "Hata", "Hesap oluşturulamadı.");
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4"/>
                    <p className="text-gray-300 text-base font-normal tracking-wide">Hesap bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0b0f] text-[#f8fafc] font-sans">
                {alert.type && (
                    <AlertBox
                        type={alert.type}
                        title={alert.title ?? ""}
                        message={alert.message ?? undefined}
                    />
                )}

                {modals.accountCreation && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <AccountCreationForm
                            onSubmit={handleCreateAccountSubmit}
                            newAccount={newAccount}
                            setNewAccount={setNewAccount}
                            cities={cities}
                            branches={branches}
                            districts={districts}
                            onCityChange={fetchDistricts}
                            onDistrictChange={fetchBranches}
                        />
                        <button onClick={() => toggleModal('accountCreation', false)} className="absolute top-4 right-4 text-white"><X className="w-6 h-6"/></button>
                    </div>
                )}

                {modals.accountSuccess && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                        <div className="bg-[#0c0d13] border border-green-600 rounded-xl p-8 text-center shadow-lg max-w-sm w-full">
                            <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center"><ArrowUpRight className="w-8 h-8 text-green-500" /></div></div>
                            <h2 className="text-2xl font-bold mb-2 text-white">Başarılı!</h2>
                            <p className="text-gray-400 mb-6">Yeni hesabınız oluşturuldu.</p>
                            <button onClick={() => toggleModal('accountSuccess', false)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg w-full font-semibold">Tamam</button>
                        </div>
                    </div>
                )}

                {modals.transfer && (
                    <TransferMoneyPanel
                        fromAccounts={accounts}
                        selectedAccount={selectedAccount}
                        selectedSavedRecipient={selectedRecipient}
                        fetchTransaction={fetchTransactions}
                        onClose={() => { toggleModal('transfer', false); setSelectedRecipient(null); }}
                        onSuccess={async () => {
                            await fetchTransactions();
                            showAlert('success', 'Transfer Başarılı', 'Para transferi tamamlandı.');
                        }}
                    />
                )}

                {modals.deposit && (
                    <DepositMoneyPanel
                        toAccount={selectedAccount}
                        onClose={() => toggleModal('deposit', false)}
                        onSuccess={async () => {
                            if(selectedAccount) {
                                const newBalance = selectedAccount.balance + 100;
                                const updatedAccounts = accounts.map(a => a.id === selectedAccount.id ? {...a, balance: newBalance} : a);
                                setAccounts(updatedAccounts);
                                setSelectedAccount({...selectedAccount, balance: newBalance});
                            }
                        }}
                    />
                )}

                <SavedRecipientShowModal
                    showRecipientForm={modals.recipientForm}
                    setShowRecipientForm={(val: boolean) => toggleModal('recipientForm', val)}
                    onRecipientSelect={(recipient: SavedRecipient) => setSelectedRecipient(recipient)}
                    setShowTransferPanel={(val: boolean) => toggleModal('transfer', val)}
                    savedRecipients={savedRecipients}
                    onRefresh={fetchRecipients}
                    isLoadingList={loadingRecipients}
                />

                <Header user={user} logout={logout} onLogoClick={() => router.push('/')} />

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <ActiveAccountCard
                        accounts={accounts}
                        selectedAccount={selectedAccount}
                        onAccountSelect={setSelectedAccount}
                        onNewAccountClick={() => toggleModal('accountCreation', true)}
                    />

                    <QuickActions
                        onTransfer={() => toggleModal('transfer', true)}
                        onDeposit={() => toggleModal('deposit', true)}
                        onRecipients={() => toggleModal('recipientForm', true)}
                    />

                    <TransactionHistory
                        transactions={transactions}
                        selectedAccount={selectedAccount}
                        loadingInvoices={loadingInvoices}
                        onInvoiceClick={handleInvoiceClick}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                </main>
            </div>
        </ProtectedRoute>
    );
}