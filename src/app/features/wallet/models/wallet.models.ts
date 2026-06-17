export interface WalletResponseDto {
    walletId: number;
    userId: number;
    balance: number;
    updatedAt: string;
}

export interface TransactionResponseDto {
    id: number;
    type: string;
    amount: number;
    description: string;
    orderId: number | null;
    createdAt: string;
}

export interface PagedTransactionDto {
    transactions: TransactionResponseDto[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
}

export interface TopUpRequestDto {
    userId: number;
    amount: number;
}

export type WalletResponse = WalletResponseDto;
