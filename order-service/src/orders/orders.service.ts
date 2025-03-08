import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    private readonly orders: { [key: string]: any } = {};

    constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) { }

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('order_created');
        await this.kafkaClient.connect();
    }

    async createOrder(createOrderDto: CreateOrderDto) {
        const orderId = `ORD-${Date.now()}`;
        const order = {
            ...createOrderDto,
            orderId,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        this.kafkaClient.emit('order_created', order);

        return {
            message: 'Order created successfully',
            orderId,
            status: 'PENDING'
        };
    }

    async updateOrderAfterPayment(paymentResult) {
        const { orderId, status } = paymentResult;

        if (!this.orders[orderId]) {
            this.logger.warn(`Received payment for unknown order: ${orderId}`);
            return;
        }

        // Update the order status based on payment result
        this.orders[orderId].status = status;
        this.orders[orderId].updatedAt = new Date().toISOString();

        this.logger.log(`Order ${orderId} updated with status: ${status}`);

        return this.orders[orderId];
    }

    // Optional: Add a method to get order status
    async getOrderStatus(orderId: string) {
        if (!this.orders[orderId]) {
            return { error: 'Order not found' };
        }
        return this.orders[orderId];
    }
}
