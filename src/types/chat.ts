// src/types/chat.types.ts
export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType =
    | 'text'
    | 'bank_name_list'
    | 'account_selection'
    | 'transaction_list'
    | 'transfer_confirmation'
    | 'transfer_result'
    | 'atm_list'
    | 'qr_code'
    | 'saved_accounts_selection';

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    type?: MessageType;
    timestamp: Date;
    data?: any;
    isStreaming?: boolean;
}

export type AttachmentType = 'account' | 'saved_account' | 'recipient' | 'bank' | 'location';

export interface InputAttachment {
    id: string;
    type: AttachmentType;
    label: string;
    contextText: string;
    data: any;
}

export interface Bank {
    name: string;
    logo?: string;
}

export interface UserAccount {
    id: string;
    iban: string;
    name: string;
    balance: number;
    currency: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    date: string;
    merchantName: string;
}

export interface SavedAccount {
    id: string;
    nickname: string;
    accountIBAN: string;
    firstName: string;
    lastName: string;
}

export interface ATM {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    address: string;
    status: string;
    distance?: string;
}

export interface ChatNotificationSendRequest {
    message: string;
    type: string;
    title: string;
    userId: string;
    level: string;
    arguments: Record<string, any>;
    time: string;
}
