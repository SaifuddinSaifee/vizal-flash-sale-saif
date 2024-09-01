const request = require("supertest");
const app = require("../app");
const Stock = require("../models/Stock");
const redisClient = require("../config/redis");

// Mock the Stock model and Redis client
jest.mock("../models/Stock");
jest.mock("../config/redis", () => ({
  quit: jest.fn().mockResolvedValue(),
}));

describe("Stock Management API", () => {
  // Clean up after all tests are done
  afterAll(async () => {
    await redisClient.quit();
  });

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/stock/initialize", () => {
    it("should initialize stock successfully", async () => {
      // Mock the setInitialStock method
      Stock.setInitialStock.mockResolvedValue();

      const response = await request(app)
        .post("/api/stock/initialize")
        .send({ quantity: 1000 });

      // Check response status and body
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Stock initialized with 1000 items",
      });

      // Verify that setInitialStock was called with the correct argument
      expect(Stock.setInitialStock).toHaveBeenCalledWith(1000);
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/api/stock/initialize")
        .send({ quantity: -1 });

      // Check response status and error message
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/stock/current", () => {
    it("should return current stock", async () => {
      // Mock the getStock method
      Stock.getStock.mockResolvedValue(500);

      const response = await request(app).get("/api/stock/current");

      // Check response status and body
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ stock: 500 });

      // Verify that getStock was called
      expect(Stock.getStock).toHaveBeenCalled();
    });
  });

  describe("POST /api/stock/reserve", () => {
    it("should reserve stock successfully", async () => {
      // Mock the decrementStock method
      Stock.decrementStock.mockResolvedValue(998);

      const response = await request(app)
        .post("/api/stock/reserve")
        .send({ quantity: 2, user_authentication_token: "valid_token" });

      // Check response status and body
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "2 items reserved",
        remainingStock: 998,
      });

      // Verify that decrementStock was called with the correct argument
      expect(Stock.decrementStock).toHaveBeenCalledWith(2);
    });

    it("should return 400 for invalid input (quantity > 2)", async () => {
      const response = await request(app)
        .post("/api/stock/reserve")
        .send({ quantity: 3, user_authentication_token: "valid_token" });

      // Check response status and error property
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");

      // Verify that decrementStock was not called
      expect(Stock.decrementStock).not.toHaveBeenCalled();
    });

    it("should return 400 for insufficient stock", async () => {
      // Mock decrementStock to return null (indicating insufficient stock)
      Stock.decrementStock.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/stock/reserve")
        .send({ quantity: 2, user_authentication_token: "valid_token" });

      // Check response status and body
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: "Insufficient stock",
      });

      // Verify that decrementStock was called
      expect(Stock.decrementStock).toHaveBeenCalledWith(2);
    });

    it("should return 400 for missing user_authentication_token", async () => {
      const response = await request(app)
        .post("/api/stock/reserve")
        .send({ quantity: 2 });

      // Check response status and error property
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");

      // Verify that decrementStock was not called
      expect(Stock.decrementStock).not.toHaveBeenCalled();
    });

    it("should return 500 for internal server error", async () => {
      // Mock decrementStock to throw an error
      Stock.decrementStock.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/stock/reserve")
        .send({ quantity: 2, user_authentication_token: "valid_token" });

      // Check response status and error message
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error");
    });
  });
});
