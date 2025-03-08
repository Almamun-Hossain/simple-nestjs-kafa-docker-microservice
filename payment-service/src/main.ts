import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Connect to Kafka with retry logic
  let connected = false;
  let retries = 5;

  while (!connected && retries > 0) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment',
            brokers: ['localhost:9092'],
            retry: {
              initialRetryTime: 1000,
              retries: 8
            },
          },
          consumer: {
            groupId: 'payment-consumer',
          },
        },
      });

      await app.startAllMicroservices();
      connected = true;
      logger.log('Successfully connected to Kafka microservice');
    } catch (error) {
      logger.error(`Failed to connect to Kafka: ${error.message}`);
      retries--;
      if (retries === 0) {
        logger.error('Max retries reached, could not connect to Kafka');
      } else {
        logger.log(`Retrying in 5 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  await app.listen(3001);
  logger.log('Payment service running on port 3001');
}

bootstrap();
