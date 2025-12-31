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
    invoiceId: string;
    receiverIBAN: string;
    receiverFullName: string;
    receiverTCKN?: string;
    receiverFirstName: string;
    receiverSecondName?: string;
    receiverLastName: string;
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

export interface TransferMoneyATMRequest {
    atmId: string;
    senderIban: string;
    senderFirstName: string;
    senderSecondName?: string;
    senderLastName: string;
    receiverIban?: string;
    receiverTckn?: string;
    receiverFirstName?: string;
    receiverSecondName?: string;
    receiverLastName?: string;
    amount: number;
    description: string;
}