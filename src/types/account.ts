export interface SavedRecipient {
    id: string;
    nickname: string;
    accountIBAN: string;
    firstName: string;
    secondName?: string;
    lastName: string;
}

export interface Account {
    id: string;
    name: string;
    currency: string;
    iban: string;
    balance: number;
}

export interface AccountData {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsGoal: number;
    currentSavings: number;
}

export interface NewAccountFormState {
    name: string;
    iban: string;
    currency: string;
    description: string;
    city: string;
    district: string;
    branchId: string;
    balance: number;
}