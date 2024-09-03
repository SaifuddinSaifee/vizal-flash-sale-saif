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

describe("Stock Routes", () => {
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

  describe("GET /api/stock/current", () => {
    it("should return current stock", async () => {
      apiService.get.mockResolvedValueOnce({ data: { available: 100 } });

      const response = await request(app).get("/api/stock/current");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ available: 100 });
      expect(apiService.get).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/current`
      );
    });

    it("should handle service unavailable error", async () => {
      const error = new Error("Service Unavailable");
      error.code = "EAI_AGAIN";
      apiService.get.mockRejectedValueOnce(error);

      const response = await request(app).get("/api/stock/current");

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        error: "Service temporarily unavailable",
      });
    });

    it("should handle internal server error", async () => {
      apiService.get.mockRejectedValueOnce(new Error("Internal Server Error"));

      const response = await request(app).get("/api/stock/current");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST /api/stock/initialize", () => {
    it("should initialize stock successfully", async () => {
      apiService.post.mockResolvedValueOnce({
        data: { success: true, initialStock: 1000 },
      });

      const response = await request(app)
        .post("/api/stock/initialize")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 1000 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, initialStock: 1000 });
      expect(apiService.post).toHaveBeenCalledWith(
        `${config.stockServiceUrl}/api/stock/initialize`,
        { quantity: 1000 }
      );
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .post("/api/stock/initialize")
        .send({ quantity: 1000 });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    it("should handle service unavailable error", async () => {
      const error = new Error("Service Unavailable");
      error.code = "EAI_AGAIN";
      apiService.post.mockRejectedValueOnce(error);

      const response = await request(app)
        .post("/api/stock/initialize")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 1000 });

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        error: "Service temporarily unavailable",
      });
    });
  });

  describe("POST /api/stock/reserve", () => {
    it("should reserve stock successfully", async () => {
      apiService.post.mockResolvedValueOnce({
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
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    it("should handle service unavailable error", async () => {
      const error = new Error("Service Unavailable");
      error.code = "EAI_AGAIN";
      apiService.post.mockRejectedValueOnce(error);

      const response = await request(app)
        .post("/api/stock/reserve")
        .set("Authorization", `Bearer ${generateToken()}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        error: "Service temporarily unavailable",
      });
    });
  });
});
