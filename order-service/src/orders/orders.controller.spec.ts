import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClientKafka } from '@nestjs/microservices';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    createOrder: jest.fn(),
    updateOrderAfterPayment: jest.fn()
  };

  const mockKafkaClient = {
    emit: jest.fn(),
    connect: jest.fn(),
    subscribeToResponseOf: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient
        }
      ]
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto = {
      userId: 'user1',
      products: ['product1'],
      amount: 100
    };

    const expectedResponse = {
      message: 'Order created successfully',
      orderId: expect.any(String),
      status: 'PENDING'
    };

    it('should create an order successfully', async () => {
      mockOrdersService.createOrder.mockResolvedValue(expectedResponse);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(expectedResponse);
      expect(mockOrdersService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('handlePaymentProcessed', () => {
    const paymentData = {
      orderId: 'ORD-123',
      status: 'completed',
      userId: 'user1',
      amount: 100,
      products: ['product1'],
      timestamp: new Date().toISOString()
    };

    const expectedResponse = {
      orderId: 'ORD-123',
      status: 'completed',
      updatedAt: expect.any(String)
    };

    it('should handle payment processed event', async () => {
      mockOrdersService.updateOrderAfterPayment.mockResolvedValue(expectedResponse);

      const result = await controller.handlePaymentProcessed(paymentData);

      expect(result).toEqual(expectedResponse);
      expect(mockOrdersService.updateOrderAfterPayment).toHaveBeenCalledWith(paymentData);
    });
  });
});
