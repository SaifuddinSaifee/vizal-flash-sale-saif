const orderService = require('../../services/orderService');
const Order = require('../../models/Order');
const stockService = require('../../services/stockService');

// Mock dependencies
jest.mock('../../models/Order');
jest.mock('../../services/stockService');

describe("orderService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create an order successfully when stock is available", async () => {
      // Arrange
      const userId = "user123";
      const quantity = 2;
      const orderId = "order123";
      stockService.reserveStock.mockResolvedValue(true);
      Order.create.mockResolvedValue(orderId);

      // Act
      const result = await orderService.createOrder(userId, quantity);

      // Assert
      expect(result).toEqual({
        success: true,
        orderId,
        message: "Order placed successfully",
      });
      expect(stockService.reserveStock).toHaveBeenCalledWith(quantity);
      expect(Order.create).toHaveBeenCalledWith({
        userId,
        quantity,
        status: "created",
      });
    });

    it("should return failure when stock is unavailable", async () => {
      // Arrange
      const userId = "user123";
      const quantity = 2;
      stockService.reserveStock.mockResolvedValue(false);

      // Act
      const result = await orderService.createOrder(userId, quantity);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Insufficient stock",
      });
      expect(stockService.reserveStock).toHaveBeenCalledWith(quantity);
      expect(Order.create).not.toHaveBeenCalled();
    });

    it("should revert stock reservation if order creation fails", async () => {
      // Arrange
      const userId = "user123";
      const quantity = 2;
      stockService.reserveStock.mockResolvedValue(true);
      Order.create.mockRejectedValue(new Error("Database error"));
      stockService.revertStockReservation.mockResolvedValue(true);

      // Act & Assert
      await expect(orderService.createOrder(userId, quantity)).rejects.toThrow(
        "Database error"
      );
      expect(stockService.reserveStock).toHaveBeenCalledWith(quantity);
      expect(Order.create).toHaveBeenCalled();
      expect(stockService.revertStockReservation).toHaveBeenCalledWith(
        quantity
      );
    });
  });

  describe("getOrder", () => {
    it("should return an order when it exists", async () => {
      // Arrange
      const orderId = "order123";
      const orderData = { _id: orderId, userId: "user123", quantity: 2 };
      Order.getById.mockResolvedValue(orderData);

      // Act
      const result = await orderService.getOrder(orderId);

      // Assert
      expect(result).toEqual({
        success: true,
        order: orderData,
      });
      expect(Order.getById).toHaveBeenCalledWith(orderId);
    });

    it("should return failure when order does not exist", async () => {
      // Arrange
      const orderId = "nonexistent";
      Order.getById.mockResolvedValue(null);

      // Act
      const result = await orderService.getOrder(orderId);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Order not found",
      });
      expect(Order.getById).toHaveBeenCalledWith(orderId);
    });
  });
});
