const fetch = require('node-fetch');
const StockService = require('../../services/stockService');

// Mock dependencies
jest.mock('node-fetch');

describe('StockService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reserveStock', () => {
    it('should successfully reserve stock', async () => {
      // Arrange
      const quantity = 2;
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      // Act
      const result = await StockService.reserveStock(quantity);

      // Assert
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/reserve'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ quantity })
      }));
    });

    it('should return false when reservation fails', async () => {
      // Arrange
      const quantity = 2;
      fetch.mockResolvedValue({
        ok: false,
        status: 400
      });

      // Act
      const result = await StockService.reserveStock(quantity);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when an error occurs', async () => {
      // Arrange
      const quantity = 2;
      fetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await StockService.reserveStock(quantity);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('revertStockReservation', () => {
    it('should successfully revert stock reservation', async () => {
      // Arrange
      const quantity = 2;
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      // Act
      const result = await StockService.revertStockReservation(quantity);

      // Assert
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/revert'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ quantity })
      }));
    });

    it('should return false when reversion fails', async () => {
      // Arrange
      const quantity = 2;
      fetch.mockResolvedValue({
        ok: false,
        status: 400
      });

      // Act
      const result = await StockService.revertStockReservation(quantity);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when an error occurs', async () => {
      // Arrange
      const quantity = 2;
      fetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await StockService.revertStockReservation(quantity);

      // Assert
      expect(result).toBe(false);
    });
  });
});