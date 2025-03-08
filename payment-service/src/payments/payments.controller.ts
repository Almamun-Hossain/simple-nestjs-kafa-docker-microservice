import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @EventPattern('order_created')
    async handleOrderCreated(@Payload() message: any) {
        console.log('Received message:', JSON.stringify(message));

        const orderData = message;

        console.log(`Received order created event for order ${orderData.orderId}`);
        console.log(`Order: ${JSON.stringify(orderData)}`);

        return this.paymentsService.processPayment(orderData);
    }
}
