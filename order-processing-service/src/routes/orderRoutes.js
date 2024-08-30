const express = require('express');
const OrderController = require('../controllers/orderController');
const validateRequest = require('../middleware/validation');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticateUser, validateRequest('createOrder'), OrderController.createOrder);
router.get('/:orderId', authenticateUser, OrderController.getOrder);

module.exports = router;