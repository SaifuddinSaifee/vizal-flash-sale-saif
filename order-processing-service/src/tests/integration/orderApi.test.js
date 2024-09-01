// src/tests/integration/orderApi.test.js

const request = require("supertest");
const { MongoClient, ObjectId } = require("mongodb");
const { app, connectToDb, getDb } = require("../../app");
const stockService = require("../../services/stockService");

jest.mock("../../services/stockService");

describe("Order API", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/flipzon_test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    db = await connection.db();
    await connectToDb();
  });

  afterAll(async () => {
    await connection.close();
    // Add a small delay to ensure all connections are properly closed
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  beforeEach(async () => {
    await db.collection("orders").deleteMany({});
  });

  describe("POST /api/orders/create", () => {
    it("should create an order when stock is available", async () => {
      stockService.reserveStock.mockResolvedValue(true);
      const orderData = { userId: "user123", quantity: 2 };

      const response = await request(app)
        .post("/api/orders/create")
        .set("user_authentication_token", "valid_token")
        .send(orderData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        orderId: expect.any(String),
        message: "Order placed successfully",
      });

      // Verify order was actually created in the database
      const createdOrder = await db
        .collection("orders")
        .findOne({ userId: "user123" });
      expect(createdOrder).toBeTruthy();
      expect(createdOrder.quantity).toBe(2);
    });

    it("should return 400 when stock is unavailable", async () => {
      stockService.reserveStock.mockResolvedValue(false);
      const orderData = { userId: "user123", quantity: 2 };

      const response = await request(app)
        .post("/api/orders/create")
        .set("user_authentication_token", "valid_token")
        .send(orderData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: "Insufficient stock",
      });
    });

    it("should return 400 for invalid input", async () => {
      const invalidOrderData = { userId: "user123", quantity: 3 };

      const response = await request(app)
        .post("/api/orders/create")
        .set("user_authentication_token", "valid_token")
        .send(invalidOrderData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 when authentication token is missing", async () => {
      const orderData = { userId: "user123", quantity: 2 };

      const response = await request(app)
        .post("/api/orders/create")
        .send(orderData);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: "Authentication required" });
    });
  });

  describe("GET /api/orders/:orderId", () => {
    it("should return an order when it exists", async () => {
      const mockOrder = {
        userId: "user123",
        quantity: 2,
        status: "created",
        createdAt: new Date(),
      };
      const insertResult = await db.collection("orders").insertOne(mockOrder);
      const orderId = insertResult.insertedId.toString();

      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("user_authentication_token", "valid_token");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        order: expect.objectContaining({
          userId: "user123",
          quantity: 2,
          status: "created",
        }),
      });
    });

    it("should return 404 when order does not exist", async () => {
      const nonExistentId = new ObjectId().toString();

      const response = await request(app)
        .get(`/api/orders/${nonExistentId}`)
        .set("user_authentication_token", "valid_token");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Order not found",
      });
    });

    it("should return 401 when authentication token is missing", async () => {
      const response = await request(app).get("/api/orders/someid");

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: "Authentication required" });
    });

    it("should return 400 for invalid orderId format", async () => {
      const response = await request(app)
        .get("/api/orders/invalidid")
        .set("user_authentication_token", "valid_token");

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Error Handling", () => {
    it("should handle internal server errors gracefully", async () => {
      // Simulate an internal server error
      jest
        .spyOn(getDb().collection("orders"), "findOne")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/orders/5f7b1a5b9d3e2a1b1c9d1e1f")
        .set("user_authentication_token", "valid_token");

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});
