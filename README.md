# System Achitecture

![System Architecture](<assets/System Architecture.svg>)

# Setup

## Testing Locally

1. Clone the repo:

```
git clone https://github.com/SaifuddinSaifee/vizal-flash-sale-saif.git
cd vizal-flash-sale-saif
```

2. To run the tests for each service locally

**Test api-gateway service**

```
cd api-gateway
npm install
npm test
```

**Test auth-service service** 

```
cd auth-service
npm install
npm test
```

**Test order-processing-service service** 

```
cd order-processing-service
npm install
npm test
```

**Test stock-management-service service** 

```
cd stock-management-service
npm install
npm test
```


## Testing with docker

1. Make sure you are in the root directory

2. Execute the following cammand to build and run the containers

```
docker compose up --build
```

3. To run the test locally: `docker compose exec <service name> npm test`

```
docker compose exec api-gateway npm test
docker compose exec auth-service npm test
docker compose exec order-processing-service npm test
docker compose exec stock-management-service npm test
```

## Testing with K8s

1. Make sure you are in the root directory

2. Start a minikube with 

```
minikube start
```

3. After setting up a cluster, make sure kubectl is configured to use it

```
kubectl config view
```

4. Create the namespace separately

```
kubectl create namespace flash-sale
```

5. Once you have a working Kubernetes cluster, apply the manifests

```
kubectl apply -f k8s/ --namespace=flash-sale
```

or 

```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/jwt-secret.yaml -n flash-sale
kubectl apply -f k8s/mongodb.yaml -n flash-sale
kubectl apply -f k8s/redis.yaml -n flash-sale
kubectl apply -f k8s/api-gateway.yaml -n flash-sale
kubectl apply -f k8s/auth-service.yaml -n flash-sale
kubectl apply -f k8s/order-processing.yaml -n flash-sale
kubectl apply -f k8s/stock-management.yaml -n flash-sale
kubectl apply -f k8s/ingress.yaml -n flash-sale
kubectl apply -f k8s/hpa.yaml -n flash-sale
```

6. After applying these, Check the status of the resources

```
kubectl get all -n flash-sale
```

7. To monitor the auto-scaling in action

```
kubectl get hpa -n flash-sale -w
```

8. To scale any service horizontally, you can use the `kubectl scale` command.

```
kubectl scale deployment api-gateway -n flash-sale --replicas=5
```

Below mentioned an outline of how this backend system aims to work.

# Flash Sale System Assumptions

1. Sale Specifics:
   - The flash sale is for 1000 iPhones.
   - The sale starts at 12 AM on an upcoming Sunday.
   - The sale lasts until all items are sold out or a predefined end time is reached.

2. User Authentication:
   - All requests contain a user_authentication_token for identifying customers.
   - No need to implement a full authentication system; we assume tokens are valid.

3. Stock Management:
   - Redis is used as the single source of truth for real-time stock levels.
   - Stock updates are atomic operations to prevent overselling or underselling.

4. Order Processing:
   - Only Cash on Delivery (CoD) is available; no payment gateway integration is required.
   - An order is considered successful once it's recorded in the system, regardless of future payment status.

5. Database:
   - MongoDB is used for persistent storage of order information and other non-real-time data.
   - We use a MongoDB replica set for data redundancy and read scaling, not sharding.

6. API and Scalability:
   - The system starts with a single API server but is designed to scale horizontally.
   - Auto-scaling is implemented to add or remove API server instances based on load.

7. Caching:
   - Redis is used for caching frequently accessed data beyond just stock information.

8. Concurrency:
   - The system is designed to handle high concurrency, potentially thousands of simultaneous requests.

9. Fairness:
   - The system operates on a first-come, first-served basis for order processing.
   - There's a limit on the number of items a single user can purchase (e.g., maximum of 2 per user).

10. Monitoring and Logging:
    - All system components emit logs and metrics for centralized collection and analysis.

11. Error Handling:
    - The system implements compensating transactions to maintain consistency in case of failures.

12. Performance:
    - The system aims for sub-second response times for most operations under normal load.

13. Data Consistency:
    - Strong consistency is maintained for stock levels.
    - Eventual consistency is acceptable for order data stored in MongoDB.

14. Security:
    - Basic rate limiting is implemented to prevent abuse.
    - All sensitive data is encrypted in transit and at rest.

15. Deployment:
    - All components, including Redis and MongoDB, are containerized for consistent deployment.
    - Kubernetes is used for container orchestration.

16. Network and Infrastructure:
    - A CDN is used for serving static content.

17. Recovery and Backup:
    - Regular backups of MongoDB data are performed.

18. Load Testing:
    - *(Yet To implemement)* The system will undergo thorough load testing to simulate flash sale conditions before going live.

# Flash Sale Functional Requirements

1. Sale Scheduling:
   - API to set up the flash sale with start time, duration, and initial stock.
   - Automated start and end of the sale based on the scheduled time and stock availability.

2. Stock Management:
   - Real-time tracking of available stock.
   - API to check current stock levels.
   - Mechanism to prevent overselling.

3. Order Processing:
   - API to place orders during the flash sale.
   - Implement a queuing system to handle concurrent order requests fairly.
   - Validate order requests against remaining stock and customer purchase limits.

4. Customer Fairness:
   - Implement a "first-come, first-served" basis for order processing.
   - Limit purchases to a maximum of 2 iPhones per customer.
   - Implement a waiting list system for customers if initial order fails due to stock depletion.

5. Database Operations:
   - Store sale details including start time, duration, and initial stock.
   - Record all successful transactions with customer details, order time, and quantity.
   - Maintain a log of stock changes throughout the sale.

6. Real-time Updates:
   - Provide an API for clients to get real-time updates on stock levels.
   - Implement WebSocket connections for pushing stock updates to connected clients.

7. Sale Closure:
   - *(Yet To implemement)* Automatically close the sale when stock depletes or the scheduled end time is reached.
   - *(Yet To implemement)* Provide a summary API to get sale statistics after closure.

8. Error Handling:
   - Implement robust error handling for various scenarios (e.g., out of stock, sale not started, sale ended).
   - Provide clear error messages to the client for different error states.

# Flash Sale Non-Functional Requirements

1. *(Yet To implemement)* Performance:
   - The system should handle at least 10,000 concurrent users.
   - API response time should be under 200ms for 95% of requests.
   - The system should process at least 1000 orders per second at peak load.

2. Scalability:
   - Horizontal scaling capability to handle increased load.
   - Ability to scale database reads and writes independently.

3. Availability:
   - 99.99% uptime during the flash sale period.
   - Implement fault tolerance and failover mechanisms.

4. Consistency:
   - Ensure strong consistency for stock updates and order processing.
   - Implement distributed locking to prevent race conditions.

5. *(Yet To implemement)* Security:
   - Implement rate limiting to prevent DDoS attacks.
   - Secure all API endpoints with proper authentication and authorization.
   - Encrypt sensitive data in transit and at rest.

6. Monitoring and Logging:
   - Real-time monitoring of system health, performance metrics, and error rates.
   - Comprehensive logging for auditing and debugging purposes.

7. Latency:
   - Minimize latency for stock checks and order placements.
   - Implement caching strategies to reduce database load.

8. Resilience:
   - The system should gracefully handle and recover from failures.

9. Maintainability:
    - Write clean, well-documented code following best practices.
    - Implement comprehensive unit and integration tests.
    - Use containerization (Docker) for easy deployment and scaling.