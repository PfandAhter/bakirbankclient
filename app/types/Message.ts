export type MessageRole = 'user' | 'assistant';

export type MessageType =
    | 'text'                // basit metin mesajı
    | 'account_selection'   // butonlarla hesap seçimi
    | 'transaction_list'    // tablo/list formatında işlem geçmişi
    | 'notification'        // bildirim mesajı (ör. websocket)
    | 'qr'                  // QR kod gösterimi
    | 'form'                // dinamik form (ileride)
    | 'custom'          // genişletilebilir özel tipler
    | 'saved_account_selection'   // ✅ yeni
    | 'confirm_transfer'         // ✅ yeni
    | 'get_user_accounts'
    | 'get_saved_accounts_for_transfer'
    | 'get_saved_accounts'
    | 'bank_name_list'
    | 'get_nearest_atm';

export interface BaseMessage {
    id: string;
    role: MessageRole;
    type: MessageType;
    content?: string; // text tabanlı içeriğe sahip olanlar için
    timestamp?: string;
}

export interface AccountSelectionMessage extends BaseMessage {
    type: 'get_user_accounts';
    data: {
        accounts: {
            id: string;
            name: string;
            iban: string;
            balance: number;
            currency: string;
        }[];
    };
}

export interface TransactionListMessage extends BaseMessage {
    type: 'transaction_list';
    data: {
        transactions: {
            id: string;
            description: string;
            amount: number;
            type: 'INCOME' | 'EXPENSE';
            date: string;
        }[];
    };
}

export interface NotificationMessage extends BaseMessage {
    type: 'notification';
    title: string;
    message: string;
    level: 'info' | 'success' | 'warning' | 'error';
}

export interface QRMessage extends BaseMessage {
    type: 'qr';
    data: string; // QR encode edilecek veri
    label?: string;
}

export type Message =
    | BaseMessage
    | AccountSelectionMessage
    | TransactionListMessage
    | NotificationMessage
    | QRMessage;