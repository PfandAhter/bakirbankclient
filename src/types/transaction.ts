import { InvoiceStatus } from '@/src/types/invoice';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    description: string;
    date: string;
    category: string;
    channel: string;
    status: string;
    invoiceStatus?: InvoiceStatus;
}

export interface TransferData {
    fromIBAN?: string;
    toIBAN: string;
    amount: string;
    description: string;
    toFirstName?: string;
    toSecondName?: string;
    toLastName?: string;
}