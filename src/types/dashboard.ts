export interface Transaction {
    id: string;
    accountId: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    date: string;
    category: string;
    channel: string;
    status: string;
    invoiceStatus?: 'PENDING' | 'COMPLETED' | null;
}

export interface Account {
    id: string;
    name: string;
    currency: string;
    iban: string;
    balance: number;
}

export type FilterDate = 'ALL' | 'WEEK' | 'MONTH';
export type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';