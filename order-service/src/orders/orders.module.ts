import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "order",
            brokers: ["localhost:9092"],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        }
      }
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {

}
