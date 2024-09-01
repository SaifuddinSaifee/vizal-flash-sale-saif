const express = require('express');
const StockController = require('../controllers/stockController');
const validateRequest = require('../middleware/validation');

const router = express.Router();

router.post('/initialize', validateRequest('initializeStock'), StockController.initializeStock);
router.get('/current', StockController.getCurrentStock);
router.post('/reserve', validateRequest('reserveStock'), StockController.reserveStock);

module.exports = router;