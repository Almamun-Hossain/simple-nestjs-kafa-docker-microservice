import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(createOrderDto);
    }

    @EventPattern('payment_processed')
    async handlePaymentProcessed(@Payload() message: any) {
        console.log('Received message:', JSON.stringify(message));
        const paymentData = message;
        console.log(`Received payment processed event for order ${paymentData.orderId}`);
        console.log(`Payment: ${JSON.stringify(paymentData)}`);
        return this.ordersService.updateOrderAfterPayment(paymentData);
    }
}
