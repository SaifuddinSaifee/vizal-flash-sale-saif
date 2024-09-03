const request = require("supertest");
const { app, startServer } = require("../app");
const config = require("../config");
const jwt = require("jsonwebtoken");

// Mock the ApiService
jest.mock("../services/apiService", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const apiService = require("../services/apiService");

// Mock the auth middleware
jest.mock("../middleware/auth", () => (req, res, next) => {
  if (req.headers.authorization) {
    req.user = { id: "testuser" };
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

describe("Order Routes", () => {
  let server;

  beforeAll(async () => {
    server = await startServer(0); // Use port 0 to get a random available port
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  const generateToken = () =>
    jwt.sign({ userId: "123", role: "user" }, config.jwtSecret);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/orders/create", () => {
    it("should create an order successfully", async () => {
      apiService.get.mockResolvedValueOnce({ data: { available: 10 } });
      apiService.post.mockResolvedValueOnce({ data: { success: true } });
      apiService.post.mockResolvedValueOnce({
        data: { orderId: "order123", status: "created" },
      });

      const response = await request(app)
        .post("/api/orders/create")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 2 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("orderId", "order123");
      expect(apiService.get).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/current`
      );
      expect(apiService.post).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/reserve`,
        { quantity: 2 }
      );
      expect(apiService.post).toHaveBeenCalledWith(
        `${config.orderServiceUrl}/api/orders/create`,
        expect.any(Object)
      );
    });

    it("should return 400 when stock is insufficient", async () => {
      apiService.get.mockResolvedValueOnce({ data: { available: 1 } });

      const response = await request(app)
        .post("/api/orders/create")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 2 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Insufficient stock");
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .post("/api/orders/create")
        .send({ quantity: 2 });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/orders/:orderId", () => {
    it("should get an order successfully", async () => {
      apiService.get.mockResolvedValueOnce({
        data: { orderId: "order123", status: "completed" },
      });

      const response = await request(app)
        .get("/api/orders/order123")
        .set("Authorization", `Bearer ${generateToken()}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("orderId", "order123");
      expect(apiService.get).toHaveBeenCalledWith(
        `${config.orderServiceUrl}/api/orders/order123`
      );
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app).get("/api/orders/order123");

      expect(response.status).toBe(401);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors from stock service", async () => {
      apiService.get.mockRejectedValueOnce(new Error("Stock service error"));

      const response = await request(app)
        .post("/api/orders/create")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 2 });

      expect(response.status).toBe(500);
    });

    it("should handle errors from order service", async () => {
      apiService.get.mockRejectedValueOnce(new Error("Order service error"));

      const response = await request(app)
        .get("/api/orders/order123")
        .set("Authorization", `Bearer ${generateToken()}`);

      expect(response.status).toBe(500);
    });
  });
});
