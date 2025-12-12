import { useState, useEffect, useMemo } from 'react';
import { Atm } from '@/src/types/atm-map';

export const useAtmFilters = (atmLocations: Atm[]) => {
    const [bankOptions, setBankOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [depositOptions, setDepositOptions] = useState([]);
    const [withdrawOptions, setWithdrawOptions] = useState([]);

    const [bankNames, setBankNames] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepositStatus, setFilterDepositStatus] = useState('all');
    const [filterWithdrawStatus, setFilterWithdrawStatus] = useState('all');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const getStatusOptions = async () => {
            try {
                const response = await fetch('/api/atm/statuses');
                if (response.ok) {
                    // Backend returns ATMStatusResponse directly: { banks, statuses, depositStatuses, withdrawStatuses }
                    const data = await response.json();
                    console.log('ATM Statuses loaded:', data);
                    setBankOptions(data.banks || []);
                    setStatusOptions(data.statuses || []);
                    setWithdrawOptions(data.withdrawStatuses || []);
                    setDepositOptions(data.depositStatuses || []);
                } else {
                    console.error('Status options fetch failed:', response.status);
                }
            } catch (error) {
                console.error("Status options alınamadı:", error);
            }
        }
        getStatusOptions();
    }, []);

    const filteredAtmLocations = useMemo(() => {
        return atmLocations.filter((atm: any) => {
            const banksStatus = bankNames === 'all' || atm.name?.toUpperCase() === bankNames.toUpperCase();
            const matchesStatus = filterStatus === 'all' || atm.status?.toUpperCase() === filterStatus;
            const matchesDeposit = filterDepositStatus === 'all' || atm.depositStatus?.toUpperCase() === filterDepositStatus;
            const matchesWithdraw = filterWithdrawStatus === 'all' || atm.withdrawStatus?.toUpperCase() === filterWithdrawStatus;
            return banksStatus && matchesStatus && matchesDeposit && matchesWithdraw;
        });
    }, [atmLocations, bankNames, filterStatus, filterDepositStatus, filterWithdrawStatus]);

    return {
        bankOptions, statusOptions, depositOptions, withdrawOptions,
        bankNames, setBankNames,
        filterStatus, setFilterStatus,
        filterDepositStatus, setFilterDepositStatus,
        filterWithdrawStatus, setFilterWithdrawStatus,
        searchText, setSearchText,
        filteredAtmLocations
    };
};