const express = require('express');
const StockController = require('../controllers/stockController');
const validateRequest = require('../middleware/validation');

const router = express.Router();

router.post('/initialize', validateRequest('initializeStock'), StockController.initializeStock);
router.get('/current', stockController.getCurrentStock);
router.post('/reserve', (req, res, next) => {
  // Add user ID from the authenticated request
  req.body.userId = req.user.userId;
  stockController.reserveStock(req, res, next);
});

module.exports = router;