import {BaseResponse} from "@/src/types/response";

export type CardType = 'CREDIT' | 'DEBIT';
export type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'TROY';
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'PENDING_APPROVAL' | 'CANCELLED';

export interface Card {
    id: string;
    cardNumber: string;
    lastFourDigits: string;
    cardHolderName: string;
    expirationDate: string;
    cvv: string; //TODO: DEPRECATED
    expiryDate: string;
    type: CardType;
    status: CardStatus;
    network: CardNetwork;
    availableAmount:number;
    limitAmount:number;

    balance?: number;
    creditLimit?: number;
    usedCredit?: number;
}
export interface CardListResponse extends BaseResponse{
    carts: Card[];
    success?: boolean;
    message?: string;
}

export interface CreateCardRequest {
    accountId: string;
    cardType: CardType;
    cardNetwork: CardNetwork;
    cardHolderName: string;
}

export interface GetCardListRequest {
    accountId: string;
}