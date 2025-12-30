import { useState } from "react";

export const useFilters = () => {
    const [bankOptions, setBankOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [depositOptions, setDepositOptions] = useState([]);
    const [withdrawOptions, setWithdrawOptions] = useState([]);

    const [bankNames, setBankNames] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDepositStatus, setFilterDepositStatus] = useState("all");
    const [filterWithdrawStatus, setFilterWithdrawStatus] = useState("all");

    return {
        bankOptions, setBankOptions,
        statusOptions, setStatusOptions,
        depositOptions, setDepositOptions,
        withdrawOptions, setWithdrawOptions,
        bankNames, setBankNames,
        filterStatus, setFilterStatus,
        filterDepositStatus, setFilterDepositStatus,
        filterWithdrawStatus, setFilterWithdrawStatus
    };
};