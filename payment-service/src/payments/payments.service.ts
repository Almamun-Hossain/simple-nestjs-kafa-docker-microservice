import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @Inject("KAFKA_SERVICE") private readonly kafkaClient: ClientKafka
    ) { }

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('payment_processed');

        let retries = 5;
        while (retries > 0) {
            try {
                await this.kafkaClient.connect();
                this.logger.log('Successfully connected to Kafka');
                break;
            } catch (error) {
                this.logger.error(`Failed to connect to Kafka: ${error.message}`);
                retries--;
                if (retries === 0) {
                    this.logger.error('Max retries reached, could not connect to Kafka');
                } else {
                    this.logger.log(`Retrying in 5 seconds... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
    }

    async processPayment(payment: ProcessPaymentDto) {
        this.logger.log(`Processing payment for order ${payment.orderId}`);

        const paymentSuccessful = Math.random() > 0.2;
        const paymentResult = {
            orderId: payment.orderId,
            userId: payment.userId,
            amount: payment.amount,
            products: payment.products,
            status: paymentSuccessful ? 'completed' : 'failed',
            timestamp: new Date().toISOString(),
        };

        try {
            this.kafkaClient.emit('payment_processed', paymentResult);
            this.logger.log(`Payment result sent to Kafka for order ${payment.orderId}`);
        } catch (error) {
            this.logger.error(`Failed to emit payment result to Kafka: ${error.message}`);
        }

        return paymentResult;
    }
}