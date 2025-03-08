# NestJS Kafka Microservices

A microservice architecture demo using NestJS and Apache Kafka for communication between services. This project demonstrates event-driven microservice communication with order and payment processing services.

## Project Overview

- **Order Service**: Handles order creation and updates order statuses based on payment results
- **Payment Service**: Processes payments and emits payment results to Kafka
- **Kafka**: Central message broker for all services

## Features

- Event-driven architecture using Kafka
- Asynchronous communication between microservices
- Resilient connections with retry mechanisms
- Mock payment processing with success/failure simulation

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Docker and Docker Compose

## Getting Started

### 1. Start Kafka with Docker Compose

```bash
# Start Kafka, Zookeeper, and Kafka UI
docker-compose up -d
```

This will start:

- Zookeeper (Kafka's coordination service)
- Kafka broker
- Kafka UI (web interface for monitoring)

### 2. Start the Order Service

```bash
# Navigate to order service directory
cd order-service

# Install dependencies
npm install

# Start in development mode
npm run start:dev
```

The Order Service will run on http://localhost:3000

### 3. Start the Payment Service

```bash
# Navigate to payment service directory
cd payment-service

# Install dependencies
npm install

# Start in development mode
npm run start:dev
```

The Payment Service will run on http://localhost:3001

## Testing the System

### Create an Order

Send a POST request to create a new order:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": 100.50,
    "products": ["product1", "product2"]
  }'
```

### Flow

1. Order service creates an order and publishes event to Kafka
2. Payment service consumes the order event and processes payment
3. Payment service publishes payment result event to Kafka
4. Order service consumes payment result and updates order status

## Monitoring Kafka

Access the Kafka UI at:

```
http://localhost:8080
```

This interface allows you to:

- View topics and messages
- Monitor consumer groups
- Check broker status
- Browse messages in each topic

## Project Structure

```
/
├── docker-compose.yml            # Kafka, Zookeeper, and UI setup
│
├── order-service/                # Order management service
│   ├── src/
│   │   ├── orders/
│   │   │   ├── dto/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── orders.module.ts
│   │   └── main.ts
│   └── package.json
│
└── payment-service/              # Payment processing service
    ├── src/
    │   ├── payments/
    │   │   ├── dto/
    │   │   ├── payments.controller.ts
    │   │   ├── payments.service.ts
    │   │   └── payments.module.ts
    │   └── main.ts
    └── package.json
```

## Troubleshooting

### Kafka Connection Issues

If services can't connect to Kafka:

```bash
# Check if Kafka container is running
docker ps | grep kafka

# Create topics manually if needed
docker exec -it kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic order_created
docker exec -it kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic payment_processed
```

### Service Logs

Monitor service logs for debugging:

```bash
# Order service logs
cd order-service && npm run start:dev

# Payment service logs
cd payment-service && npm run start:dev
```

## Running Tests

Each service has its own test suite:

```bash
# Order service tests
cd order-service && npm test

# Payment service tests
cd payment-service && npm test
```

## Conclusion

This NestJS Kafka microservice architecture provides a robust foundation for building scalable and resilient applications. By leveraging Kafka's asynchronous messaging capabilities, you can achieve high performance and fault tolerance in your microservices.

## License

MIT
