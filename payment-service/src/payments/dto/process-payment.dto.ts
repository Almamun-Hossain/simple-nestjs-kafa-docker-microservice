export class ProcessPaymentDto {
    orderId: string;
    userId: string;
    amount: number;
    products: string[];
    status: string;
    timestamp: string;
}
