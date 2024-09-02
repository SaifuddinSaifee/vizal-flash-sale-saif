const request = require("supertest");
const app = require("../app");
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

describe("Stock Routes", () => {
  const generateToken = () =>
    jwt.sign({ userId: "123", role: "user" }, config.jwtSecret);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/stock/current", () => {
    it("should return current stock", async () => {
      apiService.get.mockResolvedValue({ data: { stock: 100 } });

      const response = await request(app).get("/api/stock/current");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ stock: 100 });
      expect(apiService.get).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/current`
      );
    });

    it("should handle service unavailable error", async () => {
      const error = new Error("Service unavailable");
      error.code = "EAI_AGAIN";
      apiService.get.mockRejectedValue(error);

      const response = await request(app).get("/api/stock/current");

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        error: "Service temporarily unavailable",
      });
    });
  });

  describe("POST /api/stock/initialize", () => {
    it("should initialize stock", async () => {
      apiService.post.mockResolvedValue({
        data: { success: true, message: "Stock initialized" },
      });

      const response = await request(app)
        .post("/api/stock/initialize")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 100 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Stock initialized",
      });
      expect(apiService.post).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/initialize`,
        { quantity: 100 }
      );
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .post("/api/stock/initialize")
        .send({ quantity: 100 });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/stock/reserve", () => {
    it("should reserve stock", async () => {
      apiService.post.mockResolvedValue({
        data: { success: true, reserved: 5 },
      });

      const response = await request(app)
        .post("/api/stock/reserve")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, reserved: 5 });
      expect(apiService.post).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/reserve`,
        { quantity: 5 }
      );
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .post("/api/stock/reserve")
        .send({ quantity: 5 });

      expect(response.status).toBe(401);
    });
  });

  describe("Error handling", () => {
    it("should handle stock service errors", async () => {
      apiService.get.mockRejectedValue({
        response: { status: 500, data: { error: "Service error" } },
      });

      const response = await request(app).get("/api/stock/current");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});
